const VIEWS = ['profil', 'billets', 'parametres']
const TITLES = {
  profil: 'Profil',
  billets: 'Mes billets',
  parametres: 'Paramètres',
}

export function initCompte() {
  const root = document.querySelector('.compte')
  const switcher = document.querySelector('.compte__switch')
  const pill = document.querySelector('.compte__pill')
  const buttons = [...document.querySelectorAll('[data-compte]')]
  const views = [...document.querySelectorAll('[data-compte-view]')]
  let current = null

  function viewFromLocation() {
    const name = location.hash.replace('#', '')
    return VIEWS.includes(name) ? name : 'profil'
  }

  function movePill() {
    const active = switcher?.querySelector('.is-active')
    if (!pill || !active) return
    pill.style.width = `${active.offsetWidth}px`
    pill.style.transform = `translateX(${active.offsetLeft}px)`
  }

  function show(name, { fromHistory = false, animate = true } = {}) {
    if (!VIEWS.includes(name)) name = 'profil'
    const previous = current
    if (name === current) {
      movePill()
      return
    }

    const dir = previous == null || VIEWS.indexOf(name) >= VIEWS.indexOf(previous) ? 'next' : 'prev'
    current = name

    views.forEach((view) => {
      const on = view.dataset.compteView === name
      view.classList.toggle('is-active', on)
      if (on) view.dataset.dir = animate && previous != null ? dir : ''
    })

    buttons.forEach((button) => {
      const on = button.dataset.compte === name
      button.classList.toggle('is-active', on)
      if (on) button.setAttribute('aria-current', 'page')
      else button.removeAttribute('aria-current')
    })

    document.title = TITLES[name]
    delete document.documentElement.dataset.compte
    movePill()

    if (!fromHistory) {
      const nextUrl = name === 'profil' ? location.pathname + location.search : `#${name}`
      const same = name === 'profil' ? !location.hash : location.hash === `#${name}`
      if (!same) history.pushState({ view: name }, '', nextUrl)
    }

    if (animate && previous != null) root?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => show(button.dataset.compte))
  })

  window.addEventListener('popstate', () => show(viewFromLocation(), { fromHistory: true }))
  window.addEventListener('resize', movePill)

  show(viewFromLocation(), { fromHistory: true, animate: false })
  requestAnimationFrame(movePill)
}
