const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis as unknown as {
  prisma: typeof PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? [] : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;