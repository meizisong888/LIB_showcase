import { taskById } from '../data/tasks'
import type { CapabilityRequirement, TaskProfile } from '../types'

const sensitivityLabels: Record<TaskProfile['sensitivity'], string> = {
  public: 'Public',
  internal: 'Internal university information',
  sensitive: 'Sensitive or high-risk university information',
  controlled: 'Export-controlled data or CUI',
}

export function FinderAnswerSummary({ profile, profileLabel, requirements, showArc }: {
  profile: TaskProfile
  profileLabel: string
  requirements: CapabilityRequirement[]
  showArc: boolean
}) {
  return <section className="answer-summary" aria-labelledby="answer-summary-title">
    <p className="eyebrow">Your task profile</p>
    <h3 id="answer-summary-title">{profileLabel}</h3>
    <dl>
      <div><dt>Goal</dt><dd>{taskById[profile.goal].name}</dd></div>
      <div><dt>Mandatory features</dt><dd>{requirements.length ? requirements.map((item) => item.label).join('; ') : 'No additional feature beyond documented task fit'}</dd></div>
      <div><dt>Data</dt><dd>{sensitivityLabels[profile.sensitivity]}</dd></div>
      {showArc && <div><dt>ARC readiness</dt><dd>{profile.hasArcAccount ? 'Account confirmed' : 'No account'}; {profile.hasArcAllocation ? 'allocation confirmed' : 'no allocation'}; {profile.canUseVtNetworkOrVpn ? 'network/VPN confirmed' : 'network/VPN not confirmed'}</dd></div>}
    </dl>
  </section>
}
