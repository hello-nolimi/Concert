import { initTheme } from '../../styles/theme.js'
import { isLoggedIn } from '../../data/session.js'

const ICONS = {
  accueil: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
    </svg>
  `,
  'mes-billets': `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8.5A2.5 2.5 0 0 0 6.5 11 2.5 2.5 0 0 1 4 13.5V18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.5A2.5 2.5 0 0 1 17.5 11 2.5 2.5 0 0 0 20 8.5V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M12 7v10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 3" />
    </svg>
  `,
  recherche: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
  profil: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8" />
      <path d="M5 19c1-3.5 3.5-5.2 7-5.2S18 15.5 19 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
  parametres: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
}

const MENU_LINKS = [
  { label: 'Recherche', href: '../recherche/recherche.html', id: 'recherche', mobileOnly: true },
  { label: 'Profil', href: '../profil/profil.html', id: 'profil', mobileOnly: true },
]

export function createNavbar({ brand = 'My Concert', active = '' } = {}) {
  const root = document.createElement('div')
  root.className = 'navbar-root'

  const links = MENU_LINKS.map(
    (link) => `
      <li class="${link.mobileOnly ? 'navbar__item--mobile' : ''}">
        <a href="${link.href}" class="${link.id === active ? 'is-active' : ''}">
          <span class="navbar-drawer__icon">${ICONS[link.id]}</span>
          <span>${link.label}</span>
        </a>
      </li>
    `,
  ).join('')

  const loggedIn = isLoggedIn()
  const accountLinks = loggedIn
    ? `<a class="navbar__auth-link navbar__auth-link--solid" href="../profil/profil.html">Profil</a>`
    : `
        <a class="navbar__auth-link" href="../connextion-creer-un-compte/creer-un-compte/creer-un-compte.html">Créer un compte</a>
        <a class="navbar__auth-link navbar__auth-link--solid" href="../connextion-creer-un-compte/connextion/connextion.html">Se connecter</a>
      `
  const auth = `
      <div class="navbar__auth${loggedIn ? ' navbar__auth--in' : ''}">
        ${accountLinks}
      </div>
    `

  root.innerHTML = `
    <header class="navbar${active === 'accueil' ? '' : ' navbar--compact'}">
      <a class="navbar__profil" href="../profil/profil.html" aria-label="Profil">${ICONS.profil}</a>
      <div class="navbar__end">
        <div class="navbar__search">
          <div class="navbar__search-grow">
            <div class="navbar__search-clip">
              <input class="navbar__search-input" type="text" placeholder="Rechercher" aria-label="Rechercher" />
            </div>
          </div>
          <button type="button" class="navbar__search-btn" aria-label="Rechercher" aria-expanded="false">
            ${ICONS.recherche}
          </button>
        </div>
        ${auth}
      </div>
      <a class="navbar__brand" href="../accueil/accueil.html">${brand}</a>
      <ul class="navbar__links" aria-label="Navigation">
        ${links}
      </ul>
    </header>
  `

  const search = root.querySelector('.navbar__search')
  const searchBtn = root.querySelector('.navbar__search-btn')
  const searchInput = root.querySelector('.navbar__search-input')

  function openSearch() {
    search.classList.add('is-open')
    searchBtn.setAttribute('aria-expanded', 'true')
    searchInput.focus()
  }

  function closeSearch() {
    search.classList.remove('is-open')
    searchBtn.setAttribute('aria-expanded', 'false')
  }

  searchBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    if (search.classList.contains('is-open')) closeSearch()
    else openSearch()
  })

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSearch()
  })

  document.addEventListener('click', (event) => {
    if (!search.contains(event.target)) closeSearch()
  })

  return root
}

export function mountNavbar(target, options) {
  initTheme()

  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return null

  const navbar = createNavbar(options)
  const header = navbar.querySelector('.navbar')

  el.prepend(header)

  return { header }
}
