import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const exercisesTable = pgTable("exercises", {
  id: serial("id").primaryKey(),
  kannadaText: text("kannada_text").notNull(),
  transliteration: text("transliteration").notNull(),
  englishMeaning: text("english_meaning").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  audioPrompt: text("audio_prompt"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertExerciseSchema = createInsertSchema(exercisesTable).omit({ id: true });
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercisesTable.$inferSelect;
