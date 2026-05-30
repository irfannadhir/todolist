import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { DATABASE_URL, IS_DEVELOPMENT, IS_PRODUCTION } from "@/lib/constant";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({ connectionString: DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: IS_DEVELOPMENT ? ["error", "warn"] : ["error"],
  });

if (!IS_PRODUCTION) {
  globalForPrisma.prisma = prisma;
}
