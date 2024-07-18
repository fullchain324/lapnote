import { db } from '~/db'
// import { milestones } from '~/db/schema'
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

  // const data = await db.query.milestones.findMany({
  //   where: eq(milestones.userId, session.id),
  // })

  const data = 'hello'

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No milestones found',
    })
  }

  return {
    data,
  }
})
