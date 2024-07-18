import { db } from '~/db'
import { goals } from '~/db/schema'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorised',
    })
  }

  const body = await readBody(event)

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot add empty goal',
    })
  }

  await db.insert(goals).values({
    title: body.title,
    userId: session.id,
    description: body.description,
    content: body.content,
  })

  return {
    body,
  }
})
