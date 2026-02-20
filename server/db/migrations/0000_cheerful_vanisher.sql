CREATE TYPE "public"."training_intensity" AS ENUM('low', 'moderate', 'high');--> statement-breakpoint
CREATE TABLE "athletes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "athletes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"date_of_birth" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "athletes_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "trainings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trainings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"athlete_id" integer NOT NULL,
	"type" varchar(100) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"intensity" "training_intensity" NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;