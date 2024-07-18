ALTER TABLE "activity" ADD COLUMN "updated_at" timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "goal" ADD COLUMN "updated_at" timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "completed_at" timestamp(6) with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "updated_at" timestamp(6) with time zone;