import { getNode } from '@formkit/core'

export const useFocus = (id) => {
  const node = getNode(id)

  if (!node) return

  node.context.fns.focus()
}
