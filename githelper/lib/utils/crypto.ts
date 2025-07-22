export function generateSecureRandom(length: number = 32): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length)
    const randomValues = window.crypto.getRandomValues(array)
    return Array.from(randomValues).map(value => value.toString(16).padStart(2, '0')).join('')
  }
  return ''
}