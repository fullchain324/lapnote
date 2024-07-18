ALTER TABLE "todos" RENAME TO "tasks";--> statement-breakpoint
ALTER TABLE "todo_to_goal" DROP CONSTRAINT "todo_to_goal_todo_id_todos_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "todos_userId_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todo_to_goal" ADD CONSTRAINT "todo_to_goal_todo_id_tasks_id_fk" FOREIGN KEY ("todo_id") REFERENCES "tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
