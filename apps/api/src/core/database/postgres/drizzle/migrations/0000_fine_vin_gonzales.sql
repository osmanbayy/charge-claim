CREATE TYPE "public"."charging_session_end_reason" AS ENUM('USER_STOPPED', 'TIME_LIMIT_REACHED');--> statement-breakpoint
CREATE TYPE "public"."charging_session_status" AS ENUM('ACTIVE', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."connector_operational_status" AS ENUM('ACTIVE', 'MAINTENANCE');--> statement-breakpoint
CREATE TYPE "public"."connector_type" AS ENUM('TYPE_2', 'CCS2');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('DRIVER', 'STAFF');--> statement-breakpoint
CREATE TABLE "charging_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"connector_id" integer NOT NULL,
	"reservation_id" integer,
	"status" charging_session_status DEFAULT 'ACTIVE' NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"planned_end_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"power_kw_snapshot" numeric(6, 2) NOT NULL,
	"price_per_kwh_snapshot" numeric(10, 2) NOT NULL,
	"energy_kwh" numeric(10, 3),
	"total_amount" numeric(12, 2),
	"end_reason" charging_session_end_reason,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "charging_sessions_reservation_id_unique" UNIQUE("reservation_id"),
	CONSTRAINT "charging_sessions_planned_end_after_start_check" CHECK ("charging_sessions"."planned_end_at" > "charging_sessions"."started_at")
);
--> statement-breakpoint
CREATE TABLE "connectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"type" "connector_type" NOT NULL,
	"power_kw" numeric(6, 2) NOT NULL,
	"price_per_kwh" numeric(10, 2) NOT NULL,
	"operational_status" "connector_operational_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connectors_power_kwh_positive_check" CHECK ("connectors"."power_kw" > 0),
	CONSTRAINT "connectors_price_per_kwh_positive_check" CHECK ("connectors"."price_per_kwh" > 0)
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"connector_id" integer NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"no_show_deadline_at" timestamp with time zone NOT NULL,
	"status" "reservation_status" DEFAULT 'CONFIRMED' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"no_show_email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservation_end_at_after_start_at_check" CHECK ("reservations"."end_at" > "reservations"."start_at")
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"district" varchar(50) NOT NULL,
	"address" varchar(255) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stations_latitude_range_check" CHECK ("stations"."latitude" BETWEEN -90 AND 90),
	CONSTRAINT "stations_longitude_range_check" CHECK ("stations"."longitude" BETWEEN -180 AND 180)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'DRIVER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "public"."connectors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connectors" ADD CONSTRAINT "connectors_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "public"."connectors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "charging_sessions_active_connector_unique" ON "charging_sessions" USING btree ("connector_id") WHERE "charging_sessions"."status" = 'ACTIVE';--> statement-breakpoint
CREATE UNIQUE INDEX "charging_sessions_active_user_unique" ON "charging_sessions" USING btree ("user_id") WHERE "charging_sessions"."status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "charging_sessions_user_id_started_at_index" ON "charging_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "charging_sessions_status_planned_end_at_index" ON "charging_sessions" USING btree ("status","planned_end_at");--> statement-breakpoint
CREATE UNIQUE INDEX "connectors_station_id_code_unique" ON "connectors" USING btree ("station_id","code");--> statement-breakpoint
CREATE INDEX "reservations_user_id_start_at_index" ON "reservations" USING btree ("user_id","start_at");--> statement-breakpoint
CREATE INDEX "reservations_connector_id_start_at_index" ON "reservations" USING btree ("connector_id","start_at");--> statement-breakpoint
CREATE INDEX "reservations_status_no_show_deadline_index" ON "reservations" USING btree ("status","no_show_deadline_at");