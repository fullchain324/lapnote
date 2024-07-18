import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '~/db'
import { Adapter } from 'next-auth/adapters'
import crypto from 'node:crypto'

if (!process.client) {
  globalThis.crypto ??= crypto.webcrypto
}

export default NuxtAuthHandler({
  secret: process.env.NUXT_SECRET,
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt: async ({ token, account }) => {
      if (account) {
        token.accessToken = account.refresh_token
      }

      return token
    },
    session: async ({ session, user }) => {
      ;(session as any).id = user.id

      return Promise.resolve(session)
    },
  },
})
