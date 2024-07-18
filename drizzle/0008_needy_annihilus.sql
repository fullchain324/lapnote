CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"administrator_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams_to_users" (
	"team_id" serial NOT NULL,
	"user_id" serial NOT NULL,
	CONSTRAINT teams_to_users_team_id_user_id PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "feedback_data" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams_to_users" ADD CONSTRAINT "teams_to_users_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams_to_users" ADD CONSTRAINT "teams_to_users_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
