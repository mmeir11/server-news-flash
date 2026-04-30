import { prisma, seedDatabase } from './seed';

function quoteIdentifier(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

async function resetDatabase() {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_type = 'BASE TABLE'
      AND table_name <> '_prisma_migrations'
  `;

  if (tables.length === 0) {
    console.log('No application tables found to reset.');
    return;
  }

  const tableList = tables
    .map(({ table_name }) => quoteIdentifier(table_name))
    .join(', ');

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
  console.log(`Deleted data from ${tables.length} application tables.`);
}

async function main() {
  await resetDatabase();
  await seedDatabase();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });