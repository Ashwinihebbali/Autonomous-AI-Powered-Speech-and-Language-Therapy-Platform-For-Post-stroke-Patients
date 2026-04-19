import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  therapySessionsTable,
  speechAttemptsTable,
} from "@workspace/db/schema";
import { eq, count, avg } from "drizzle-orm";
import {
  CreateSessionBody,
  GetSessionParams,
  UpdateSessionParams,
  UpdateSessionBody,
  RecordAttemptParams,
  RecordAttemptBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/sessions", async (req, res) => {
  const body = CreateSessionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [session] = await db
    .insert(therapySessionsTable)
    .values({ patientId: body.data.patientId, status: "in_progress" })
    .returning();

  res.status(201).json({ ...session, totalAttempts: 0, averageScore: null });
});

router.get("/sessions/:id", async (req, res) => {
  const params = GetSessionParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [session] = await db
    .select()
    .from(therapySessionsTable)
    .where(eq(therapySessionsTable.id, params.data.id));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const attempts = await db
    .select()
    .from(speechAttemptsTable)
    .where(eq(speechAttemptsTable.sessionId, session.id))
    .orderBy(speechAttemptsTable.attemptedAt);

  const stats = await db
    .select({ count: count(), avgScore: avg(speechAttemptsTable.accuracyScore) })
    .from(speechAttemptsTable)
    .where(eq(speechAttemptsTable.sessionId, session.id));

  res.json({
    ...session,
    totalAttempts: Number(stats[0]?.count ?? 0),
    averageScore: stats[0]?.avgScore ? Number(stats[0].avgScore) : null,
    attempts,
  });
});

router.patch("/sessions/:id", async (req, res) => {
  const params = UpdateSessionParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateSessionBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const updates: Partial<typeof therapySessionsTable.$inferInsert> = {};
  if (body.data.status) {
    updates.status = body.data.status;
    if (body.data.status === "completed") {
      updates.completedAt = new Date();
    }
  }

  const [session] = await db
    .update(therapySessionsTable)
    .set(updates)
    .where(eq(therapySessionsTable.id, params.data.id))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const stats = await db
    .select({ count: count(), avgScore: avg(speechAttemptsTable.accuracyScore) })
    .from(speechAttemptsTable)
    .where(eq(speechAttemptsTable.sessionId, session.id));

  res.json({
    ...session,
    totalAttempts: Number(stats[0]?.count ?? 0),
    averageScore: stats[0]?.avgScore ? Number(stats[0].avgScore) : null,
  });
});

router.post("/sessions/:id/attempts", async (req, res) => {
  const params = RecordAttemptParams.safeParse({ id: Number(req.params.id) });
  const body = RecordAttemptBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [attempt] = await db
    .insert(speechAttemptsTable)
    .values({
      sessionId: params.data.id,
      exerciseId: body.data.exerciseId,
      spokenText: body.data.spokenText,
      accuracyScore: body.data.accuracyScore,
      feedbackText: body.data.feedbackText,
    })
    .returning();

  res.status(201).json(attempt);
});

export default router;
