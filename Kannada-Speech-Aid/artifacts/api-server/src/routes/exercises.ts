import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { exercisesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  ListExercisesQueryParams,
  GetExerciseParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/exercises", async (req, res) => {
  const query = ListExercisesQueryParams.safeParse(req.query);
  let rows = await db.select().from(exercisesTable).orderBy(exercisesTable.orderIndex);
  if (query.success) {
    if (query.data.category) {
      rows = rows.filter((e) => e.category === query.data.category);
    }
    if (query.data.difficulty) {
      rows = rows.filter((e) => e.difficulty === query.data.difficulty);
    }
  }
  res.json(rows);
});

router.get("/exercises/:id", async (req, res) => {
  const params = GetExerciseParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [exercise] = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.id, params.data.id));
  if (!exercise) {
    res.status(404).json({ error: "Exercise not found" });
    return;
  }
  res.json(exercise);
});

export default router;
