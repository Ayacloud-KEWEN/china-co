ALTER TABLE "cities" ADD COLUMN "office_rent" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "cities" ADD COLUMN "avg_wage" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "cities" ADD COLUMN "fdi" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "executives" jsonb;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "entity_type" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "entity_slug" text;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "summary" jsonb;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "source_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "region" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "effective_date" text DEFAULT '' NOT NULL;