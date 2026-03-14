import "dotenv/config";
import { prisma } from "../../src/shared/db";

const isProduction = process.env.NODE_ENV === "production";
const allowSeedInProduction = process.env.ALLOW_SEED_IN_PRODUCTION === "true";

if (isProduction && !allowSeedInProduction) {
  console.error(
    "Seed is not allowed in production unless ALLOW_SEED_IN_PRODUCTION=true"
  );
  process.exit(1);
}

async function main() {
  // Add seed functions from prisma/seeds/*.ts and run in dependency order, e.g.:
  // await seedUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
