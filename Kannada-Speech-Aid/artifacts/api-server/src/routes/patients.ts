import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { patientsTable, therapySessionsTable, speechAttemptsTable } from "@workspace/db/schema";
import { eq, avg, count, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/patients
router.get("/", async (_req, res) => {
  try {
    const patients = await db.select({
      id: patientsTable.id, name: patientsTable.name,
      email: patientsTable.email, role: patientsTable.role,
      age: patientsTable.age, condition: patientsTable.condition,
      therapistNotes: patientsTable.therapistNotes, createdAt: patientsTable.createdAt,
    }).from(patientsTable).where(eq(patientsTable.role, "patient")).orderBy(patientsTable.createdAt);

    const result = await Promise.all(patients.map(async (p) => {
      const sessions = await db.select({ count: count() }).from(therapySessionsTable).where(eq(therapySessionsTable.patientId, p.id));
      const scoreData = await db.select({ avgScore: avg(speechAttemptsTable.accuracyScore) }).from(speechAttemptsTable).innerJoin(therapySessionsTable, eq(speechAttemptsTable.sessionId, therapySessionsTable.id)).where(eq(therapySessionsTable.patientId, p.id));
      return { ...p, totalSessions: Number(sessions[0]?.count ?? 0), averageScore: scoreData[0]?.avgScore ? Number(scoreData[0].avgScore) : null };
    }));
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to fetch patients" }); }
});

// POST /api/patients
router.post("/", async (req, res) => {
  try {
    const { name, age, condition, email, password, role } = req.body;
    const [patient] = await db.insert(patientsTable).values({
      name: name || "New Patient", age: age || 0,
      condition: condition || "New",
      email: email || `patient${Date.now()}@example.com`,
      password: password || "password123",
      role: role || "patient"
    } as any).returning();
    res.status(201).json({ ...patient, totalSessions: 0, averageScore: null });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to create patient" }); }
});

// GET /api/patients/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
    if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
    const sessions = await db.select({ count: count() }).from(therapySessionsTable).where(eq(therapySessionsTable.patientId, id));
    const scoreData = await db.select({ avgScore: avg(speechAttemptsTable.accuracyScore) }).from(speechAttemptsTable).innerJoin(therapySessionsTable, eq(speechAttemptsTable.sessionId, therapySessionsTable.id)).where(eq(therapySessionsTable.patientId, id));
    // REPLACE WITH:
    res.json({ ...patient, totalSessions: Number(sessions[0]?.count ?? 0), averageScore: scoreData[0]?.avgScore ? Number(scoreData[0].avgScore) : null });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to fetch patient" }); }
});

// PATCH /api/patients/:id/notes
router.patch("/:id/notes", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

    const { therapistNotes } = req.body;

    const [updated] = await db
      .update(patientsTable)
      .set({ therapistNotes })
      .where(eq(patientsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Patient not found" }); return; }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notes" });
  }
});

// GET /api/patients/:id/sessions
router.get("/:id/sessions", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const sessions = await db
      .select()
      .from(therapySessionsTable)
      .where(eq(therapySessionsTable.patientId, id))
      .orderBy(desc(therapySessionsTable.startedAt));

    // For each session, fetch attempt count and average score
    const enriched = await Promise.all(sessions.map(async (s) => {
      const stats = await db
        .select({
          totalAttempts : count(),
          averageScore  : avg(speechAttemptsTable.accuracyScore),
        })
        .from(speechAttemptsTable)
        .where(eq(speechAttemptsTable.sessionId, s.id));

      return {
        ...s,
        totalAttempts: Number(stats[0]?.totalAttempts ?? 0),
        averageScore : stats[0]?.averageScore
          ? Math.round(Number(stats[0].averageScore))
          : null,
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// GET /api/patients/:id/progress
router.get("/:id/progress", async (req, res) => {
  try {
    const patientId = Number(req.params.id);

    const sessions = await db.select({ count: count() }).from(therapySessionsTable).where(eq(therapySessionsTable.patientId, patientId));

    const attempts = await db.select().from(speechAttemptsTable)
      .innerJoin(therapySessionsTable, eq(speechAttemptsTable.sessionId, therapySessionsTable.id))
      .where(eq(therapySessionsTable.patientId, patientId))
      .orderBy(speechAttemptsTable.attemptedAt);

    const allAttempts   = attempts.map(a => a.speech_attempts);
    const totalAttempts = allAttempts.length;
    const avgScore      = totalAttempts > 0 ? allAttempts.reduce((s, a) => s + a.accuracyScore, 0) / totalAttempts : null;

    // Weekly scores
    const weeklyMap = new Map<string, number[]>();
    for (const a of allAttempts) {
      const d = new Date(a.attemptedAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const week = weekStart.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      if (!weeklyMap.has(week)) weeklyMap.set(week, []);
      weeklyMap.get(week)!.push(a.accuracyScore);
    }
    const weeklyScores = Array.from(weeklyMap.entries()).map(([week, scores]) => ({
      week,
      averageScore : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      sessionsCount: scores.length,
    }));

    // Category scores
    const { exercisesTable } = await import("@workspace/db/schema");
    const exerciseRows = await db.select().from(exercisesTable);
    const exerciseMap  = new Map(exerciseRows.map(e => [e.id, e]));

    const catMap = new Map<string, number[]>();
    for (const a of allAttempts) {
      const cat = exerciseMap.get(a.exerciseId)?.category ?? "other";
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(a.accuracyScore);
    }
    const categoryScores = Array.from(catMap.entries()).map(([category, scores]) => ({
      category,
      averageScore : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      totalAttempts: scores.length,
    }));

    res.json({ patientId, totalSessions: Number(sessions[0]?.count ?? 0), totalAttempts, averageScore: avgScore, weeklyScores, categoryScores });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to fetch progress" }); }
});

export default router;