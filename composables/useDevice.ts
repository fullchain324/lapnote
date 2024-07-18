import { ref } from 'vue'

export const useDevice = () => {
  if (!process.client) return

  const isMobile = ref(false)
  const setMobilevalue = () => {
    return window.innerWidth < 1440
  }

  isMobile.value = setMobilevalue()

  window.addEventListener('resize', () => {
    isMobile.value = setMobilevalue()
  })

  return isMobile
}
