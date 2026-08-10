import { PrismaClient } from '@prisma/client';

// En développement, Remix recharge le module à chaque modification : sans ce
// cache, chaque rechargement ouvrirait une nouvelle réserve de connexions.
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const prisma = global.prismaGlobal ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prismaGlobal = prisma;

export default prisma;
