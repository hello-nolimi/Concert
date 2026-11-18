function formatTonightTime(date) {
  if (!date) return 'Ce soir'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 'Ce soir'
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `Ce soir à ${hours}:${minutes}`
}

function formatPastDate(date) {
  if (!date) return 'Terminé'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 'Terminé'
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusLabel(timing, date) {
  if (timing === 'live') {
    return `
      <p class="post-billet__status post-billet__status--live">
        <span class="dot" aria-hidden="true"></span>
        En direct
      </p>
    `
  }
  if (timing === 'passe') {
    return `<p class="post-billet__status">${formatPastDate(date)}</p>`
  }
  return `<p class="post-billet__status">${formatTonightTime(date)}</p>`
}

export function createPostBillet({
  artist,
  timing = 'prevu',
  image,
  date,
  salle = 'Salle à confirmer',
  count = '0',
} = {}) {
  const article = document.createElement('article')
  article.className = 'post-billet'
  article.dataset.timing = timing
  article.setAttribute('aria-label', `Billet ${artist}`)

  const thumbStyle = image ? `style="background-image: url('${image}')"` : ''

  const liveHref =
    timing === 'live'
      ? `../live/live.html?artist=${encodeURIComponent(artist)}&count=${encodeURIComponent(count)}&image=${encodeURIComponent(image || '')}`
      : ''

  const join =
    timing === 'live'
      ? `<a class="post-billet__join" href="${liveHref}">Rejoindre</a>`
      : ''

  article.innerHTML = `
    <div class="post-billet__thumb" ${thumbStyle}></div>
    <div class="post-billet__body">
      ${getStatusLabel(timing, date)}
      <h2 class="post-billet__artist">${artist}</h2>
      <p class="post-billet__salle">${salle}</p>
    </div>
    ${join}
  `

  return article
}

export function mountPostBillet(target, options) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return null
  const post = createPostBillet(options)
  el.appendChild(post)
  return post
}
