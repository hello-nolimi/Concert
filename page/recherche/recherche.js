function uniqueBy(items, keyFn) {
  const map = new Map()
  items.forEach((item) => {
    const key = keyFn(item)
    if (!map.has(key)) map.set(key, item)
  })
  return [...map.values()]
}

function matchesQuery(text, query) {
  return String(text || '')
    .toLowerCase()
    .includes(query)
}

function timingLabel(timing) {
  if (timing === 'live') return 'En direct'
  if (timing === 'prevu') return 'À venir'
  return 'Passé'
}

export function initRecherche(posts) {
  const input = document.getElementById('search-input')
  const empty = document.getElementById('search-empty')
  const sectionArtistes = document.getElementById('section-artistes')
  const sectionSalles = document.getElementById('section-salles')
  const sectionConcerts = document.getElementById('section-concerts')
  const listArtistes = document.getElementById('list-artistes')
  const listSalles = document.getElementById('list-salles')
  const listConcerts = document.getElementById('list-concerts')

  const artistes = uniqueBy(posts, (post) => post.artist).slice(0, 3)
  const salles = uniqueBy(
    posts.filter((post) => post.salle),
    (post) => post.salle,
  ).slice(0, 3)

  listArtistes.innerHTML = artistes
    .map(
      (post) => `
      <article class="recherche__item" data-search="${post.artist}">
        <img class="recherche__thumb" src="${post.image}" alt="${post.artist}" />
        <div class="recherche__meta">
          <strong>${post.artist}</strong>
          <span>Artiste</span>
        </div>
      </article>
    `,
    )
    .join('')

  listSalles.innerHTML = salles
    .map(
      (post) => `
      <article class="recherche__item" data-search="${post.salle}">
        <span class="recherche__thumb recherche__thumb--salle" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 20V9.5L12 5l8 4.5V20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
            <path d="M9 20v-6h6v6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          </svg>
        </span>
        <div class="recherche__meta">
          <strong>${post.salle}</strong>
          <span>Salle</span>
        </div>
      </article>
    `,
    )
    .join('')

  listConcerts.innerHTML = posts
    .map(
      (post) => `
      <article
        class="recherche__item"
        data-search="${post.artist} ${post.salle || ''} ${timingLabel(post.timing)}"
        hidden
      >
        <img class="recherche__thumb" src="${post.image}" alt="${post.artist}" />
        <div class="recherche__meta">
          <strong>${post.artist}</strong>
          <span>${timingLabel(post.timing)} · ${post.salle || 'Salle à confirmer'}</span>
        </div>
      </article>
    `,
    )
    .join('')

  function render(queryRaw) {
    const query = queryRaw.trim().toLowerCase()
    const hasQuery = query.length > 0

    const artistItems = [...listArtistes.querySelectorAll('.recherche__item')]
    const salleItems = [...listSalles.querySelectorAll('.recherche__item')]
    const concertItems = [...listConcerts.querySelectorAll('.recherche__item')]

    let visible = 0

    artistItems.forEach((item) => {
      const show = !hasQuery || matchesQuery(item.dataset.search, query)
      item.hidden = !show
      if (show) visible += 1
    })

    salleItems.forEach((item) => {
      const show = !hasQuery || matchesQuery(item.dataset.search, query)
      item.hidden = !show
      if (show) visible += 1
    })

    concertItems.forEach((item) => {
      const show = hasQuery && matchesQuery(item.dataset.search, query)
      item.hidden = !show
      if (show) visible += 1
    })

    const artistesVisible = artistItems.some((item) => !item.hidden)
    const sallesVisible = salleItems.some((item) => !item.hidden)
    const concertsVisible = concertItems.some((item) => !item.hidden)

    sectionArtistes.hidden = !artistesVisible
    sectionSalles.hidden = !sallesVisible
    sectionConcerts.hidden = !concertsVisible
    empty.hidden = visible > 0
  }

  input?.addEventListener('input', () => render(input.value))
  render('')
}
