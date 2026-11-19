/**
 * post-concert
 * États :
 * - timing: "prevu" | "live"
 * - ticket: "achete" | "non-achete"
 */

const ARROW = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

function formatConcertDate(date) {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return `${value.getDate()} ${MONTHS[value.getMonth()]}`
}

function getOverlay({ timing, date }) {
  const dateLabel = date ? formatConcertDate(date) : ''
  const dateChip = dateLabel
    ? `<span class="post-concert__chip post-concert__chip--date">${dateLabel}</span>`
    : ''

  const liveChip = timing === 'live'
    ? `<span class="post-concert__chip post-concert__chip--live"><span class="dot" aria-hidden="true"></span>En direct</span>`
    : ''

  if (!dateChip && !liveChip) return ''

  return `<div class="post-concert__chips">${dateChip}${liveChip}</div>`
}

function getControl({ timing, ticket, liveHref, price }) {
  if (ticket !== 'achete') {
    return `<button type="button" class="post-concert__ticket" aria-label="Payer ${price}">${price}</button>`
  }

  if (timing === 'live') {
    return `<a class="post-concert__enter" href="${liveHref}" aria-label="Entrer dans le live">${ARROW}</a>`
  }

  return `<button type="button" class="post-concert__enter post-concert__enter--wait" aria-label="Le live n'est pas commencé" disabled>${ARROW}</button>`
}

export function createPostConcert({
  artist,
  timing = 'prevu',
  ticket = 'non-achete',
  count = '0',
  price = '4,99 €',
  salle = 'Salle à confirmer',
  background,
  image,
  date,
} = {}) {
  const article = document.createElement('article')
  article.className = 'post-concert'
  article.dataset.timing = timing
  article.dataset.ticket = ticket
  article.setAttribute('aria-label', `Concert ${artist}`)

  if (background) {
    article.style.setProperty('--post-bg', background)
  }

  const mediaStyle = image
    ? `style="background-image: url('${image}')"`
    : ''

  const liveHref =
    timing === 'live' && ticket === 'achete'
      ? `../live/live.html?artist=${encodeURIComponent(artist)}&count=${encodeURIComponent(count)}&image=${encodeURIComponent(image || '')}`
      : '#'

  article.innerHTML = `
    <div class="post-concert__media" ${mediaStyle}>
      ${getOverlay({ timing, date })}
    </div>
    <div class="post-concert__row">
      <div class="post-concert__info">
        <h2 class="post-concert__title">${artist}</h2>
        <p class="post-concert__status">${salle}</p>
      </div>
      ${getControl({ timing, ticket, liveHref, price })}
    </div>
  `

  return article
}

export function mountPostConcert(target, options) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return null
  const post = createPostConcert(options)
  el.appendChild(post)
  return post
}
