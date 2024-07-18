function initDate() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

export const useSelectedDate = defineStore('selectedDate', () => {
  const currentDate: Ref<string | string[] | null> = ref(initDate())

  const isSelectedToday = () => {
    if (Array.isArray(currentDate.value) || !currentDate.value) return false

    const today = new Date()
    const current = new Date(currentDate.value)
    today.setHours(0, 0, 0, 0)
    current.setHours(0, 0, 0, 0)

    return today.toISOString() === current.toISOString()
  }

  const changeCurrentDate = (newDate: string | string[] | null) => {
    return (currentDate.value = newDate)
  }

  return { currentDate, changeCurrentDate, isSelectedToday }
})
