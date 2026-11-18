const PHOTO_KEY = 'myconcert-profile-photo'
const PSEUDO_KEY = 'myconcert-pseudo'
const PREVIEW_COUNT = 3

const SALLE_ICON = `
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 20V9.5L12 5l8 4.5V20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M9 20v-6h6v6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
  </svg>
`

function renderArtiste(item) {
  return `
    <article class="profil__item">
      <img class="profil__thumb" src="${item.image}" alt="${item.artist}" />
      <div class="profil__meta">
        <strong>${item.artist}</strong>
        <span>Artiste</span>
      </div>
      <span class="profil__follow">Suivi</span>
    </article>
  `
}

function renderSalle(item) {
  return `
    <article class="profil__item">
      <span class="profil__thumb profil__thumb--salle" aria-hidden="true">
        ${SALLE_ICON}
      </span>
      <div class="profil__meta">
        <strong>${item.salle}</strong>
        <span>${item.city || 'Salle'}</span>
      </div>
      <span class="profil__follow">Suivie</span>
    </article>
  `
}

export function initProfil({ posts, followedArtists, followedSalles }) {
  const avatarImg = document.getElementById('profil-avatar-img')
  const avatarFallback = document.getElementById('profil-avatar-fallback')
  const nameEl = document.getElementById('profil-name')
  const listArtistes = document.getElementById('list-artistes')
  const listSalles = document.getElementById('list-salles')
  const listArtistesFull = document.getElementById('list-artistes-full')
  const listSallesFull = document.getElementById('list-salles-full')
  const panels = document.querySelectorAll('[data-panel]')
  const openButtons = document.querySelectorAll('[data-open]')
  const backButtons = document.querySelectorAll('[data-back]')

  const pseudo = localStorage.getItem(PSEUDO_KEY) || 'Alex'
  const photo = localStorage.getItem(PHOTO_KEY)

  if (nameEl) nameEl.textContent = pseudo

  if (photo && avatarImg && avatarFallback) {
    avatarImg.src = photo
    avatarImg.hidden = false
    avatarFallback.hidden = true
  } else if (avatarFallback) {
    avatarFallback.textContent = pseudo.trim().charAt(0).toUpperCase() || 'A'
  }

  const billets = posts.filter((post) => post.ticket === 'achete').length
  const livesVus = posts.filter(
    (post) => post.ticket === 'achete' && (post.timing === 'live' || post.timing === 'passe'),
  ).length

  document.getElementById('stat-billets').textContent = String(billets)
  document.getElementById('stat-lives').textContent = String(livesVus)
  document.getElementById('stat-artistes').textContent = String(followedArtists.length)
  document.getElementById('stat-salles').textContent = String(followedSalles.length)

  listArtistes.innerHTML = followedArtists.slice(0, PREVIEW_COUNT).map(renderArtiste).join('')
  listSalles.innerHTML = followedSalles.slice(0, PREVIEW_COUNT).map(renderSalle).join('')
  listArtistesFull.innerHTML = followedArtists.map(renderArtiste).join('')
  listSallesFull.innerHTML = followedSalles.map(renderSalle).join('')

  function showPanel(name) {
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === name)
    })
  }

  openButtons.forEach((btn) => {
    btn.addEventListener('click', () => showPanel(btn.dataset.open))
  })

  backButtons.forEach((btn) => {
    btn.addEventListener('click', () => showPanel('home'))
  })
}
