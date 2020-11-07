export function copyToClipboard(str) {
  const el = document.createElement('textarea')

  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)

  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false

  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)

  if (selected) {
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}

// navigator.clipboard.writeText(window.location.href).catch((e) => {
//   console.log(e)
//   copyToClipboard(window.location.href)
//   e.currentTarget.focus()
// })

export function socialShare(data) {
  return new Promise((resolve, reject) => {
    if (navigator.share) {
      navigator
        .share(data)
        .then(resolve)
        .catch((error) => {
          // Differentiate between user 'AbortError' and internal errors.
          // E.g. Internal error: could not connect to Web Share interface.
          if (error.message.startsWith('Internal error:'))
            error.name = 'InternalError'

          reject(error)
        })

      const cancel = () =>
        setTimeout(() => {
          window.removeEventListener('focus', cancel)

          const error = new Error('Share cancelled')
          error.name = 'ShareTimeout'
          reject(error)
        }, 100)

      window.addEventListener('focus', cancel)
    } else {
      const error = new Error('Unsupported')
      error.name = 'Unsupported'
      reject(error)
    }
  })
}
