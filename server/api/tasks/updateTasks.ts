import { db } from '~/db'
import { tasks } from '~/db/schema'
import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

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
      statusMessage: 'Cannot update task without a title',
    })
  }

  const task = await db
    .update(tasks)
    .set({
      title: body.title,
      completed: body.completed,
      description: body.description,
      completed_at: body.completed_at,
      updated_at: body.updated_at,
    })
    .where(eq(tasks.id, body.id))
    .returning()

  return task
})
