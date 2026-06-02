import uuidByString from 'uuid-by-string';
import { prisma } from '../src';

const LEETCOT_ID = uuidByString('leetcot');

try {
  await prisma.user.upsert({
    where: { id: LEETCOT_ID },
    update: {},
    create: {
      id: LEETCOT_ID,
      email: 'admin@leetcot.ru',
      name: 'ЛитКот',
      userLinks: {
        create: {
          url: 'https://leetcot.ru',
        },
      },
    },
  });

  console.log('Prod seed completed: Admin user created.');
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}
