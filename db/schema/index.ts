import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  boolean,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core'
import type { AdapterAccount } from '@auth/core/adapters'

export const users = pgTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
)

export const teams = pgTable('teams', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  image: text('image'),
  created_at: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  administrator_id: text('administrator_id').notNull(),
})

export const teamsToUsers = pgTable(
  'teams_to_users',
  {
    teamId: serial('team_id')
      .notNull()
      .references(() => teams.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.teamId, t.userId] }),
  })
)

export const activityTypeEnum = pgEnum('type', ['activity', 'feedback'])

export const activities = pgTable('activity', {
  id: serial('id').primaryKey().notNull(),
  description: text('description'),
  userId: text('userId').references(() => users.id),
  content: text('content').notNull(),
  type: activityTypeEnum('type').default('activity'),
  feedback_data: jsonb('feedback_data'),
  created_at: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updated_at: timestamp('updated_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }),
})

export const goals = pgTable('goal', {
  goalId: serial('goalId').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  userId: text('userId').references(() => users.id),
  created_at: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  updated_at: timestamp('updated_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }),
})

export const activitiesToGoals = pgTable(
  'activity_to_goal',
  {
    activityId: serial('activity_id')
      .notNull()
      .references(() => activities.id),
    goalId: serial('goal_id')
      .notNull()
      .references(() => goals.goalId),
  },
  (t) => ({
    pk: primaryKey(t.activityId, t.goalId),
  })
)

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  userId: text('userId').references(() => users.id),
  completed: boolean('completed').default(false),
  created_at: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  completed_at: timestamp('completed_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }),
  updated_at: timestamp('updated_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }),
})

export const tasksToGoals = pgTable(
  'task_to_goal',
  {
    taskId: serial('task_id')
      .notNull()
      .references(() => tasks.id),
    goalId: serial('goal_id')
      .notNull()
      .references(() => goals.goalId),
  },
  (t) => ({
    pk: primaryKey(t.taskId, t.goalId),
  })
)

export const summaries = pgTable('summary', {
  id: serial('id').notNull(),
  title: text('title'),
  description: text('description'),
  content: text('content'),
  userId: text('userId').references(() => users.id),
  dates: jsonb('dates'),
  ai_generated: boolean('ai_generated'),
  created_at: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
})
