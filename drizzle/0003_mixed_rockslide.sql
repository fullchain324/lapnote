CREATE TABLE IF NOT EXISTS "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"userId" text,
	"completed" boolean DEFAULT false,
	"created_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "todo_to_goal" (
	"todo_id" serial NOT NULL,
	"goal_id" serial NOT NULL,
	CONSTRAINT todo_to_goal_todo_id_goal_id PRIMARY KEY("todo_id","goal_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todos" ADD CONSTRAINT "todos_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todo_to_goal" ADD CONSTRAINT "todo_to_goal_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todo_to_goal" ADD CONSTRAINT "todo_to_goal_goal_id_goal_goalId_fk" FOREIGN KEY ("goal_id") REFERENCES "goal"("goalId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
