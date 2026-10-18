"""Official Codex CLI, fresh filesystem/process isolation; no credential exports."""
from pathlib import Path
from datetime import datetime, timezone
import json
import os
import selectors
import queue
import threading
import signal
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parent
RESEARCH = ROOT.parent
ENV_ALLOW = {'HOME','USER','LOGNAME','LANG','LC_ALL','TZ','SSL_CERT_FILE','SSL_CERT_DIR','CODEX_CA_CERTIFICATE'}
DISABLED = ['shell_tool','unified_exec','shell_snapshot','apps','plugins','remote_plugin',
    'recommended_plugins','skill_search','memories','external_agent_memory_import',
    'multi_agent','multi_agent_v2','browser_use','browser_use_external','computer_use',
    'image_generation','view_image','code_mode','code_mode_host','code_mode_only',
    'code_mode_prewarm','goals','sleep_tool','daemon_auto_start','realtime_conversation',
    'hooks','tool_suggest','unbounded_connection_retries','workspace_dependencies']


def now():
    return datetime.now(timezone.utc).isoformat()


def env():
    value = {k:v for k,v in os.environ.items() if k in ENV_ALLOW}
    value['PATH'] = '/usr/bin:/bin'
    if 'CODEX_HOME' in os.environ:
        value['CODEX_HOME'] = os.environ['CODEX_HOME']
    return value


def options(policy, evaluation=False):
    settings = {
        'model':policy['model'], 'model_provider':'library-isolated',
        'model_reasoning_effort':policy['evaluation_reasoning_effort'] if evaluation else policy['generation_reasoning_effort'],
        'forced_login_method':'chatgpt','approval_policy':'never','sandbox_mode':'read-only',
        'web_search':'disabled','project_doc_max_bytes':0,'skills.include_instructions':False,
        'skills.bundled.enabled':False,'include_apps_instructions':False,
        'memories.generate_memories':False,'memories.use_memories':False,
        'memories.dedicated_tools':False,'tools.update_plan.enabled':False,
        'allow_login_shell':False,'check_for_update_on_startup':False,
        'model_instructions_file':'/opt/base-instructions.txt',
        'model_providers.library-isolated.name':'OpenAI ChatGPT isolated pilot',
        'model_providers.library-isolated.base_url':policy['endpoint'],
        'model_providers.library-isolated.wire_api':'responses',
        'model_providers.library-isolated.requires_openai_auth':True,
        'model_providers.library-isolated.request_max_retries':0,
        'model_providers.library-isolated.stream_max_retries':0,
    }
    args=[]
    for key,value in settings.items(): args += ['-c',key+'='+json.dumps(value)]
    for feature in DISABLED: args += ['--disable',feature]
    return args


def isolated(policy, output, args, raw=False):
    home=Path(os.environ.get('CODEX_HOME',str(Path.home()/'.codex'))).resolve()
    cmd=[policy['bwrap_binary'],'--die-with-parent','--new-session','--unshare-user','--unshare-pid','--unshare-ipc','--unshare-uts']
    for name in ['/usr','/lib','/lib64','/bin','/sbin','/etc']:
        if Path(name).exists(): cmd+=['--ro-bind',name,name]
    cmd+=['--proc','/proc','--dev','/dev','--tmpfs','/tmp','--dir',str(Path.home()),'--dir',str(home),
          '--dir','/work','--dir','/opt','--ro-bind',policy['codex_binary'],'/opt/codex',
          '--ro-bind',str(ROOT/'base-instructions.txt'),'/opt/base-instructions.txt',
          '--bind',str(home/'auth.json'),str(home/'auth.json')]
    for name in ['requirements.toml','managed_config.toml','rules']:
        if (home/name).exists(): cmd+=['--ro-bind',str(home/name),str(home/name)]
    for key in ['SSL_CERT_FILE','SSL_CERT_DIR','CODEX_CA_CERTIFICATE']:
        val=env().get(key)
        if val and Path(val).exists() and not val.startswith(('/usr/','/etc/')):cmd+=['--ro-bind',val,val]
    cmd+=['--bind',str(output),'/out','--chdir','/work']
    return cmd+(args if raw else ['/opt/codex','--no-daemon']+args)


def limits(policy, directory):
    """No inference: read included allowance without purchasing/resetting credits."""
    p=subprocess.Popen(isolated(policy,directory,['app-server','--stdio']+options(policy)),
        stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,env=env(),bufsize=1)
    def send(msg):p.stdin.write(json.dumps(msg)+'\n');p.stdin.flush()
    send({'id':0,'method':'initialize','params':{'clientInfo':{'name':'library_pilot','version':'1.0'}}})
    result={'checked_at_utc':now(),'source':'Codex account/rateLimits/read','inference_started':False}
    selector=selectors.DefaultSelector();selector.register(p.stdout,selectors.EVENT_READ)
    end=time.monotonic()+30
    try:
        while time.monotonic()<end:
            if not selector.select(1):continue
            line=p.stdout.readline()
            if not line:break
            msg=json.loads(line)
            if msg.get('id')==0:
                if 'error' in msg:result['error']=msg['error'];break
                send({'method':'initialized','params':{}})
                send({'id':1,'method':'account/rateLimits/read'})
            elif msg.get('id')==1:
                if 'error' in msg: result['error']=msg['error']
                else:
                    # Deliberately omit account identity and credits objects.
                    raw=msg['result'].get('rateLimits') or {}
                    result['windows']={k:raw[k] for k in ['primary','secondary'] if raw.get(k)}
                    result['limit_reached']=bool(raw.get('spendControlReached') or raw.get('rateLimitReachedType'))
                break
        else: result['error']='timeout'
    finally:
        selector.close();p.terminate()
        try:p.wait(5)
        except subprocess.TimeoutExpired:p.kill();p.wait()
    result['admitted']=not result.get('error') and bool(result.get('windows')) and not result.get('limit_reached') and all(v.get('usedPercent',100)<100 for v in result.get('windows',{}).values())
    return result


def preflight(policy):
    RESEARCH.joinpath('outputs').mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=RESEARCH/'outputs',prefix='stage2-isolation-') as td:
        # Real shell probe, not a model request. Source/history paths must be absent.
        checks=f'test ! -e {RESEARCH} && test ! -e {Path.home()}/.codex/sessions && test ! -e {Path.home()}/.codex/config.toml && test -z "$(ls -A /work)" && echo isolation-probe-passed'
        p=subprocess.run(isolated(policy,td,['/bin/sh','-c',checks],raw=True),env=env(),capture_output=True,text=True,timeout=30)
        auth=subprocess.run(isolated(policy,td,options(policy)+['login','status']),env=env(),capture_output=True,text=True,timeout=30)
        result={'at_utc':now(),'isolation_probe':{'returncode':p.returncode,'stdout':p.stdout,'stderr':p.stderr},
                'auth_status':{'returncode':auth.returncode,'diagnostic':auth.stdout+auth.stderr},'scope':'Filesystem/PID isolation with network available to official CLI. No claim of network isolation.'}
        if p.returncode or auth.returncode: raise RuntimeError(json.dumps(result))
        result['allowance']=limits(policy,td)
        if not result['allowance']['admitted']:raise RuntimeError(json.dumps(result))
        return result


def run(policy,prompt,directory,evaluation=False):
    directory.mkdir(parents=True,exist_ok=False)
    (directory/'prompt.txt').write_text(prompt,encoding='utf-8')
    start=now();clock=time.monotonic();stopped=None;events=[];returncode=None
    with tempfile.TemporaryDirectory(dir=RESEARCH/'outputs',prefix='stage2-isolation-') as td:
        allowance=limits(policy,td)
        (directory/'allowance.json').write_text(json.dumps(allowance,indent=2)+'\n')
        if not allowance['admitted']:
            result={'status':'allowance_blocked','started_at_utc':start,'completed_at_utc':now(),'latency_seconds':0,'launched':False,'usage':None,'error':'Included allowance not available; no paid fallback.'}
            (directory/'status.json').write_text(json.dumps(result,indent=2)+'\n')
            return result
        args=['exec','--strict-config','--ignore-user-config','--ephemeral','--skip-git-repo-check',
              '--json','--color','never','--output-last-message','/out/final.txt']+options(policy,evaluation)+['-']
        cmd=isolated(policy,td,args)
        # Redact host-specific paths from public invocation; they contain no credentials.
        (directory/'invocation.json').write_text(json.dumps({'codex_args':args,'environment_names':sorted(env()),
            'model':policy['model'],'ephemeral':True,'user_prompt_count':1,'source_files_mounted':False},indent=2)+'\n')
        with (directory/'events.jsonl').open('w') as out,(directory/'stderr.txt').open('w') as err:
            p=subprocess.Popen(cmd,env=env(),stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=err,
                               text=True,bufsize=1,start_new_session=True)
            p.stdin.write(prompt);p.stdin.close()
            pending=queue.Queue()
            def collect():
                for line in p.stdout:pending.put(line)
                pending.put(None)
            reader=threading.Thread(target=collect,daemon=True);reader.start()
            deadline=time.monotonic()+policy['evaluation_timeout_seconds' if evaluation else 'generation_timeout_seconds']
            while True:
                if time.monotonic()>deadline:
                    stopped='timeout';os.killpg(p.pid,signal.SIGTERM);break
                try:line=pending.get(timeout=1)
                except queue.Empty:continue
                if line is None:break
                out.write(line);out.flush()
                try:e=json.loads(line)
                except ValueError:stopped='invalid_event';os.killpg(p.pid,signal.SIGTERM);break
                events.append(e)
                kind=e.get('item',{}).get('type')
                if kind not in (None,'agent_message','reasoning','error'):
                    stopped='tool_event';os.killpg(p.pid,signal.SIGTERM);break
                if e.get('type')=='error' and 'Reconnecting' in e.get('message',''):
                    stopped='unexpected_internal_retry';os.killpg(p.pid,signal.SIGTERM);break
            try:returncode=p.wait(10)
            except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);returncode=p.wait()
        final=Path(td)/'final.txt'
        response=final.read_text() if final.exists() else ''
    (directory/'response.txt').write_text(response)
    completions=[e for e in events if e.get('type')=='turn.completed']
    errors=[e for e in events if e.get('type') in ('error','turn.failed')]
    diag=(directory/'stderr.txt').read_text()
    fatal=''
    combined=(diag+json.dumps(errors)).lower()
    if any(x in combined for x in ['usage limit','quota','rate limit','usage_limit','rate_limit','429']):fatal='quota'
    elif any(x in combined for x in ['unauthorized','authentication','token_expired','401','failed to refresh']):fatal='authentication'
    elif any(x in combined for x in ['unknown field','invalid value','configuration error','unknown model']):fatal='configuration'
    usage=completions[0].get('usage') if len(completions)==1 else None
    status=stopped or (fatal if fatal else 'completed' if returncode==0 and len(completions)==1 else 'transport_error')
    result={'status':status,'started_at_utc':start,'completed_at_utc':now(),'latency_seconds':round(time.monotonic()-clock,6),
        'launched':True,'returncode':returncode,'usage':usage,'reasoning_tokens':usage.get('reasoning_output_tokens') if usage else None,
        'backend_finish_reason':None,'finish_reason_note':'CLI reports turn completion, not provider finish_reason; raw usage is authoritative for optional subcounts.',
        'thread_ids':[e['thread_id'] for e in events if e.get('type')=='thread.started'],
        'tool_event_count':sum(e.get('item',{}).get('type') not in (None,'agent_message','reasoning','error') for e in events),
        'errors':errors,'fatal_class':fatal or None,'response_nonempty':bool(response.strip())}
    (directory/'status.json').write_text(json.dumps(result,indent=2)+'\n')
    return result
