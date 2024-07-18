ALTER TABLE "task_to_goal" ALTER COLUMN "task_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "task_to_goal" ALTER COLUMN "goal_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "teams_to_users" ALTER COLUMN "team_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "teams_to_users" ALTER COLUMN "user_id" SET DATA TYPE serial;