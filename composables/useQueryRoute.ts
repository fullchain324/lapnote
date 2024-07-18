export const useQueryRoute = (
  operation: string,
  key?: string,
  value?: string
) => {
  const route = useRouter()

  const { currentRoute, push, replace } = route

  const addToRoute = (key: string, value: string) => {
    if (!key || !value) {
      throw new Error('Cannot add to route without a key/value pair')
    }
    push({
      query: {
        ...currentRoute.value.query,
        [key]: value,
      },
    })
  }

  const removeFromRoute = (key: string) => {
    if (!key) {
      throw new Error('Cannot delete from route without a key')
    }

    const query = { ...currentRoute.value.query }
    delete query[key]

    replace({
      query: Object.keys(query).length ? { ...query } : {},
    })
  }

  const reset = () => {
    replace({
      query: {},
    })
  }

  switch (operation) {
    case 'add':
      if (!key || !value) return

      addToRoute(key, value)
      break
    case 'remove':
      if (!key) return
      removeFromRoute(key)
      break
    case 'get':
      return currentRoute.value.query
    case 'reset':
      reset()
      break
  }
}
