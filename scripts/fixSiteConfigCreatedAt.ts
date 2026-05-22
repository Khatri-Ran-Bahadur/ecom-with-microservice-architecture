import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixCreatedAt() {
  try {
    // Find records with a null createdAt and set it to the current date
    const result = await prisma.site_config.updateMany({
      where: { createdAt: { equals: null } },
      data: { createdAt: new Date() },
    });
    console.log("✅ Fixed createdAt for site_config records:", result);
  } catch (e) {
    console.error("❌ Error fixing createdAt:", e);
  } finally {
    await prisma.$disconnect();
  }
}

fixCreatedAt()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
