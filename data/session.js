const KEY = 'myconcert-logged-in'

export function isLoggedIn() {
  return localStorage.getItem(KEY) === '1'
}

export function logIn() {
  localStorage.setItem(KEY, '1')
}

export function logOut() {
  localStorage.removeItem(KEY)
}
