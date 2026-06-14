import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { exercisesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    let rows = await db.select().from(exercisesTable).orderBy(exercisesTable.orderIndex);
    const { category, difficulty } = req.query;
    if (category) rows = rows.filter((e) => e.category === category);
    if (difficulty) rows = rows.filter((e) => e.difficulty === difficulty);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
    const [exercise] = await db
      .select()
      .from(exercisesTable)
      .where(eq(exercisesTable.id, id));
    if (!exercise) { res.status(404).json({ error: "Exercise not found" }); return; }
    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exercise" });
  }
});

export default router;