import { mountPostBillet } from '../../componant/post-billet/post-billet.js'

function parseCount(count) {
  if (typeof count === 'number') return count
  return Number(String(count).replace(/\s/g, '').replace(/,/g, '')) || 0
}

function formatCount(count) {
  return String(parseCount(count)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function getBought(posts) {
  return posts.filter((post) => post.ticket === 'achete')
}

function filterByTab(posts, tab) {
  if (tab === 'live') return posts.filter((post) => post.timing === 'live')
  if (tab === 'prevu') return posts.filter((post) => post.timing === 'prevu')
  if (tab === 'passe') return posts.filter((post) => post.timing === 'passe')
  return posts
}

function sortBought(posts) {
  return [...posts].sort((a, b) => {
    const order = { live: 0, prevu: 1, passe: 2 }
    if (a.timing !== b.timing) return (order[a.timing] ?? 9) - (order[b.timing] ?? 9)
    if (a.timing === 'prevu' || a.timing === 'passe') {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
    return parseCount(b.count) - parseCount(a.count)
  })
}

export function renderMesBillets(posts, {
  target = '#billets-list',
  tab = 'tout',
} = {}) {
  const list = typeof target === 'string' ? document.querySelector(target) : target
  if (!list) return

  list.innerHTML = ''

  const filtered = sortBought(filterByTab(getBought(posts), tab))

  filtered.forEach((post) => {
    mountPostBillet(list, {
      ...post,
      count: formatCount(post.count),
    })
  })
}

export function initMesBilletsFilters(posts) {
  const tabs = document.querySelectorAll('[data-billets-tab]')
  let current = 'live'

  const render = () => renderMesBillets(posts, { tab: current })

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      current = tab.dataset.billetsTab
      tabs.forEach((el) => el.classList.toggle('is-active', el === tab))
      render()
    })
  })

  render()
}
