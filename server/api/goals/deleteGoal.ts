import { db } from '~/db'
import { goals, tasksToGoals } from '~/db/schema'
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
      statusMessage: 'Cannot remove goal without id',
    })
  }

  // delete the tasks to goals before
  // deleting the goal
  try {
    await db.delete(tasksToGoals).where(eq(tasksToGoals.goalId, body.id))
  } catch (error) {
    // fail silently
  }

  const goal = await db
    .delete(goals)
    .where(eq(goals.goalId, body.id))
    .returning()

  return goal
})
