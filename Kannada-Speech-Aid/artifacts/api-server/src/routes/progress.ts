import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  patientsTable,
  therapySessionsTable,
  speechAttemptsTable,
} from "@workspace/db/schema";
import { eq, count, avg, max } from "drizzle-orm";

const router: IRouter = Router();

router.get("/progress/summary", async (_req, res) => {
  const patients = await db.select().from(patientsTable);

  const result = await Promise.all(
    patients.map(async (p) => {
      const sessions = await db
        .select({ count: count(), lastSession: max(therapySessionsTable.startedAt) })
        .from(therapySessionsTable)
        .where(eq(therapySessionsTable.patientId, p.id));

      const scoreData = await db
        .select({ avgScore: avg(speechAttemptsTable.accuracyScore) })
        .from(speechAttemptsTable)
        .innerJoin(
          therapySessionsTable,
          eq(speechAttemptsTable.sessionId, therapySessionsTable.id)
        )
        .where(eq(therapySessionsTable.patientId, p.id));

      const totalSessions = Number(sessions[0]?.count ?? 0);
      const lastSessionDate = sessions[0]?.lastSession ?? null;
      const averageScore = scoreData[0]?.avgScore ? Number(scoreData[0].avgScore) : null;

      let trend: "improving" | "stable" | "declining" | "no_data" = "no_data";
      if (totalSessions >= 2) {
        const recentSessions = await db
          .select()
          .from(therapySessionsTable)
          .where(eq(therapySessionsTable.patientId, p.id))
          .orderBy(therapySessionsTable.startedAt)
          .limit(6);

        if (recentSessions.length >= 2) {
          const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
          const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));

          const getAvg = async (sessionIds: number[]) => {
            if (sessionIds.length === 0) return null;
            let totalScore = 0;
            let count = 0;
            for (const sid of sessionIds) {
              const attempts = await db
                .select()
                .from(speechAttemptsTable)
                .where(eq(speechAttemptsTable.sessionId, sid));
              for (const a of attempts) {
                totalScore += a.accuracyScore;
                count++;
              }
            }
            return count > 0 ? totalScore / count : null;
          };

          const firstAvg = await getAvg(firstHalf.map((s) => s.id));
          const secondAvg = await getAvg(secondHalf.map((s) => s.id));

          if (firstAvg !== null && secondAvg !== null) {
            const diff = secondAvg - firstAvg;
            if (diff > 5) trend = "improving";
            else if (diff < -5) trend = "declining";
            else trend = "stable";
          }
        }
      }

      return {
        patientId: p.id,
        patientName: p.name,
        totalSessions,
        lastSessionDate,
        averageScore,
        trend,
      };
    })
  );

  res.json(result);
});

export default router;
