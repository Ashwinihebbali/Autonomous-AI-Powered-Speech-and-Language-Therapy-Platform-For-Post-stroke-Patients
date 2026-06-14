import { Router } from "express";
import { db, patientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    const user = await db
      .insert(patientsTable)
      .values({
        name,
        email,
        password,
        role: role || "patient",
        age: 0,
        condition: role === "therapist" ? "N/A" : "New",
      } as any)
      .returning();
    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.email, email));

    if (user.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user[0].password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;