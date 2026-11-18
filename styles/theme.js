const THEME_KEY = 'myconcert-theme'

export function applyTheme(theme) {
  const value = theme === 'clair' ? 'clair' : 'sombre'
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem(THEME_KEY, value)
  return value
}

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'sombre'
  return applyTheme(saved)
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'sombre'
}
