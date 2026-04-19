import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  role: text("role").notNull().default("patient"), // ✅ ADD THIS

  age: integer("age"),
  condition: text("condition"),

  therapistNotes: text("therapist_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});