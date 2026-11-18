import { logIn } from '../../../data/session.js'

const ACCUEIL_URL = '../../accueil/accueil.html'

const form = document.getElementById('form-connextion')
const backBtn = document.getElementById('btn-back')

backBtn?.addEventListener('click', () => {
  window.location.href = ACCUEIL_URL
})

form?.addEventListener('submit', (event) => {
  event.preventDefault()
  logIn()
  window.location.href = ACCUEIL_URL
})
