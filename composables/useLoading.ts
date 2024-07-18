import { ref } from 'vue'
export const useLoading = (
  state: globalThis.Ref<boolean>,
  throttle: number = 750
) => {
  const shouldShowLoading = ref(true)
  watch(state, (prev) => {
    if (!state.value) {
      shouldShowLoading.value = false
      return { shouldShowLoading }
    }
    setTimeout(() => {
      if (state.value === prev) {
        shouldShowLoading.value = true
        return { shouldShowLoading }
      }
    }, throttle)
  })

  return { shouldShowLoading }
}
