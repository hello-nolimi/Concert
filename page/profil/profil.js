const PHOTO_KEY = 'myconcert-profile-photo'
const PSEUDO_KEY = 'myconcert-pseudo'
const UNFOLLOW_KEY = 'myconcert-unfollows'
const PREVIEW_COUNT = 3

const SALLE_ICON = `
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 20V9.5L12 5l8 4.5V20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M9 20v-6h6v6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
  </svg>
`

function attr(value) {
  return String(value).replace(/"/g, '&quot;')
}

function loadHidden() {
  try {
    const saved = JSON.parse(localStorage.getItem(UNFOLLOW_KEY) || '{}')
    return {
      artists: new Set(saved.artists || []),
      salles: new Set(saved.salles || []),
    }
  } catch {
    return { artists: new Set(), salles: new Set() }
  }
}

function saveHidden(hidden) {
  localStorage.setItem(UNFOLLOW_KEY, JSON.stringify({
    artists: [...hidden.artists],
    salles: [...hidden.salles],
  }))
}

function renderArtiste(item) {
  return `
    <article class="profil__item">
      <img class="profil__thumb" src="${item.image}" alt="" />
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

function concertWhen(post) {
  if (!post.date) return post.timing === 'live' ? 'En direct' : ''
  const date = new Date(post.date)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function renderConcert(post) {
  const when = concertWhen(post)
  const detail = when ? `${post.salle} · ${when}` : post.salle
  return `
    <article class="profil__item">
      <img class="profil__thumb" src="${post.image}" alt="" />
      <div class="profil__meta">
        <strong>${post.artist}</strong>
        <span>${detail}</span>
      </div>
    </article>
  `
}

function renderArtisteSheet(item) {
  return `
    <article class="profil__item">
      <img class="profil__thumb" src="${item.image}" alt="" />
      <div class="profil__meta">
        <strong>${item.artist}</strong>
        <span>Artiste</span>
      </div>
      <button type="button" class="profil__unfollow" data-unfollow="artist" data-name="${attr(item.artist)}">Ne plus suivre</button>
    </article>
  `
}

function renderSalleSheet(item) {
  return `
    <article class="profil__item">
      <span class="profil__thumb profil__thumb--salle" aria-hidden="true">
        ${SALLE_ICON}
      </span>
      <div class="profil__meta">
        <strong>${item.salle}</strong>
        <span>${item.city || 'Salle'}</span>
      </div>
      <button type="button" class="profil__unfollow" data-unfollow="salle" data-name="${attr(item.salle)}">Ne plus suivre</button>
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
  const metaEl = document.getElementById('profil-meta')
  const handle = `@${pseudo.trim().toLowerCase().replace(/\s+/g, '') || 'alex'}`

  if (nameEl) nameEl.textContent = pseudo
  if (metaEl) metaEl.textContent = `${handle} · Membre depuis novembre 2025`

  if (photo && avatarImg && avatarFallback) {
    avatarImg.src = photo
    avatarImg.hidden = false
    avatarFallback.hidden = true
  } else if (avatarFallback) {
    const parts = pseudo.trim().split(/\s+/).filter(Boolean)
    const initials = (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0]?.[0] || 'A').toUpperCase()
    avatarFallback.textContent = initials
  }

  const billets = posts.filter((post) => post.ticket === 'achete')
  const hidden = loadHidden()
  const dialog = document.getElementById('follow-dialog')
  const dialogTitle = document.getElementById('follow-dialog-title')
  const dialogList = document.getElementById('follow-dialog-list')
  let currentKind = null

  document.getElementById('stat-billets').textContent = String(billets.length)

  function fill(list, items, render, emptyText) {
    if (!items.length) {
      list.classList.add('is-empty')
      list.innerHTML = `<p class="profil__empty">${emptyText}</p>`
      return
    }
    list.classList.remove('is-empty')
    list.innerHTML = items.map(render).join('')
  }

  function paint() {
    const artists = followedArtists.filter((item) => !hidden.artists.has(item.artist))
    const salles = followedSalles.filter((item) => !hidden.salles.has(item.salle))

    fill(listArtistes, artists.slice(0, PREVIEW_COUNT), renderArtiste, 'Tu ne suis aucun artiste.')
    fill(listArtistesFull, artists, renderArtiste, 'Tu ne suis aucun artiste.')
    fill(listSalles, salles.slice(0, PREVIEW_COUNT), renderSalle, 'Tu ne suis aucune salle.')
    fill(listSallesFull, salles, renderSalle, 'Tu ne suis aucune salle.')

    document.querySelector('[data-open="artistes"]').hidden = artists.length <= PREVIEW_COUNT
    document.querySelector('[data-open="salles"]').hidden = salles.length <= PREVIEW_COUNT
    document.getElementById('stat-artistes').textContent = String(artists.length)
    document.getElementById('stat-salles').textContent = String(salles.length)
  }

  function visibleArtists() {
    return followedArtists.filter((item) => !hidden.artists.has(item.artist))
  }

  function visibleSalles() {
    return followedSalles.filter((item) => !hidden.salles.has(item.salle))
  }

  function renderSheet(kind) {
    currentKind = kind
    if (kind === 'billets') {
      dialogTitle.textContent = 'Concerts achetés'
      fill(dialogList, billets, renderConcert, 'Aucun concert acheté.')
      return
    }
    if (kind === 'artistes') {
      dialogTitle.textContent = 'Artistes suivis'
      fill(dialogList, visibleArtists(), renderArtisteSheet, 'Tu ne suis aucun artiste.')
      return
    }
    dialogTitle.textContent = 'Salles suivies'
    fill(dialogList, visibleSalles(), renderSalleSheet, 'Tu ne suis aucune salle.')
  }

  function openSheet(kind) {
    renderSheet(kind)
    dialog.hidden = false
  }

  paint()

  document.querySelectorAll('[data-stat]').forEach((button) => {
    button.addEventListener('click', () => openSheet(button.dataset.stat))
  })

  document.querySelectorAll('[data-follow-close]').forEach((button) => {
    button.addEventListener('click', () => {
      dialog.hidden = true
    })
  })

  dialogList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-unfollow]')
    if (!button) return
    if (button.dataset.unfollow === 'artist') hidden.artists.add(button.dataset.name)
    else hidden.salles.add(button.dataset.name)
    saveHidden(hidden)
    paint()
    renderSheet(currentKind)
  })

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
