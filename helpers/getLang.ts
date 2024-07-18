export const getLang = () => {
  if (!process.client) {
    return ''
  }

  if (!navigator) return ''

  if (navigator.languages.length) {
    return navigator.languages[0]
  }

  return navigator.language
}
