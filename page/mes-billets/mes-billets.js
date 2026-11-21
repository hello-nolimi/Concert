const WEEKDAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

function bought(posts) {
  return posts.filter((post) => post.ticket === 'achete')
}

function byDate(a, b) {
  return new Date(a.date).getTime() - new Date(b.date).getTime()
}

function timeLabel(date) {
  const value = new Date(date)
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function dayLabel(date) {
  const value = new Date(date)
  return `${WEEKDAYS[value.getDay()]} ${value.getDate()} ${MONTHS[value.getMonth()]}`
}

function ticketCode(post) {
  const seed = `${post.artist}|${post.date || post.timing}|${post.salle}`
  let hash = 0
  for (const char of seed) hash = (hash * 33 + char.charCodeAt(0)) % 90000
  return `N° MC-${10000 + hash}`
}

function upcomingAction(post, index) {
  if (index === 0 && post.timing === 'live') {
    return `<a class="billet__action" href="../live/live.html">Entrer</a>`
  }
  if (index === 0 && post.date) {
    return `<button type="button" class="billet__action">Entrer à ${timeLabel(post.date)}</button>`
  }
  if (index === 1) {
    return `<button type="button" class="billet__action billet__action--line">Rappel activé</button>`
  }
  return `<button type="button" class="billet__action">Détails</button>`
}

function renderUpcoming(post, index) {
  const when = post.timing === 'live' || !post.date
    ? 'Ce soir'
    : `${dayLabel(post.date)} · ${timeLabel(post.date)}`
  const price = post.price || '4,99 €'

  return `
    <article class="billet">
      <div class="billet__media">
        <img src="${post.image}" alt="${post.artist}" />
        <span class="billet__when">${when}</span>
      </div>
      <div class="billet__body">
        <h2>${post.artist}</h2>
        <p>${post.salle}</p>
      </div>
      <div class="billet__stub">
        <div>
          <strong>${price}</strong>
          <span>${ticketCode(post)}</span>
        </div>
        <span class="billet__code" aria-hidden="true"></span>
      </div>
      ${upcomingAction(post, index)}
    </article>
  `
}

function renderPast(post) {
  const when = post.date ? dayLabel(post.date) : 'Passé'
  const price = post.price || '4,99 €'

  return `
    <article class="passe">
      <img src="${post.image}" alt="" />
      <div class="passe__copy">
        <strong>${post.artist}</strong>
        <span>${post.salle} · ${when}</span>
      </div>
      <span class="passe__price">${price}</span>
      <button type="button" class="passe__replay">Revoir</button>
    </article>
  `
}

export function initMesBillets(posts) {
  const owned = bought(posts)
  const upcoming = [
    ...owned.filter((post) => post.timing === 'live'),
    ...owned.filter((post) => post.timing === 'prevu').sort(byDate),
  ]
  const past = owned.filter((post) => post.timing === 'passe').sort((a, b) => byDate(b, a))

  const summary = document.getElementById('billets-summary')
  const first = upcoming[0]
  let next = ''
  if (first?.timing === 'live') next = 'Prochain concert ce soir'
  else if (first?.date) next = `Prochain concert ${dayLabel(first.date).toLowerCase()} à ${timeLabel(first.date)}`

  if (summary) {
    summary.textContent = upcoming.length
      ? `${upcoming.length} à venir · ${next}`
      : 'Aucun concert à venir'
  }

  const upcomingRoot = document.getElementById('billets-upcoming')
  if (upcomingRoot) upcomingRoot.innerHTML = upcoming.map(renderUpcoming).join('')

  const pastRoot = document.getElementById('billets-past')
  const pastBlock = document.getElementById('billets-past-block')
  if (!past.length && pastBlock) {
    pastBlock.hidden = true
    return
  }
  if (pastRoot) pastRoot.innerHTML = past.map(renderPast).join('')
}
