import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const useTurso = Boolean(
  process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
);

const dbUrl = useTurso
  ? process.env.TURSO_DATABASE_URL!
  : process.env.DATABASE_URL || "file:./dev.db";

const authToken = useTurso ? process.env.TURSO_AUTH_TOKEN : undefined;

const adapter = new PrismaLibSql({
  url: dbUrl,
  ...(authToken ? { authToken } : {}),
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;