import { db } from '~/db'
import { activities, goals, activitiesToGoals } from '~/db/schema'
import { desc, eq, sql, gte, lte, and } from 'drizzle-orm'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorised',
    })
  }

  const query = getQuery(event)

  if (query.count) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const data = await db
      .select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(gte(activities.created_at, today.toISOString()))

    return data
  }

  const baseQuery = db
    .select()
    .from(activities)
    .where(eq(session.id, activities.userId))
    .leftJoin(
      activitiesToGoals,
      eq(activities.id, activitiesToGoals.activityId)
    )
    .leftJoin(goals, eq(activitiesToGoals.goalId, goals.goalId))
    .orderBy(desc(activities.created_at))

  const goalId = query.goalId as number

  function singleDateQuery(query: any) {
    const q = query.replaceAll('"', '')
    const d = new Date(q)
    d.setHours(0, 0, 0, 0)
    const endOfDay = new Date(d)
    endOfDay.setHours(23, 59, 59, 999)
    // Add filter for a specific date
    baseQuery.where(
      and(
        eq(session.id, activities.userId),
        gte(activities.created_at, d.toISOString() as string),
        lte(activities.created_at, endOfDay.toISOString() as string)
      )
    )
  }

  if (query.date && typeof query.date === 'string') {
    singleDateQuery(query.date)
  }

  if (query.date && Array.isArray(query.date)) {
    if (query.date[1] === 'null') {
      singleDateQuery(query.date[0])
    } else {
      const start = new Date(query.date[0])
      const end = new Date(query.date[1])

      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      baseQuery.where(
        and(
          eq(session.id, activities.userId),
          gte(activities.created_at, start.toISOString() as string),
          lte(activities.created_at, end.toISOString() as string)
        )
      )
    }
  }

  const data = goalId
    ? await baseQuery.where(eq(goals.goalId, goalId))
    : await baseQuery

  if (!data || !data.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No activities were found',
    })
  }

  type GroupedType = Record<
    string,
    {
      activity: (typeof data)[0]['activity']
      activity_to_goal: (typeof data)[0]['activity_to_goal']
      goals: Array<(typeof data)[0]['goal']>
    }
  >

  // Maintain the order of activities
  const activityOrder: number[] = []
  const groupedDataMap: GroupedType = data.reduce(
    (result: GroupedType, item) => {
      const { activity, activity_to_goal, goal } = item

      if (!activityOrder.includes(activity.id)) {
        activityOrder.push(activity.id)
      }

      const existingActivity = result[activity.id]

      if (existingActivity) {
        existingActivity.goals.push(goal)
      } else {
        result[activity.id] = {
          activity,
          activity_to_goal,
          goals: [goal],
        }
      }

      return result
    },
    {}
  )
  const groupedData = activityOrder.map(
    (activityId) => groupedDataMap[activityId]
  )

  return groupedData
})
