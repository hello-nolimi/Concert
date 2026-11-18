import { logIn } from '../../../data/session.js'

const ACCUEIL_URL = '../../accueil/accueil.html'
const TYPE_KEY = 'myconcert-signup-type'
const PHOTO_KEY = 'myconcert-profile-photo'
const PSEUDO_KEY = 'myconcert-pseudo'
const ARTIST_NAME_KEY = 'myconcert-artist-name'

const FLOWS = {
  particulier: ['type', 'compte', 'code', 'profil', 'bienvenue'],
  artiste: ['type', 'artiste-code', 'artiste-infos', 'artiste-photo', 'bienvenue'],
}

const PROGRESS = {
  particulier: {
    compte: 1,
    code: 2,
    profil: 3,
    bienvenue: 4,
  },
  artiste: {
    'artiste-code': 1,
    'artiste-infos': 2,
    'artiste-photo': 3,
    bienvenue: 4,
  },
}

const backBtn = document.getElementById('btn-back')
const progressEl = document.getElementById('signup-progress')
const progressSegs = document.querySelectorAll('.creer__progress-seg')
const steps = document.querySelectorAll('[data-step]')
const codeDigits = [...document.querySelectorAll('.creer__code-digit')]
const photoInput = document.getElementById('signup-photo-input')
const photoBtn = document.getElementById('btn-photo')
const pseudoInput = document.getElementById('pseudo')
const artistNameInput = document.getElementById('artist-pseudo')
const artistCodeInput = document.getElementById('artist-code')
const selfieInput = document.getElementById('selfie-input')
const selfieBtn = document.getElementById('btn-selfie')

let currentStep = 'type'
let currentFlow = null
let pendingPhoto = null
let pendingSelfie = null
let chosenName = 'Alex'

function updateProgress(name) {
  const map = currentFlow ? PROGRESS[currentFlow] : null
  const current = map?.[name]

  if (!progressEl) return

  if (!current) {
    progressEl.hidden = true
    progressEl.setAttribute('aria-hidden', 'true')
    return
  }

  progressEl.hidden = false
  progressEl.setAttribute('aria-hidden', 'false')

  progressSegs.forEach((seg) => {
    const index = Number(seg.dataset.progress)
    seg.classList.toggle('is-done', index < current)
    seg.classList.toggle('is-current', index === current)
  })
}

function showStep(name) {
  currentStep = name
  steps.forEach((step) => {
    step.classList.toggle('is-active', step.dataset.step === name)
  })
  if (backBtn) backBtn.hidden = name === 'bienvenue'
  updateProgress(name)
}

function previousStep() {
  if (!currentFlow || currentStep === 'type') {
    window.location.href = ACCUEIL_URL
    return
  }

  const flowSteps = FLOWS[currentFlow]
  const index = flowSteps.indexOf(currentStep)

  if (index <= 0) {
    window.location.href = ACCUEIL_URL
    return
  }

  const prev = flowSteps[index - 1]
  if (prev === 'type') currentFlow = null
  showStep(prev)
}

function setAvatar(imgId, fallbackId, src, letter) {
  const img = document.getElementById(imgId)
  const fallback = document.getElementById(fallbackId)
  if (!img || !fallback) return

  if (src) {
    img.src = src
    img.hidden = false
    fallback.hidden = true
  } else {
    img.removeAttribute('src')
    img.hidden = true
    fallback.hidden = false
    fallback.textContent = (letter || 'A').charAt(0).toUpperCase()
  }
}

function updatePseudoFallback() {
  const letter = (pseudoInput?.value || 'A').trim().charAt(0).toUpperCase() || 'A'
  if (!pendingPhoto) {
    setAvatar('signup-avatar-img', 'signup-avatar-fallback', null, letter)
  }
}

function goToWelcome({ name, photo }) {
  chosenName = name
  localStorage.setItem(PSEUDO_KEY, chosenName)
  if (photo) localStorage.setItem(PHOTO_KEY, photo)

  setAvatar('welcome-avatar-img', 'welcome-avatar-fallback', photo, chosenName)
  const welcomeName = document.getElementById('welcome-name')
  if (welcomeName) welcomeName.textContent = `${chosenName} !`
  showStep('bienvenue')
}

backBtn?.addEventListener('click', previousStep)

document.querySelectorAll('[data-type]').forEach((choice) => {
  choice.addEventListener('click', () => {
    const type = choice.dataset.type
    currentFlow = type
    sessionStorage.setItem(TYPE_KEY, type)

    if (type === 'particulier') showStep('compte')
    if (type === 'artiste') {
      showStep('artiste-code')
      artistCodeInput?.focus()
    }
  })
})

document.getElementById('form-compte')?.addEventListener('submit', (event) => {
  event.preventDefault()
  showStep('code')
  codeDigits[0]?.focus()
})

codeDigits.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 1)
    if (input.value && codeDigits[index + 1]) {
      codeDigits[index + 1].focus()
    }
  })

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && codeDigits[index - 1]) {
      codeDigits[index - 1].focus()
    }
  })

  input.addEventListener('paste', (event) => {
    event.preventDefault()
    const text = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 4)
    text.split('').forEach((digit, i) => {
      if (codeDigits[i]) codeDigits[i].value = digit
    })
    codeDigits[Math.min(text.length, 3)]?.focus()
  })
})

document.getElementById('form-code')?.addEventListener('submit', (event) => {
  event.preventDefault()
  showStep('profil')
  pseudoInput?.focus()
})

photoBtn?.addEventListener('click', () => photoInput?.click())

photoInput?.addEventListener('change', () => {
  const file = photoInput.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    pendingPhoto = String(reader.result || '')
    setAvatar('signup-avatar-img', 'signup-avatar-fallback', pendingPhoto)
    if (photoBtn) photoBtn.textContent = 'Changer la photo'
  }
  reader.readAsDataURL(file)
})

pseudoInput?.addEventListener('input', updatePseudoFallback)

document.getElementById('form-profil')?.addEventListener('submit', (event) => {
  event.preventDefault()
  goToWelcome({
    name: (pseudoInput?.value || 'Alex').trim() || 'Alex',
    photo: pendingPhoto,
  })
})

document.getElementById('form-artiste-code')?.addEventListener('submit', (event) => {
  event.preventDefault()
  showStep('artiste-infos')
})

document.getElementById('form-artiste-infos')?.addEventListener('submit', (event) => {
  event.preventDefault()
  showStep('artiste-photo')
  artistNameInput?.focus()
})

artistNameInput?.addEventListener('input', () => {
  const letter = (artistNameInput.value || 'A').trim().charAt(0).toUpperCase() || 'A'
  if (!pendingSelfie) setAvatar('selfie-img', 'selfie-fallback', null, letter)
})

selfieBtn?.addEventListener('click', () => selfieInput?.click())

selfieInput?.addEventListener('change', () => {
  const file = selfieInput.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    pendingSelfie = String(reader.result || '')
    setAvatar('selfie-img', 'selfie-fallback', pendingSelfie)
    if (selfieBtn) selfieBtn.textContent = 'Changer la photo'
  }
  reader.readAsDataURL(file)
})

document.getElementById('form-artiste-photo')?.addEventListener('submit', (event) => {
  event.preventDefault()
  const name = (artistNameInput?.value || 'Artiste').trim() || 'Artiste'
  sessionStorage.setItem(ARTIST_NAME_KEY, name)
  goToWelcome({
    name,
    photo: pendingSelfie,
  })
})

document.getElementById('btn-welcome')?.addEventListener('click', () => {
  logIn()
  window.location.href = ACCUEIL_URL
})
