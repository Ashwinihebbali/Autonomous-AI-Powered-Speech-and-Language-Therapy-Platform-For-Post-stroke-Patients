import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { therapySessionsTable, speechAttemptsTable } from "@workspace/db/schema";
import { eq, count, avg } from "drizzle-orm";

const router: IRouter = Router();

// POST /api/sessions
router.post("/", async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) { res.status(400).json({ error: "patientId required" }); return; }
    const [session] = await db
      .insert(therapySessionsTable)
      .values({ patientId, status: "in_progress" })
      .returning();
    res.status(201).json({ ...session, totalAttempts: 0, averageScore: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// GET /api/sessions/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [session] = await db
      .select()
      .from(therapySessionsTable)
      .where(eq(therapySessionsTable.id, id));
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    const attempts = await db
      .select()
      .from(speechAttemptsTable)
      .where(eq(speechAttemptsTable.sessionId, id));
    const stats = await db
      .select({ count: count(), avgScore: avg(speechAttemptsTable.accuracyScore) })
      .from(speechAttemptsTable)
      .where(eq(speechAttemptsTable.sessionId, id));
    res.json({
      ...session,
      totalAttempts: Number(stats[0]?.count ?? 0),
      averageScore: stats[0]?.avgScore ? Number(stats[0].avgScore) : null,
      attempts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// PATCH /api/sessions/:id
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const updates: any = {};
    if (status) {
      updates.status = status;
      if (status === "completed") updates.completedAt = new Date();
    }
    const [session] = await db
      .update(therapySessionsTable)
      .set(updates)
      .where(eq(therapySessionsTable.id, id))
      .returning();
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update session" });
  }
});

router.post("/:id/complete-beacon", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) { res.status(400).end(); return; }

    await db
      .update(therapySessionsTable)
      .set({
        status: "completed",
        completedAt: new Date()
      })
      .where(eq(therapySessionsTable.id, id));

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

router.post("/:id/attempts", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { exerciseId, spokenText, accuracyScore, feedbackText } = req.body;
    const [attempt] = await db
      .insert(speechAttemptsTable)
      .values({ sessionId: id, exerciseId, spokenText, accuracyScore, feedbackText })
      .returning();
    res.status(201).json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record attempt" });
  }
});

export default router;