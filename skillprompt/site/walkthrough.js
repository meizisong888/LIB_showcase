const rounds = [...document.querySelectorAll('.round')]
const steps = [...document.querySelectorAll('[data-step]')]
const progress = document.getElementById('walkthrough-status')

function showRound(index, focus = false) {
  rounds.forEach((round, i) => { round.hidden = i !== index })
  steps.forEach((step, i) => {
    if (i === index) step.setAttribute('aria-current', 'step')
    else step.removeAttribute('aria-current')
  })
  progress.textContent = `Turn ${index + 1} of 3: ${rounds[index].querySelector('h3').textContent}`
  if (focus) rounds[index].querySelector('h3').focus()
}

steps.forEach((step, index) => step.addEventListener('click', event => {
  event.preventDefault()
  showRound(index, true)
}))
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showRound(Number(button.dataset.go), true)))
document.querySelectorAll('.round-controls').forEach(controls => { controls.hidden = false })
// Leave all rounds readable if JavaScript is unavailable. Honor direct round links.
const initialRound = rounds.findIndex(round => `#${round.id}` === location.hash)
showRound(initialRound >= 0 ? initialRound : 0)
window.addEventListener('hashchange', () => {
  const index = rounds.findIndex(round => `#${round.id}` === location.hash)
  if (index >= 0) showRound(index, true)
})

const copyButton = document.getElementById('copy-prompt')
const prompt = document.getElementById('prompt-text')
const status = document.getElementById('copy-status')
copyButton.hidden = false
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(prompt.value)
    status.textContent = 'Final prompt copied.'
  } catch {
    prompt.focus()
    prompt.select()
    status.textContent = 'Automatic copying is unavailable. The prompt is selected; use your device’s Copy command, or download the TXT file.'
  }
})
