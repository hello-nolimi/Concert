import { initTheme } from '../../styles/theme.js'
import { logOut } from '../../data/session.js'

const PHOTO_KEY = 'myconcert-profile-photo'
const PSEUDO_KEY = 'myconcert-pseudo'
const EMAIL_KEY = 'myconcert-email'
const SETTINGS_KEY = 'myconcert-settings'
const DEFAULT_EMAIL = 'alex@myconcert.app'

const DEFAULT_SETTINGS = {
  reminder: true,
  newShows: true,
  replays: false,
  quality: 'auto',
}

function readSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function writeSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0]?.[0] || 'A').toUpperCase()
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

  const settings = readSettings()
  const pseudo = localStorage.getItem(PSEUDO_KEY) || 'Alex'
  const email = localStorage.getItem(EMAIL_KEY) || DEFAULT_EMAIL
  const nameEl = document.getElementById('profile-name')
  const fallback = document.getElementById('profile-avatar-fallback')
  const emailLabel = document.getElementById('email-label')
  const emailInput = document.getElementById('email')
  const emailBtn = document.getElementById('btn-email')
  const emailRow = document.getElementById('email-row')
  const passwordLabel = document.getElementById('password-label')
  const passwordInput = document.getElementById('password')
  const passwordBtn = document.getElementById('btn-password')
  const passwordRow = document.getElementById('password-row')
  const photoBtn = document.getElementById('btn-profile-photo')
  const photoInput = document.getElementById('profile-photo-input')

  if (nameEl) nameEl.textContent = pseudo
  if (fallback) fallback.textContent = initials(pseudo)
  if (emailLabel) emailLabel.textContent = email
  if (emailInput) emailInput.value = email
  setProfilePhoto(localStorage.getItem(PHOTO_KEY))

  document.querySelectorAll('[data-setting]').forEach((input) => {
    input.checked = Boolean(settings[input.dataset.setting])
    input.addEventListener('change', () => {
      settings[input.dataset.setting] = input.checked
      writeSettings(settings)
    })
  })

  document.querySelectorAll('[data-quality]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.quality === settings.quality)
    button.addEventListener('click', () => {
      settings.quality = button.dataset.quality
      writeSettings(settings)
      document.querySelectorAll('[data-quality]').forEach((item) => {
        item.classList.toggle('is-active', item === button)
      })
    })
  })

  photoBtn?.addEventListener('click', () => photoInput?.click())
  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const photo = String(reader.result || '')
      localStorage.setItem(PHOTO_KEY, photo)
      setProfilePhoto(photo)
    }
    reader.readAsDataURL(file)
  })

  emailBtn?.addEventListener('click', () => {
    const editing = emailBtn.dataset.mode === 'edit'
    if (editing) {
      emailRow.classList.add('is-editing')
      emailBtn.dataset.mode = 'save'
      emailBtn.textContent = 'Valider'
      emailInput.focus()
      return
    }
    const next = emailInput.value.trim() || DEFAULT_EMAIL
    emailInput.value = next
    emailLabel.textContent = next
    localStorage.setItem(EMAIL_KEY, next)
    emailRow.classList.remove('is-editing')
    emailBtn.dataset.mode = 'edit'
    emailBtn.textContent = 'Modifier'
  })

  passwordBtn?.addEventListener('click', () => {
    const editing = passwordBtn.dataset.mode === 'edit'
    if (editing) {
      passwordRow.classList.add('is-editing')
      passwordBtn.dataset.mode = 'save'
      passwordBtn.textContent = 'Valider'
      passwordInput.focus()
      return
    }
    passwordInput.value = ''
    passwordLabel.textContent = 'Modifié à l\'instant'
    passwordRow.classList.remove('is-editing')
    passwordBtn.dataset.mode = 'edit'
    passwordBtn.textContent = 'Modifier'
  })

  const accueilUrl = '../accueil/accueil.html'
  const logoutBtn = document.getElementById('btn-logout')
  const logoutDialog = document.getElementById('logout-dialog')
  const logoutConfirm = document.getElementById('btn-logout-confirm')
  const deleteBtn = document.getElementById('btn-delete')
  const deleteDialog = document.getElementById('delete-dialog')
  const deleteConfirm = document.getElementById('btn-delete-confirm')

  function bindDialog(openBtn, dialog, cancelAttr, confirmBtn, onConfirm) {
    openBtn?.addEventListener('click', () => {
      if (dialog) dialog.hidden = false
    })
    document.querySelectorAll(`[${cancelAttr}]`).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (dialog) dialog.hidden = true
      })
    })
    confirmBtn?.addEventListener('click', onConfirm)
  }

  bindDialog(logoutBtn, logoutDialog, 'data-logout-cancel', logoutConfirm, () => {
    logOut()
    window.location.href = accueilUrl
  })

  bindDialog(deleteBtn, deleteDialog, 'data-delete-cancel', deleteConfirm, () => {
    localStorage.removeItem(PHOTO_KEY)
    localStorage.removeItem(PSEUDO_KEY)
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(SETTINGS_KEY)
    logOut()
    window.location.href = accueilUrl
  })
}
