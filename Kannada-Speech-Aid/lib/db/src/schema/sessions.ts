import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";
import { exercisesTable } from "./exercises";

export const therapySessionsTable = pgTable("therapy_sessions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("in_progress"),
});

export const speechAttemptsTable = pgTable("speech_attempts", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => therapySessionsTable.id),
  exerciseId: integer("exercise_id").notNull().references(() => exercisesTable.id),
  spokenText: text("spoken_text").notNull(),
  accuracyScore: real("accuracy_score").notNull(),
  feedbackText: text("feedback_text").notNull(),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(therapySessionsTable).omit({ id: true, startedAt: true });
export const insertAttemptSchema = createInsertSchema(speechAttemptsTable).omit({ id: true, attemptedAt: true });

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type TherapySession = typeof therapySessionsTable.$inferSelect;
export type SpeechAttempt = typeof speechAttemptsTable.$inferSelect;
