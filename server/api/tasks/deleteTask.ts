import { db } from '~/db'
import { tasks, tasksToGoals } from '~/db/schema'
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

  if (!body.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot remove task without id',
    })
  }

  // delete the activities to goals before
  // deleting the activity
  try {
    await db.delete(tasksToGoals).where(eq(tasksToGoals.taskId, body.id))
  } catch (error) {
    // fail silently
  }

  await db.delete(tasks).where(eq(tasks.id, body.id))

  return {
    body,
  }
})
