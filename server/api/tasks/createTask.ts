import { db } from '~/db'
import { goals, tasks, tasksToGoals } from '~/db/schema'
import { getServerSession } from '#auth'
import { sql } from 'drizzle-orm'

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
      statusMessage: 'Cannot add empty task',
    })
  }

  let task = null
  let taskToGoal = null
  let taskGoals = null

  try {
    task = await db
      .insert(tasks)
      .values({
        userId: session.id,
        title: body.title,
        description: body.description,
        created_at: body.createdAt,
      })
      .returning()
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot add task',
    })
  }

  if (body.goalId && task[0].id) {
    taskToGoal = await db
      .insert(tasksToGoals)
      .values({
        taskId: task[0].id,
        goalId: body.goalId,
      })
      .returning()

    taskGoals = await db.execute(sql`
      SELECT * FROM ${goals}
      WHERE ${session.id} = ${goals.userId} AND
      ${goals.goalId} = ${body.goalId}
      `)
  }

  return {
    tasks: task,
    task_to_goals: taskToGoal,
    goals: taskGoals,
  }
})
