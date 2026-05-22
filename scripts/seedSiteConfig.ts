import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Skip seed if a config already exists
  const existing = await prisma.site_config.findFirst();
  if (existing) {
    console.log("✅ site_config already exists, skipping seed.");
    return;
  }

  // Create a default site_config with all required fields
  await prisma.site_config.create({
    data: {
      // required fields
      categories: [],          // String[]
      subCategories: {},      // Json

      // optional sensible defaults
      storeName: "My E‑Shop",
      storeUrl: "https://example.com",
      supportEmail: "support@example.com",
      supportPhone: "+1-555-1234",
      description: "Default shop configuration",
      timezone: "UTC",
      currency: "USD",
      language: "en",
      dateFormat: "YYYY-MM-DD",
      themeMode: "light",
      accentColor: "#3498db",
      adminNotifications: {},
      layoutPreferences: {},
    },
  });

  console.log("✅ Default site_config created.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
