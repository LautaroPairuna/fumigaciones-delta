import { randomUUID } from "node:crypto";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";

const MIN_PASSWORD = 12;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  const rl = createInterface({ input: stdin, terminal: false });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (prompt: string) => {
    stdout.write(prompt);
    const { value } = await lines.next();
    return typeof value === "string" ? value : "";
  };
  const email = (await ask("Email: ")).trim().toLowerCase();
  const name = (await ask("Nombre: ")).trim() || email;
  const password = await ask(`Contraseña (mínimo ${MIN_PASSWORD} caracteres): `);
  rl.close();
  stdout.write("\n");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email inválido");
  if (password.length < MIN_PASSWORD) throw new Error("Contraseña demasiado corta");

  const url = new URL(databaseUrl);
  const prisma = new PrismaClient({
    adapter: new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      allowPublicKeyRetrieval: true,
      connectionLimit: 1,
    }),
  });

  try {
    const hash = await hashPassword(password);
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { id: randomUUID(), email, name, emailVerified: true },
    });
    const account = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });
    if (account) {
      await prisma.account.update({ where: { id: account.id }, data: { password: hash } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      console.log(`Contraseña actualizada para ${email}; se cerraron sus sesiones.`);
    } else {
      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: hash,
        },
      });
      console.log(`Administrador creado: ${email}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
