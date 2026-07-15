ALTER TABLE "playbooks" ADD COLUMN "summary" jsonb;--> statement-breakpoint
ALTER TABLE "playbooks" ADD COLUMN "steps" jsonb;--> statement-breakpoint
ALTER TABLE "playbooks" ADD COLUMN "documents" jsonb;--> statement-breakpoint
ALTER TABLE "playbooks" ADD COLUMN "departments" jsonb;--> statement-breakpoint
ALTER TABLE "playbooks" ADD COLUMN "risks" jsonb;--> statement-breakpoint
ALTER TABLE "playbooks" ADD COLUMN "tips" jsonb;--> statement-breakpoint
ALTER TABLE "playbooks" ADD COLUMN "faq" jsonb;--> statement-breakpoint
ALTER TABLE "playbooks" ADD COLUMN "related_cities" jsonb;--> statement-breakpoint
ALTER TABLE "playbooks" ADD COLUMN "source_url" text DEFAULT '' NOT NULL;