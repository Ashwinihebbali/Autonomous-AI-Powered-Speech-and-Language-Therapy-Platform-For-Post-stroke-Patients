import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  patientsTable,
  therapySessionsTable,
  speechAttemptsTable,
} from "@workspace/db/schema";
import { eq, count, avg, max } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/progress/summary
router.get("/summary", async (_req, res) => {
  try {
    const patients = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.role, "patient"));

    const result = await Promise.all(
      patients.map(async (p) => {
        const sessions = await db
          .select({ count: count(), lastSession: max(therapySessionsTable.startedAt) })
          .from(therapySessionsTable)
          .where(eq(therapySessionsTable.patientId, p.id));

        const scoreData = await db
          .select({ avgScore: avg(speechAttemptsTable.accuracyScore) })
          .from(speechAttemptsTable)
          .innerJoin(therapySessionsTable, eq(speechAttemptsTable.sessionId, therapySessionsTable.id))
          .where(eq(therapySessionsTable.patientId, p.id));

        const totalSessions  = Number(sessions[0]?.count ?? 0);
        const lastSessionDate = sessions[0]?.lastSession ?? null;
        const averageScore   = scoreData[0]?.avgScore ? Number(scoreData[0].avgScore) : null;

        let trend: "improving" | "stable" | "declining" | "no_data" = "no_data";

        if (totalSessions >= 2) {
          const recentSessions = await db
            .select()
            .from(therapySessionsTable)
            .where(eq(therapySessionsTable.patientId, p.id))
            .orderBy(therapySessionsTable.startedAt)
            .limit(6);

          if (recentSessions.length >= 2) {
            const half      = Math.floor(recentSessions.length / 2);
            const firstHalf  = recentSessions.slice(0, half);
            const secondHalf = recentSessions.slice(half);

            const getAvg = async (sessionIds: number[]) => {
              let total = 0, cnt = 0;
              for (const sid of sessionIds) {
                const attempts = await db
                  .select()
                  .from(speechAttemptsTable)
                  .where(eq(speechAttemptsTable.sessionId, sid));
                for (const a of attempts) { total += a.accuracyScore; cnt++; }
              }
              return cnt > 0 ? total / cnt : null;
            };

            const firstAvg  = await getAvg(firstHalf.map(s => s.id));
            const secondAvg = await getAvg(secondHalf.map(s => s.id));

            if (firstAvg !== null && secondAvg !== null) {
              const diff = secondAvg - firstAvg;
              if (diff > 5)       trend = "improving";
              else if (diff < -5) trend = "declining";
              else                trend = "stable";
            }
          }
        }

        return {
          patientId    : p.id,
          patientName  : p.name,
          totalSessions,
          lastSessionDate,
          averageScore,
          trend,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch progress summary" });
  }
});

export default router;