function getParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    artist: params.get('artist') || 'Live',
    image: params.get('image') || '',
    count: params.get('count') || '0',
  }
}

function formatCount(count) {
  const n = Number(String(count).replace(/\s/g, '')) || 0
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const MESSAGES = [
  ['Léa', 'Ambiance de fou 🔥'],
  ['Karim', 'Son trop clean'],
  ['Nora', 'Qui est là depuis le début ?'],
  ['Alex', 'Best live'],
]

export function initLivePage() {
  import('../../styles/theme.js').then(({ initTheme }) => initTheme())

  const { artist, image, count } = getParams()

  const stage = document.querySelector('.live-page__stage')
  const artistEl = document.querySelector('.live-page__artist')
  const viewsEl = document.querySelector('[data-live-views]')
  const chat = document.querySelector('.live-page__chat')
  const back = document.querySelector('.live-page__back')

  if (artistEl) artistEl.textContent = artist
  if (viewsEl) viewsEl.textContent = formatCount(count)
  if (stage && image) {
    stage.style.backgroundImage = `url('${image}')`
  }

  if (chat) {
    chat.innerHTML = MESSAGES.map(
      ([name, text]) => `
        <div class="live-page__message">
          <strong>${name}</strong>
          <span>${text}</span>
        </div>
      `,
    ).join('')
  }

  back?.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back()
    else window.location.href = '../accueil/accueil.html'
  })
}
