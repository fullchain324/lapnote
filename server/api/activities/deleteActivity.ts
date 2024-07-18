import { db } from '~/db'
import { activities, activitiesToGoals } from '~/db/schema'
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

  if (!body.content || !body.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot remove activity without an id',
    })
  }

  // delete the activities to goals before
  // deleting the activity
  try {
    await db
      .delete(activitiesToGoals)
      .where(eq(activitiesToGoals.activityId, body.id))
  } catch (error) {
    // fail silently
  }

  await db.delete(activities).where(eq(activities.id, body.id))

  return {
    body,
  }
})
