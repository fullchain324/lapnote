/*
  Summaries endpoint
  takes a date, or array of dates
  and gets all the activities/tasks in between
  probably do some manipulation to
  make it AI digestible

  send it to the openAI API
  get the result back
  figure out if the result is including weird info
  we don't need and strip it
*/
import { getServerSession } from '#auth'
import { db } from '~/db'
import { sql } from 'drizzle-orm'
import { activities, tasks, summaries } from '~/db/schema'
import { OpenAI } from 'openai'
const runtimeConfig = useRuntimeConfig()
const { OPEN_AI_KEY, AI_PROMPT } = runtimeConfig

const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
})

export default defineEventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorised',
    })
  }

  const body = await readBody(event)

  if (!body.date) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Cannot fetch entries without dates, please select dates and try again',
    })
  }

  let startDate,
    endDate = null

  function singleDateQuery(query: any) {
    startDate = new Date(query)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(startDate)
    endDate.setHours(23, 59, 59, 999)
  }

  if (body.date && typeof body.date === 'string') {
    singleDateQuery(body.date)
  }

  if (body.date && Array.isArray(body.date)) {
    if (body.date[1] === 'null') {
      singleDateQuery(body.date)
    } else {
      startDate = new Date(body.date[0])
      endDate = new Date(body.date[1])

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    }
  }

  startDate = startDate?.toISOString()
  endDate = endDate?.toISOString()

  // get activities and (completed) tasks between two dates
  const data = await db.execute(sql`
    SELECT ${activities.content} as title,
    CASE WHEN ${activities.type} = 'activity' THEN 'activity' ELSE 'feedback' END as type
      FROM ${activities}
      WHERE ${session.id} = ${activities.userId}
      AND (${activities.created_at} >= ${startDate} AND ${activities.created_at} <= ${endDate})
    UNION
      SELECT ${tasks.title}, ${'task'}
      FROM ${tasks}
      WHERE ${session.id} = ${tasks.userId}
      AND (${tasks.created_at} >= ${startDate} AND ${tasks.created_at} <= ${endDate})
      AND ${tasks.completed} = TRUE
  `)

  if (!data.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot create a summary without any data.',
    })
  }

  let generatedSummary = null

  if (body?.use_ai) {
    try {
      generatedSummary = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `
          ${AI_PROMPT}

          ------
          ${JSON.stringify(data)}
          ------
        `,
          },
        ],
      })
    } catch (error: any) {
      throw createError({
        statusCode: (error?.status as number) || 500,
        statusMessage:
          'There was an issue with the OpenAI API, please try again later.',
      })
    }
  }

  try {
    await db.insert(summaries).values({
      title: (body?.title as string) || 'Summary',
      description: (body?.description as string) || '',
      content: body.use_ai ? generatedSummary?.choices[0].message.content : '',
      userId: session.id,
      ai_generated: (body?.use_ai as boolean) || false,
      dates: {
        startDate: startDate,
        endDate: endDate,
      },
    })
  } catch (error) {}

  return generatedSummary
})
