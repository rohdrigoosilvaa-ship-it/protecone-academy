import { PrismaClient } from "@prisma/client";

// evita múltiplas instâncias em dev (hot reload) e em funções serverless
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
