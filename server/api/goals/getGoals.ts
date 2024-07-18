import { db } from '~/db'
import { activitiesToGoals, goals, tasks, tasksToGoals } from '~/db/schema'
import { sql } from 'drizzle-orm'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorised',
    })
  }

  const data = await db.execute(sql`
  SELECT ${goals.title}, ${goals.description}, ${goals.content}, ${goals.goalId},
    COUNT(${tasksToGoals.taskId}) AS total_tasks,
    SUM(CASE WHEN ${tasks.completed} THEN 1 ELSE 0 END) AS completed_tasks,
    (SELECT COUNT(*) FROM ${activitiesToGoals} WHERE ${activitiesToGoals.goalId} = ${goals.goalId}) AS total_activities
  FROM ${goals}

    LEFT JOIN ${tasksToGoals} ON ${goals.goalId} = ${tasksToGoals.goalId}
    LEFT JOIN ${tasks} ON ${tasksToGoals.taskId} = ${tasks.id}
    WHERE ${session.id} = ${goals.userId}

    GROUP BY ${goals.title}, ${goals.description}, ${goals.content}, ${goals.goalId}
  `)

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No goals were found',
    })
  }

  return data
})
