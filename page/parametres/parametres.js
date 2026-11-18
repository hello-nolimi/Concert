import { applyTheme, getTheme, initTheme } from '../../styles/theme.js'
import { logOut } from '../../data/session.js'

const LANG_KEY = 'myconcert-lang'
const PHOTO_KEY = 'myconcert-profile-photo'
const PSEUDO_KEY = 'myconcert-pseudo'

function applyLang(lang) {
  localStorage.setItem(LANG_KEY, lang)
}

function setProfilePhoto(src) {
  const img = document.getElementById('profile-avatar-img')
  const fallback = document.getElementById('profile-avatar-fallback')
  if (!img || !fallback) return

  if (src) {
    img.src = src
    img.hidden = false
    fallback.hidden = true
  } else {
    img.removeAttribute('src')
    img.hidden = true
    fallback.hidden = false
  }
}

export function initParametres() {
  initTheme()

  const panels = document.querySelectorAll('[data-panel]')
  const openers = document.querySelectorAll('[data-open]')
  const backs = document.querySelectorAll('[data-back]')
  const pseudoInput = document.getElementById('pseudo')
  const pseudoBtn = document.getElementById('btn-pseudo')
  const passwordBtn = document.getElementById('btn-password')
  const langSelect = document.getElementById('lang')
  const langBtn = document.getElementById('btn-lang')
  const themeSelect = document.getElementById('theme')
  const themeBtn = document.getElementById('btn-theme')
  const photoBtn = document.getElementById('btn-profile-photo')
  const photoInput = document.getElementById('profile-photo-input')
  let pendingPhoto = null

  const savedLang = localStorage.getItem(LANG_KEY) || 'fr'
  if (langSelect) langSelect.value = savedLang
  if (themeSelect) themeSelect.value = getTheme()
  setProfilePhoto(localStorage.getItem(PHOTO_KEY))

  const savedPseudo = localStorage.getItem(PSEUDO_KEY)
  if (savedPseudo && pseudoInput) {
    pseudoInput.value = savedPseudo
    const fallback = document.getElementById('profile-avatar-fallback')
    if (fallback && !localStorage.getItem(PHOTO_KEY)) {
      fallback.textContent = savedPseudo.trim().charAt(0).toUpperCase() || 'A'
    }
  }

  function showPanel(id) {
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === id)
    })
  }

  function bindEditValidate(button, field, { onValidate } = {}) {
    button?.addEventListener('click', () => {
      const editing = button.dataset.mode === 'edit'

      if (editing) {
        field.disabled = false
        field.focus()
        button.dataset.mode = 'save'
        button.textContent = 'Valider'
        button.classList.add('is-validate')
        return
      }

      field.disabled = true
      button.dataset.mode = 'edit'
      button.textContent = 'Modifier'
      button.classList.remove('is-validate')
      onValidate?.(field.value)
    })
  }

  openers.forEach((btn) => {
    btn.addEventListener('click', () => showPanel(btn.dataset.open))
  })

  backs.forEach((btn) => {
    btn.addEventListener('click', () => showPanel('home'))
  })

  photoBtn?.addEventListener('click', () => {
    const editing = photoBtn.dataset.mode !== 'save'

    if (editing) {
      photoInput?.click()
      return
    }

    if (pendingPhoto) {
      localStorage.setItem(PHOTO_KEY, pendingPhoto)
      setProfilePhoto(pendingPhoto)
      pendingPhoto = null
    }

    photoBtn.dataset.mode = 'edit'
    photoBtn.textContent = 'Modifier'
    photoBtn.classList.remove('is-validate')
  })

  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      pendingPhoto = String(reader.result || '')
      setProfilePhoto(pendingPhoto)
      photoBtn.dataset.mode = 'save'
      photoBtn.textContent = 'Valider'
      photoBtn.classList.add('is-validate')
    }
    reader.readAsDataURL(file)
  })

  pseudoBtn?.addEventListener('click', () => {
    const editing = pseudoBtn.dataset.mode === 'edit'

    if (editing) {
      pseudoInput.readOnly = false
      pseudoInput.focus()
      pseudoInput.select()
      pseudoBtn.dataset.mode = 'save'
      pseudoBtn.textContent = 'Valider'
      pseudoBtn.classList.add('is-validate')
      return
    }

    pseudoInput.readOnly = true
    pseudoBtn.dataset.mode = 'edit'
    pseudoBtn.textContent = 'Modifier'
    pseudoBtn.classList.remove('is-validate')

    const nextPseudo = (pseudoInput.value || 'Alex').trim() || 'Alex'
    pseudoInput.value = nextPseudo
    localStorage.setItem(PSEUDO_KEY, nextPseudo)

    const fallback = document.getElementById('profile-avatar-fallback')
    if (fallback && !localStorage.getItem(PHOTO_KEY)) {
      fallback.textContent = nextPseudo.charAt(0).toUpperCase() || 'A'
    }
  })

  bindEditValidate(langBtn, langSelect, {
    onValidate: (value) => applyLang(value),
  })

  bindEditValidate(themeBtn, themeSelect, {
    onValidate: (value) => applyTheme(value),
  })

  // Plus tard : envoi d'un mail de réinitialisation
  passwordBtn?.addEventListener('click', () => {})

  const logoutBtn = document.getElementById('btn-logout')
  const logoutDialog = document.getElementById('logout-dialog')
  const logoutConfirm = document.getElementById('btn-logout-confirm')
  const logoutCancels = document.querySelectorAll('[data-logout-cancel]')
  const accueilUrl = '../accueil/accueil.html'

  function openLogoutDialog() {
    if (!logoutDialog) return
    logoutDialog.hidden = false
  }

  function closeLogoutDialog() {
    if (!logoutDialog) return
    logoutDialog.hidden = true
  }

  logoutBtn?.addEventListener('click', openLogoutDialog)
  logoutCancels.forEach((btn) => btn.addEventListener('click', closeLogoutDialog))
  logoutConfirm?.addEventListener('click', () => {
    logOut()
    window.location.href = accueilUrl
  })
}
