import { db } from '~/db'
import { tasks, goals, tasksToGoals } from '~/db/schema'
import { sql } from 'drizzle-orm'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const query = getQuery(event)

  if (!session?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorised',
    })
  }

  let start = new Date(),
    end = new Date()

  function singleDateQuery(query: any) {
    start = new Date(query)
    end = new Date(start)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  }

  const setDateQuery = () => {
    if (!query.date) return ''

    if (query.date && typeof query.date === 'string') {
      singleDateQuery(query.date)
    }

    if (query.date && Array.isArray(query.date)) {
      if (query.date[1] === 'null') {
        singleDateQuery(query.date)
      } else {
        start = new Date(query.date[0])
        end = new Date(query.date[1])

        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
      }
    }
  }

  setDateQuery()

  const finalSql = sql.empty()
  const finalCountSql = sql.empty()

  finalSql.append(sql`
    SELECT ${tasks.id}, ${tasks.title}, ${tasks.description}, ${tasks.completed}, ${tasks.created_at}, ${tasksToGoals.goalId} as goal_id
    FROM ${tasks}
    LEFT JOIN ${tasksToGoals} ON ${tasks.id} = ${tasksToGoals.taskId}
    LEFT JOIN ${goals} ON ${tasksToGoals.goalId} = ${goals.goalId}
    WHERE ${session.id} = ${tasks.userId}
  `)

  if (query.date) {
    finalSql.append(
      sql`
      AND ${tasks.created_at} >= ${start.toISOString()} AND
      ${tasks.created_at} <= ${end.toISOString()}`
    )
  }

  finalCountSql.append(sql`
    SELECT COUNT(${tasks.id})
    FROM ${tasks}
    WHERE ${session.id} = ${tasks.userId}
  `)

  if (query.date) {
    finalCountSql.append(sql`
      AND ${tasks.created_at} >= ${start.toISOString()} AND
      ${tasks.created_at} <= ${end.toISOString()}
    `)
  }

  // find a better way to not repeat this twice
  if (query.filter !== 'all' && query.filter) {
    if (query.filter === 'completed') {
      finalSql.append(sql`AND ${tasks.completed} = TRUE`)
      finalCountSql.append(sql`AND ${tasks.completed} = TRUE`)
    }

    if (query.filter === 'not_completed') {
      finalSql.append(sql`AND ${tasks.completed} = FALSE`)
      finalCountSql.append(sql`AND ${tasks.completed} = FALSE`)
    }
  }

  finalSql.append(sql` ORDER BY ${tasks.completed} ASC, ${tasks.created_at} DESC
    LIMIT ${query.limit || '20'}
    OFFSET ${query.offset || '0'}
  `)

  const data = await db.execute(finalSql)
  const total = await db.execute(finalCountSql)

  return {
    tasks: data,
    total: total[0]?.count,
  }
})
