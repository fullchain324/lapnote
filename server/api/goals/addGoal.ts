import { db } from '~/db'
import { activitiesToGoals, tasksToGoals } from '~/db/schema'
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

  if (!body.activityId && !body.taskId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Cannot add goal to activity/task without activity/task id',
    })
  }

  if (!body.goalId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot add goal to activity/task without goal id',
    })
  }

  // add goal to activity by adding it to the join table
  const goal = body.taskId
    ? await db.insert(tasksToGoals).values({
        taskId: body.taskId,
        goalId: body.goalId,
      })
    : await db.insert(activitiesToGoals).values({
        activityId: body.activityId,
        goalId: body.goalId,
      })

  return {
    goal,
  }
})
