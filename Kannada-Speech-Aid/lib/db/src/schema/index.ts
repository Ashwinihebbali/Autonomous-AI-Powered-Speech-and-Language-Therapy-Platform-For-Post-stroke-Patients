import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

// keep your existing exports
export * from "./exercises";
export * from "./patients";
export * from "./sessions";
export * from "./conversations";
export * from "./messages";