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

function mountRail(target, list, extra = {}) {
  const rail = typeof target === 'string' ? document.querySelector(target) : target
  if (!rail) return

  rail.innerHTML = ''
  list.forEach((post) => {
    mountPostConcert(rail, {
      ...post,
      ...extra,
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
  },
  {
    artist: 'Aya Nakamura',
    text: 'Un live à ne pas manquer.',
    video: '../../image/hero-2.mp4',
    price: '4,99 €',
  },
  {
    artist: 'Gazo',
    text: 'La scène s’allume bientôt.',
    video: '../../image/hero-3.mp4',
    price: '5,99 €',
  },
]

export function renderHero() {
  const root = document.getElementById('hero-slides')
  const dots = document.getElementById('hero-dots')
  const next = document.getElementById('hero-next')
  const prev = document.getElementById('hero-prev')
  if (!root || !dots || !next || !prev) return

  const slides = HERO_SLIDES

  root.innerHTML = slides
    .map((slide, index) => {
      const media = `<video src="${slide.video}" autoplay muted loop playsinline disablepictureinpicture disableremoteplayback></video>`

      return `
        <article class="accueil__slide${index === 0 ? ' is-active' : ''}">
          ${media}
          <div class="accueil__slide-content">
            <h2 class="accueil__slide-artist">${slide.artist}</h2>
            <p class="accueil__slide-text">${slide.text}</p>
            <div class="accueil__slide-actions">
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
    const video = page.querySelector('video')
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    video.loop = true
    video.playsInline = true
    video.autoplay = true
    video.controls = false
    const keepPlaying = () => {
      if (!page.classList.contains('is-active')) return
      if (video.ended) video.currentTime = 0
      video.play().catch(() => {})
    }
    video.addEventListener('pause', keepPlaying)
    video.addEventListener('ended', keepPlaying)
    if (index === 0) video.play().catch(() => {})
    else video.pause()
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

  const hero = document.getElementById('hero')
  let touchX = 0
  let touchY = 0
  hero?.addEventListener('touchstart', (event) => {
    touchX = event.touches[0].clientX
    touchY = event.touches[0].clientY
  }, { passive: true })
  hero?.addEventListener('touchend', (event) => {
    const dx = event.changedTouches[0].clientX - touchX
    const dy = event.changedTouches[0].clientY - touchY
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
    show(dx < 0 ? current + 1 : current - 1, dx < 0 ? 1 : -1)
  }, { passive: true })
  dotButtons.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.heroDot)
      show(index, index > current ? 1 : -1)
    })
  })
}

const DAY_LABELS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
const MONTH_LABELS = ['Jan.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']

function isoWeekParts(date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const year = utc.getUTCFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const week = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7)
  return { week, year }
}

function weeksInYear(year) {
  return isoWeekParts(new Date(year, 11, 28)).week
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatHour(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function renderSchedule(posts) {
  const list = document.querySelector('#schedule')
  const label = document.querySelector('#week-label')
  const panel = document.querySelector('#week-panel')
  const button = document.querySelector('#week-btn')
  const yearLabel = document.querySelector('#year-label')
  const weekList = document.querySelector('#week-list')
  if (!list || !label || !panel || !button || !yearLabel || !weekList) return

  const dated = posts
    .map((post) => ({ ...post, at: new Date(post.date) }))
    .filter((post) => !Number.isNaN(post.at.getTime()))
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const first = dated[0]
  const initial = first ? isoWeekParts(first.at) : isoWeekParts(new Date())
  let year = initial.year
  let week = initial.week

  function concertsOf(selectedYear, selectedWeek) {
    return dated.filter((post) => {
      const parts = isoWeekParts(post.at)
      return parts.year === selectedYear && parts.week === selectedWeek
    })
  }

  function paint() {
    label.textContent = `Semaine ${week}`
    yearLabel.textContent = String(year)
    const rows = concertsOf(year, week)

    if (rows.length === 0) {
      list.innerHTML = '<p class="accueil__schedule-empty">Aucun concert cette semaine.</p>'
      return
    }

    list.innerHTML = rows
      .map((post, index) => {
        const previous = index > 0 ? rows[index - 1].at : null
        const next = index < rows.length - 1 ? rows[index + 1].at : null
        const showDate = !previous || !sameDay(previous, post.at)
        const continued = next && sameDay(next, post.at)
        const dateBlock = showDate
          ? `<strong>${post.at.getDate()}</strong><span>${DAY_LABELS[post.at.getDay()]} ${MONTH_LABELS[post.at.getMonth()]}</span>`
          : ''
        const thumb = post.image
          ? `<img class="accueil__slot-thumb" src="${post.image}" alt="" />`
          : `<span class="accueil__slot-thumb"></span>`

        return `
          <article class="accueil__slot${continued ? ' accueil__slot--continued' : ''}">
            <div class="accueil__slot-date">${dateBlock}</div>
            <span class="accueil__slot-time">${formatHour(post.at)}</span>
            ${thumb}
            <div class="accueil__slot-info">
              <strong>${post.artist}</strong>
              <span>${post.salle}</span>
            </div>
            <button type="button" class="accueil__slot-btn">Billetterie</button>
          </article>
        `
      })
      .join('')
  }

  function paintWeeks() {
    const total = weeksInYear(year)
    const available = new Set(
      dated
        .filter((post) => isoWeekParts(post.at).year === year)
        .map((post) => isoWeekParts(post.at).week),
    )
    const numbers = available.size ? [...available].sort((a, b) => a - b) : Array.from({ length: total }, (_, i) => i + 1)
    weekList.innerHTML = numbers
      .map(
        (number) =>
          `<button type="button" class="accueil__week-option${number === week ? ' is-active' : ''}" data-week="${number}" role="option">Semaine ${number}</button>`,
      )
      .join('')
  }

  function openPanel(open) {
    panel.hidden = !open
    button.setAttribute('aria-expanded', open ? 'true' : 'false')
    if (open) paintWeeks()
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation()
    openPanel(panel.hidden)
  })

  panel.addEventListener('click', (event) => event.stopPropagation())

  document.querySelector('#year-prev').addEventListener('click', () => {
    year -= 1
    paintWeeks()
    paint()
  })

  document.querySelector('#year-next').addEventListener('click', () => {
    year += 1
    paintWeeks()
    paint()
  })

  weekList.addEventListener('click', (event) => {
    const option = event.target.closest('[data-week]')
    if (!option) return
    week = Number(option.dataset.week)
    paint()
    openPanel(false)
  })

  document.addEventListener('click', () => openPanel(false))

  paint()
}

export function renderHome(posts) {
  const prevu = posts.filter((post) => post.timing === 'prevu')
  const attendus = [...prevu]
    .sort((a, b) => parseCount(b.count) - parseCount(a.count))
    .slice(0, 4)

  mountRail('#rail-live', sortLiveByViews(posts.filter((post) => post.timing === 'live')), {
    variant: 'ticket',
  })
  mountRail('#rail-attendus', attendus, { variant: 'ticket' })
  renderSchedule(prevu)
  mountRail(
    '#rail-replay',
    [...posts.filter((post) => post.timing === 'passe')].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    { variant: 'ticket' },
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
