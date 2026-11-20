import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // `prisma generate` runs during the build without a database; migrate commands still need it.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
