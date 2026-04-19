// import { Router, type IRouter } from "express";
// import { db } from "@workspace/db";
// import {
//   patientsTable,
//   therapySessionsTable,
//   speechAttemptsTable,
// } from "@workspace/db/schema";
// import { eq, avg, count, max } from "drizzle-orm";
// import {
//   CreatePatientBody,
//   GetPatientParams,
//   GetPatientSessionsParams,
//   GetPatientProgressParams,
// } from "@workspace/api-zod";

// const router: IRouter = Router();

// router.get("/patients", async (_req, res) => {
//   const patients = await db.select().from(patientsTable).orderBy(patientsTable.createdAt);

//   const result = await Promise.all(
//     patients.map(async (p) => {
//       const sessions = await db
//         .select({ count: count() })
//         .from(therapySessionsTable)
//         .where(eq(therapySessionsTable.patientId, p.id));

//       const scoreData = await db
//         .select({ avgScore: avg(speechAttemptsTable.accuracyScore) })
//         .from(speechAttemptsTable)
//         .innerJoin(
//           therapySessionsTable,
//           eq(speechAttemptsTable.sessionId, therapySessionsTable.id)
//         )
//         .where(eq(therapySessionsTable.patientId, p.id));

//       return {
//         ...p,
//         totalSessions: Number(sessions[0]?.count ?? 0),
//         averageScore: scoreData[0]?.avgScore ? Number(scoreData[0].avgScore) : null,
//       };
//     })
//   );

//   res.json(result);
// });

// router.post("/patients", async (req, res) => {
//   const body = CreatePatientBody.safeParse(req.body);
//   if (!body.success) {
//     res.status(400).json({ error: "Invalid request body" });
//     return;
//   }
//   const [patient] = await db
//     .insert(patientsTable)
//     .values(body.data)
//     .returning();
//   res.status(201).json({ ...patient, totalSessions: 0, averageScore: null });
// });

// router.get("/patients/:id", async (req, res) => {
//   const params = GetPatientParams.safeParse({ id: Number(req.params.id) });
//   if (!params.success) {
//     res.status(400).json({ error: "Invalid id" });
//     return;
//   }
//   const [patient] = await db
//     .select()
//     .from(patientsTable)
//     .where(eq(patientsTable.id, params.data.id));
//   if (!patient) {
//     res.status(404).json({ error: "Patient not found" });
//     return;
//   }

//   const sessions = await db
//     .select({ count: count() })
//     .from(therapySessionsTable)
//     .where(eq(therapySessionsTable.patientId, patient.id));

//   const scoreData = await db
//     .select({ avgScore: avg(speechAttemptsTable.accuracyScore) })
//     .from(speechAttemptsTable)
//     .innerJoin(
//       therapySessionsTable,
//       eq(speechAttemptsTable.sessionId, therapySessionsTable.id)
//     )
//     .where(eq(therapySessionsTable.patientId, patient.id));

//   res.json({
//     ...patient,
//     totalSessions: Number(sessions[0]?.count ?? 0),
//     averageScore: scoreData[0]?.avgScore ? Number(scoreData[0].avgScore) : null,
//   });
// });

// router.get("/patients/:id/sessions", async (req, res) => {
//   const params = GetPatientSessionsParams.safeParse({ id: Number(req.params.id) });
//   if (!params.success) {
//     res.status(400).json({ error: "Invalid id" });
//     return;
//   }
//   const sessions = await db
//     .select()
//     .from(therapySessionsTable)
//     .where(eq(therapySessionsTable.patientId, params.data.id))
//     .orderBy(therapySessionsTable.startedAt);

//   const result = await Promise.all(
//     sessions.map(async (s) => {
//       const attempts = await db
//         .select({ count: count(), avgScore: avg(speechAttemptsTable.accuracyScore) })
//         .from(speechAttemptsTable)
//         .where(eq(speechAttemptsTable.sessionId, s.id));

//       return {
//         ...s,
//         totalAttempts: Number(attempts[0]?.count ?? 0),
//         averageScore: attempts[0]?.avgScore ? Number(attempts[0].avgScore) : null,
//       };
//     })
//   );

//   res.json(result);
// });

// router.get("/patients/:id/progress", async (req, res) => {
//   const params = GetPatientProgressParams.safeParse({ id: Number(req.params.id) });
//   if (!params.success) {
//     res.status(400).json({ error: "Invalid id" });
//     return;
//   }
//   const patientId = params.data.id;

//   const sessions = await db
//     .select({ count: count() })
//     .from(therapySessionsTable)
//     .where(eq(therapySessionsTable.patientId, patientId));

//   const attempts = await db
//     .select()
//     .from(speechAttemptsTable)
//     .innerJoin(
//       therapySessionsTable,
//       eq(speechAttemptsTable.sessionId, therapySessionsTable.id)
//     )
//     .where(eq(therapySessionsTable.patientId, patientId))
//     .orderBy(speechAttemptsTable.attemptedAt);

//   const allAttempts = attempts.map((a) => a.speech_attempts);

//   const totalAttempts = allAttempts.length;
//   const avgScore = totalAttempts > 0
//     ? allAttempts.reduce((s, a) => s + a.accuracyScore, 0) / totalAttempts
//     : null;

//   const weeklyMap = new Map<string, { scores: number[]; count: number }>();
//   for (const a of allAttempts) {
//     const d = new Date(a.attemptedAt);
//     const weekStart = new Date(d);
//     weekStart.setDate(d.getDate() - d.getDay());
//     const week = weekStart.toISOString().slice(0, 10);
//     if (!weeklyMap.has(week)) weeklyMap.set(week, { scores: [], count: 0 });
//     const entry = weeklyMap.get(week)!;
//     entry.scores.push(a.accuracyScore);
//     entry.count++;
//   }

//   const weeklyScores = Array.from(weeklyMap.entries()).map(([week, data]) => ({
//     week,
//     averageScore: data.scores.reduce((s, v) => s + v, 0) / data.scores.length,
//     sessionsCount: data.count,
//   }));

//   const categoryMap = new Map<number, { scores: number[]; count: number }>();
//   for (const a of allAttempts) {
//     if (!categoryMap.has(a.exerciseId)) categoryMap.set(a.exerciseId, { scores: [], count: 0 });
//     const entry = categoryMap.get(a.exerciseId)!;
//     entry.scores.push(a.accuracyScore);
//     entry.count++;
//   }

//   const { exercisesTable: exercises } = await import("@workspace/db/schema");
//   const exerciseRows = await db.select().from(exercises);
//   const exerciseMap = new Map(exerciseRows.map((e) => [e.id, e]));

//   const catMap = new Map<string, { scores: number[]; count: number }>();
//   for (const [exerciseId, data] of categoryMap.entries()) {
//     const ex = exerciseMap.get(exerciseId);
//     const cat = ex?.category ?? "unknown";
//     if (!catMap.has(cat)) catMap.set(cat, { scores: [], count: 0 });
//     const entry = catMap.get(cat)!;
//     entry.scores.push(...data.scores);
//     entry.count += data.count;
//   }

//   const categoryScores = Array.from(catMap.entries()).map(([category, data]) => ({
//     category,
//     averageScore: data.scores.reduce((s, v) => s + v, 0) / data.scores.length,
//     totalAttempts: data.count,
//   }));

//   res.json({
//     patientId,
//     totalSessions: Number(sessions[0]?.count ?? 0),
//     totalAttempts,
//     averageScore: avgScore,
//     weeklyScores,
//     categoryScores,
//   });
// });

// export default router;

import { Router } from "express";

const router = Router();

// TEMP DATA
router.get("/", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Ravi",
      age: 47,
      condition: "Aphasia",
    },
  ]);
});

export default router;