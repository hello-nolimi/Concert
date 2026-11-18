/**
 * post-concert
 * États :
 * - timing: "prevu" | "live"
 * - ticket: "achete" | "non-achete"
 */

const ICONS = {
  calendar: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2" />
      <path d="M3 10h18" stroke="currentColor" stroke-width="2" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,
  users: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="2" />
      <path d="M3.5 19c.7-3 2.8-4.5 5.5-4.5S13.8 16 14.5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" stroke-width="2" />
      <path d="M15.2 14.8c1.7.3 3.1 1.4 3.8 4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,
  eye: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" stroke="currentColor" stroke-width="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
    </svg>
  `,
  hourglass: `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 3.5h10a1 1 0 0 1 0 2h-1.1c-.5 1.7-1.7 3.1-3.4 4.1l-.5.3.5.3c1.7 1 2.9 2.4 3.4 4.1H17a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h1.1c.5-1.7 1.7-3.1 3.4-4.1l.5-.3-.5-.3C9.8 8.6 8.6 7.2 8.1 5.5H7a1 1 0 0 1 0-2Z" />
    </svg>
  `,
  lock: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,
  play: `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  `,
}

function getActions({ timing, ticket, countdown, price, liveHref }) {
  if (timing === 'prevu' && ticket === 'non-achete') {
    return `
      <div class="post-concert__actions">
        <button type="button" class="post-concert__timer">
          ${ICONS.hourglass}
          ${countdown}
        </button>
        <button type="button" class="post-concert__btn post-concert__btn--billetterie">
          Billetterie • ${price}
        </button>
      </div>
    `
  }

  if (timing === 'prevu' && ticket === 'achete') {
    return `
      <div class="post-concert__actions">
        <button type="button" class="post-concert__timer">
          ${ICONS.hourglass}
          ${countdown}
        </button>
        <button type="button" class="post-concert__btn post-concert__btn--locked">
          Entrer
          ${ICONS.lock}
        </button>
      </div>
    `
  }

  if (timing === 'live' && ticket === 'non-achete') {
    return `
      <div class="post-concert__actions">
        <button type="button" class="post-concert__btn post-concert__btn--billetterie-live">
          Billetterie • ${price}
        </button>
      </div>
    `
  }

  return `
    <div class="post-concert__actions">
      <a href="${liveHref}" class="post-concert__btn post-concert__btn--enter-live">
        Entrer
        ${ICONS.play}
      </a>
    </div>
  `
}

function getBadges({ timing, count }) {
  if (timing === 'live') {
    return `
      <span class="post-concert__badge post-concert__badge--live">
        <span class="dot" aria-hidden="true"></span>
        LIVE
      </span>
      <span class="post-concert__badge post-concert__badge--views">
        ${ICONS.eye}
        ${count}
      </span>
    `
  }

  return `
    <span class="post-concert__badge post-concert__badge--tonight">
      ${ICONS.calendar}
      CE SOIR
    </span>
    <span class="post-concert__badge post-concert__badge--count">
      ${ICONS.users}
      ${count}
    </span>
  `
}

export function createPostConcert({
  artist,
  timing = 'prevu',
  ticket = 'non-achete',
  count = '0',
  countdown = '00:00:00',
  price = '4,99 €',
  salle = 'Salle à confirmer',
  background,
  image,
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
    <div class="post-concert__media" ${mediaStyle}></div>
    <div class="post-concert__top">
      ${getBadges({ timing, count })}
    </div>
    <div class="post-concert__bottom">
      <div class="post-concert__info">
        <h2 class="post-concert__title">${artist}</h2>
        <p class="post-concert__status">${salle}</p>
      </div>
      ${getActions({ timing, ticket, countdown, price, liveHref })}
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
