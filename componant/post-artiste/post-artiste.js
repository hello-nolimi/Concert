/**
 * post-artiste
 * status: "live" | "prevu" | "none"
 */
export function createPostArtiste({
  artist,
  image,
  status = 'none',
  count = '0',
} = {}) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `post-artiste post-artiste--${status}`
  button.setAttribute('aria-label', artist)

  const photo = image
    ? `<img class="post-artiste__photo" src="${image}" alt="${artist}" />`
    : `<span class="post-artiste__photo" aria-hidden="true"></span>`

  button.innerHTML = `
    <span class="post-artiste__avatar">
      ${photo}
      <span class="post-artiste__dot" aria-hidden="true"></span>
    </span>
    <span class="post-artiste__name">${artist}</span>
  `

  if (status === 'live') {
    button.addEventListener('click', () => {
      const href = `../live/live.html?artist=${encodeURIComponent(artist)}&count=${encodeURIComponent(count)}&image=${encodeURIComponent(image || '')}`
      window.location.href = href
    })
  }

  return button
}

export function mountPostArtiste(target, options) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return null
  const post = createPostArtiste(options)
  el.appendChild(post)
  return post
}
