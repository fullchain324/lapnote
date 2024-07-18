import { db } from '~/db'
import { summaries } from '~/db/schema'
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
      statusMessage: 'Cannot remove summary without an id',
    })
  }

  await db.delete(summaries).where(eq(summaries.id, body.id))

  return {
    body,
  }
})
