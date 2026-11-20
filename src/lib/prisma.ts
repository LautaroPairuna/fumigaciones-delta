import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

function poolConfig(databaseUrl: string) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    // MySQL 8 users with caching_sha2_password fail right after a server restart without it.
    allowPublicKeyRetrieval: true,
    // The MySQL instance is shared between apps: keep the pool small and let idle connections go.
    connectionLimit: 5,
    minimumIdle: 0,
    idleTimeout: 60,
  };
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Created on first use: `next build` imports this module without runtime environment variables.
export function getPrisma(): PrismaClient {
  globalForPrisma.prisma ??= new PrismaClient({
    adapter: new PrismaMariaDb(poolConfig(env().DATABASE_URL)),
  });
  return globalForPrisma.prisma;
}
