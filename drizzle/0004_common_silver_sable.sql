CREATE TABLE "fx" (
	"cur" text PRIMARY KEY NOT NULL,
	"cny_per" text NOT NULL,
	"change_pct" text NOT NULL,
	"up" boolean NOT NULL,
	"spark" jsonb NOT NULL,
	"date" text NOT NULL
);
