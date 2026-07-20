CREATE TABLE "divisions" (
	"code" text PRIMARY KEY NOT NULL,
	"parent_code" text,
	"level" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text DEFAULT '' NOT NULL,
	"city_slug" text,
	"gdp" text DEFAULT '' NOT NULL,
	"pop" text DEFAULT '' NOT NULL,
	"pillars" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" jsonb,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "divisions_parent_idx" ON "divisions" USING btree ("parent_code");--> statement-breakpoint
CREATE INDEX "divisions_name_idx" ON "divisions" USING btree ("name");