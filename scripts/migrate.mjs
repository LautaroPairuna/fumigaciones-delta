// Applies pending Prisma migrations at container start (the Prisma CLI is not in the standalone
// image). Bookkeeping matches `_prisma_migrations`, so `prisma migrate status/resolve` keep working.
// Bundled to migrate.cjs by esbuild during the build; the site starts even if this fails.
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mariadb from "mariadb";

const LOCK = "fumigaciones_delta_migrate";
const APP_TABLES = ["section", "media", "user"];

// Bundled as CommonJS, `import.meta` is empty and `__dirname` is the standalone folder.
const here =
  typeof __dirname === "string" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = [
  path.join(here, "prisma", "migrations"),
  path.join(here, "..", "prisma", "migrations"),
].find((dir) => existsSync(dir));

function log(message) {
  console.log(`[migrate] ${message}`);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  if (!migrationsDir) throw new Error("prisma/migrations not found next to the script");

  const url = new URL(databaseUrl);
  const connection = await mariadb.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    allowPublicKeyRetrieval: true,
    multipleStatements: true,
  });

  try {
    const [{ locked }] = await connection.query("SELECT GET_LOCK(?, 60) AS locked", [LOCK]);
    if (Number(locked) !== 1) throw new Error("Could not get the migration lock within 60 s");

    const tables = (await connection.query("SHOW TABLES")).map((row) => Object.values(row)[0]);
    if (!tables.includes("_prisma_migrations")) {
      const existing = APP_TABLES.filter((table) => tables.includes(table));
      if (existing.length > 0) {
        throw new Error(
          `La base ya tiene tablas (${existing.join(", ")}) pero no tiene historial de migraciones. Hacé un baseline con prisma migrate resolve; no se escribió nada.`,
        );
      }
      await connection.query(`CREATE TABLE _prisma_migrations (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        finished_at DATETIME(3) NULL,
        migration_name VARCHAR(255) NOT NULL,
        logs TEXT NULL,
        rolled_back_at DATETIME(3) NULL,
        started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        applied_steps_count INT UNSIGNED NOT NULL DEFAULT 0
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    }

    const rows = await connection.query(
      "SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations",
    );
    const failed = rows.filter((row) => !row.finished_at && !row.rolled_back_at);
    if (failed.length > 0) {
      throw new Error(
        `Migración fallida pendiente de resolver: ${failed.map((row) => row.migration_name).join(", ")}`,
      );
    }
    const applied = new Set(rows.filter((row) => row.finished_at).map((row) => row.migration_name));

    const pending = readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !applied.has(entry.name))
      .map((entry) => entry.name)
      .sort();

    if (pending.length === 0) {
      log("database is up to date");
      return;
    }

    for (const name of pending) {
      const sql = readFileSync(path.join(migrationsDir, name, "migration.sql"), "utf8");
      const id = randomUUID();
      const checksum = createHash("sha256").update(sql).digest("hex");
      await connection.query(
        "INSERT INTO _prisma_migrations (id, checksum, migration_name, started_at) VALUES (?, ?, ?, NOW(3))",
        [id, checksum, name],
      );
      try {
        await connection.query(sql);
      } catch (error) {
        await connection.query("UPDATE _prisma_migrations SET logs = ? WHERE id = ?", [
          String(error?.message ?? error),
          id,
        ]);
        throw new Error(`${name}: ${error?.message ?? error}`);
      }
      await connection.query(
        "UPDATE _prisma_migrations SET finished_at = NOW(3), applied_steps_count = 1 WHERE id = ?",
        [id],
      );
      log(`applied ${name}`);
    }
  } finally {
    await connection.query("SELECT RELEASE_LOCK(?)", [LOCK]).catch(() => {});
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`[migrate] ATENCION: las migraciones no se aplicaron. ${error?.message ?? error}`);
  process.exitCode = 1;
});
