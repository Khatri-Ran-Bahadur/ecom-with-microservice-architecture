import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fixUpdatedAt() {
  const result = await prisma.site_config.updateMany({
    where: { updatedAt: null },
    data: { updatedAt: new Date() },
  });
  console.log('Updated site_config records:', result);
}

fixUpdatedAt()
  .then(() => process.exit())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
