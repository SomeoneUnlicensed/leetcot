import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const challengesCount = await prisma.challenge.count();
  const tracksCount = await prisma.track.count();
  const tracks = await prisma.track.findMany();
  console.log('Challenges Count:', challengesCount);
  console.log('Tracks Count:', tracksCount);
  console.log('Tracks:', JSON.stringify(tracks, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
