import { db } from '~/db'
import { milestones } from '~/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorised',
    })
  }

  // const data = await db.insert(milestones).values({

  // })

  if (!data) {
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an issue creating the milestone',
    })
  }

  return {
    data,
  }
})
