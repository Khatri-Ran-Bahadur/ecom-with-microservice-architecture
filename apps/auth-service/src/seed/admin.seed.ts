import "../env.ts";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

type Args = {
  email: string;
  password: string;
  name: string;
};

const getArg = (flag: string) => {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
};

const argsFromEnvOrCli = (): Args => {
  const email = getArg("--email") ?? process.env.ADMIN_EMAIL ?? "admin@eshop.com";
  const password = getArg("--password") ?? process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const name = getArg("--name") ?? process.env.ADMIN_NAME ?? "Super Admin";

  return { email, password, name };
};

async function main() {
  const prisma = new PrismaClient();
  try {
  const { email, password, name } = argsFromEnvOrCli();

  if (!email || !password || !name) {
    throw new Error("Missing required values. Provide --email/--password/--name or env ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_NAME.");
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.users.upsert({
    where: { email },
    create: {
      email,
      name,
      password: hashed,
      role: "Admin",
      following: [],
    },
    update: {
      name,
      password: hashed,
      role: "Admin",
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  // eslint-disable-next-line no-console
  console.log("[seed] admin ready:", admin);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error("[seed] failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma client is created inside main(); nothing to disconnect here.
  });

