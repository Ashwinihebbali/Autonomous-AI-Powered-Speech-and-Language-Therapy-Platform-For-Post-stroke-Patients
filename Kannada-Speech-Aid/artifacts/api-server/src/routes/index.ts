import { Router } from "express";

import exercisesRoutes from "./exercises";
import patientsRoutes from "./patients";
import sessionsRoutes from "./sessions";
import progressRoutes from "./progress";
import speechRoutes from "./speech";
import authRoutes from "./auth";

const router = Router(); // ✅ THIS WAS MISSING

router.use("/exercises", exercisesRoutes);
router.use("/patients", patientsRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/progress", progressRoutes);
router.use("/speech", speechRoutes);

// ✅ Add auth here
router.use("/auth", authRoutes);

export default router;