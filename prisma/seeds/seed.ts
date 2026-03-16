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

import { seedPayroll } from "./payrollSeed";

async function main() {
  await seedPayroll({ bypassValidation: true });
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
