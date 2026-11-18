import { mountPostConcert } from '../../componant/post-concert/post-concert.js'
import { mountPostArtiste } from '../../componant/post-artiste/post-artiste.js'

function parseCount(count) {
  if (typeof count === 'number') return count
  return Number(String(count).replace(/\s/g, '').replace(/,/g, '')) || 0
}

function formatCount(count) {
  return String(parseCount(count)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function formatCountdown(date) {
  const diff = new Date(date).getTime() - Date.now()
  if (Number.isNaN(diff) || diff <= 0) return '00:00:00'

  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

function sortLiveByViews(posts) {
  return [...posts].sort((a, b) => parseCount(b.count) - parseCount(a.count))
}

function sortComingByDate(posts) {
  return [...posts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
}

function statusRank(status) {
  if (status === 'live') return 0
  if (status === 'prevu') return 1
  return 2
}

function timingToStatus(timing) {
  if (timing === 'live') return 'live'
  if (timing === 'prevu') return 'prevu'
  return 'none'
}

function buildArtists(posts) {
  const map = new Map()

  posts.forEach((post) => {
    const nextStatus = timingToStatus(post.timing)
    const current = map.get(post.artist)

    if (!current || statusRank(nextStatus) < statusRank(current.status)) {
      map.set(post.artist, {
        artist: post.artist,
        image: post.image,
        status: nextStatus,
        count: formatCount(post.count),
      })
    }
  })

  return [...map.values()].sort((a, b) => {
    const byStatus = statusRank(a.status) - statusRank(b.status)
    if (byStatus !== 0) return byStatus
    return a.artist.localeCompare(b.artist, 'fr')
  })
}

export function renderArtistesRail(posts, target = '#artistes-rail') {
  const rail = typeof target === 'string' ? document.querySelector(target) : target
  if (!rail) return

  rail.innerHTML = ''
  buildArtists(posts).forEach((artiste) => {
    mountPostArtiste(rail, artiste)
  })
}

/**
 * Répartit les posts selon les règles :
 * - live → "En directe" (plus de vues → gauche)
 * - prevu → "À venir" (date la plus proche → haut)
 * - si aucun live → la zone "En directe" est masquée
 */
export function renderAccueilFeed(posts, {
  liveSection = '#section-live',
  liveRail = '#live-rail',
  comingList = '#coming-list',
  artistesRail = '#artistes-rail',
} = {}) {
  renderArtistesRail(posts, artistesRail)

  const sectionLive = document.querySelector(liveSection)
  const rail = document.querySelector(liveRail)
  const list = document.querySelector(comingList)

  if (!rail || !list) return

  rail.innerHTML = ''
  list.innerHTML = ''

  const lives = sortLiveByViews(posts.filter((post) => post.timing === 'live'))
  const coming = sortComingByDate(posts.filter((post) => post.timing === 'prevu'))

  if (sectionLive) {
    sectionLive.hidden = lives.length === 0
  }

  lives.forEach((post) => {
    mountPostConcert(rail, {
      ...post,
      count: formatCount(post.count),
    })
  })

  coming.forEach((post) => {
    mountPostConcert(list, {
      ...post,
      count: formatCount(post.count),
      countdown: post.countdown || formatCountdown(post.date),
    })
  })
}

function mountRail(target, list) {
  const rail = typeof target === 'string' ? document.querySelector(target) : target
  if (!rail) return

  rail.innerHTML = ''
  list.forEach((post) => {
    mountPostConcert(rail, {
      ...post,
      count: formatCount(post.count),
      countdown: post.countdown || (post.date ? formatCountdown(post.date) : '00:00:00'),
    })
  })
}

const HERO_SLIDES = [
  {
    artist: 'Kaaris',
    text: 'Ce soir à l’Adidas Arena.',
    video: '../../image/accueil.mp4',
    price: '4,99 €',
    offsetMs: 45 * 60 * 1000,
  },
  {
    artist: 'Aya Nakamura',
    text: 'Un live à ne pas manquer.',
    video: '../../image/hero-2.mp4',
    price: '4,99 €',
    offsetMs: 5 * 60 * 60 * 1000,
  },
  {
    artist: 'Gazo',
    text: 'La scène s’allume bientôt.',
    video: '../../image/hero-3.mp4',
    price: '5,99 €',
    offsetMs: 26 * 60 * 60 * 1000,
  },
]

const TIMER_ICON = `
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 3.5h10a1 1 0 0 1 0 2h-1.1c-.5 1.7-1.7 3.1-3.4 4.1l-.5.3.5.3c1.7 1 2.9 2.4 3.4 4.1H17a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h1.1c.5-1.7 1.7-3.1 3.4-4.1l.5-.3-.5-.3C9.8 8.6 8.6 7.2 8.1 5.5H7a1 1 0 0 1 0-2Z" />
  </svg>
`

export function renderHero() {
  const root = document.getElementById('hero-slides')
  const dots = document.getElementById('hero-dots')
  const next = document.getElementById('hero-next')
  const prev = document.getElementById('hero-prev')
  if (!root || !dots || !next || !prev) return

  const slides = HERO_SLIDES.map((slide) => ({
    ...slide,
    date: new Date(Date.now() + slide.offsetMs).toISOString(),
  }))

  root.innerHTML = slides
    .map((slide, index) => {
      const media = `<video src="${slide.video}" ${index === 0 ? 'autoplay' : ''} muted loop playsinline></video>`

      return `
        <article class="accueil__slide${index === 0 ? ' is-active' : ''}">
          ${media}
          <div class="accueil__slide-content">
            <h2 class="accueil__slide-artist">${slide.artist}</h2>
            <p class="accueil__slide-text">${slide.text}</p>
            <div class="accueil__slide-actions">
              <span class="accueil__slide-timer" data-hero-timer data-date="${slide.date}">
                ${TIMER_ICON}
                <span>${formatCountdown(slide.date)}</span>
              </span>
              <button type="button" class="accueil__slide-ticket">Billetterie • ${slide.price}</button>
            </div>
          </div>
        </article>
      `
    })
    .join('')

  dots.innerHTML = slides
    .map(
      (_, index) =>
        `<button type="button" class="accueil__hero-dot${index === 0 ? ' is-active' : ''}" data-hero-dot="${index}" aria-label="Page ${index + 1}"></button>`,
    )
    .join('')

  const pages = [...root.querySelectorAll('.accueil__slide')]
  const dotButtons = [...dots.querySelectorAll('[data-hero-dot]')]
  const SLIDE_MS = 700
  let current = 0
  let animating = false

  pages.forEach((page, index) => {
    page.style.transform = `translate3d(${index === 0 ? 0 : 100}%, 0, 0)`
  })

  function show(index, direction = 1) {
    const nextIndex = (index + pages.length) % pages.length
    if (nextIndex === current || animating) return

    const outgoing = pages[current]
    const incoming = pages[nextIndex]
    animating = true

    incoming.style.transition = 'none'
    incoming.style.transform = `translate3d(${direction * 100}%, 0, 0)`
    incoming.style.zIndex = '2'
    outgoing.style.zIndex = '1'
    void incoming.offsetWidth

    const motion = `transform ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
    incoming.style.transition = motion
    outgoing.style.transition = motion
    incoming.style.transform = 'translate3d(0, 0, 0)'
    outgoing.style.transform = `translate3d(${direction * -100}%, 0, 0)`

    incoming.classList.add('is-active')
    outgoing.classList.remove('is-active')
    incoming.querySelector('video')?.play().catch(() => {})
    dotButtons.forEach((dot, i) => dot.classList.toggle('is-active', i === nextIndex))

    let settled = false
    const finish = (event) => {
      if (event && event.target !== outgoing) return
      if (settled) return
      settled = true
      outgoing.removeEventListener('transitionend', finish)
      outgoing.querySelector('video')?.pause()
      outgoing.style.zIndex = '0'
      current = nextIndex
      animating = false
    }

    outgoing.addEventListener('transitionend', finish)
    window.setTimeout(finish, SLIDE_MS + 80)
  }

  next.addEventListener('click', () => show(current + 1, 1))
  prev.addEventListener('click', () => show(current - 1, -1))
  dotButtons.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.heroDot)
      show(index, index > current ? 1 : -1)
    })
  })

  window.setInterval(() => {
    root.querySelectorAll('[data-hero-timer]').forEach((timer) => {
      const label = timer.querySelector('span')
      if (label) label.textContent = formatCountdown(timer.dataset.date)
    })
  }, 1000)
}

export function renderHome(posts) {
  const prevu = posts.filter((post) => post.timing === 'prevu')
  const attendus = [...prevu]
    .sort((a, b) => parseCount(b.count) - parseCount(a.count))
    .slice(0, 4)
  const attenduIds = new Set(attendus.map((post) => `${post.artist}-${post.date || ''}`))

  mountRail('#rail-live', sortLiveByViews(posts.filter((post) => post.timing === 'live')))
  mountRail('#rail-attendus', attendus)
  mountRail(
    '#rail-prochainement',
    sortComingByDate(prevu.filter((post) => !attenduIds.has(`${post.artist}-${post.date || ''}`))),
  )
  mountRail(
    '#rail-replay',
    [...posts.filter((post) => post.timing === 'passe')].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
  )

  const artists = document.querySelector('#rail-artistes')
  if (!artists) return

  artists.innerHTML = ''
  const seen = new Set()
  posts.forEach((post) => {
    if (seen.has(post.artist)) return
    seen.add(post.artist)
    mountPostArtiste(artists, {
      artist: post.artist,
      image: post.image,
      status: 'none',
    })
  })
}
