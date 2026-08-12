import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Instead of throwing (which produces an HTML 500 page), log clearly.
  // Every API route should check for this and return a JSON 503.
  console.error(
    "\n❌  DATABASE_URL is not set.\n" +
    "    Copy .env.example → .env and add your PostgreSQL connection string.\n" +
    "    Then run:  npx drizzle-kit push\n"
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __resumatePool?: Pool;
};

export const pool =
  globalForDb.__resumatePool ??
  new Pool({ connectionString: databaseUrl || "postgresql://localhost/missing" });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__resumatePool = pool;
}

export const db = drizzle(pool);
