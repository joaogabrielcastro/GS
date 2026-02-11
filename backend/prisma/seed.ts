import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar usuários de exemplo
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Motorista
  const motorista = await prisma.user.upsert({
    where: { email: "motorista@gs.com" },
    update: {},
    create: {
      email: "motorista@gs.com",
      password: hashedPassword,
      name: "João Motorista",
      cpf: "12345678901",
      phone: "11987654321",
      role: "MOTORISTA",
      active: true,
    },
  });

  // Administrador
  const admin = await prisma.user.upsert({
    where: { email: "admin@gs.com" },
    update: {},
    create: {
      email: "admin@gs.com",
      password: hashedPassword,
      name: "Amanda Administradora",
      cpf: "98765432109",
      phone: "11987654322",
      role: "ADMINISTRADOR",
      active: true,
    },
  });

  // Financeiro
  const financeiro = await prisma.user.upsert({
    where: { email: "financeiro@gs.com" },
    update: {},
    create: {
      email: "financeiro@gs.com",
      password: hashedPassword,
      name: "Carlos Financeiro",
      cpf: "45678912345",
      phone: "11987654323",
      role: "FINANCEIRO",
      active: true,
    },
  });

  console.log("✅ Usuários criados:");
  console.log("   📧 motorista@gs.com / Senha: 123456");
  console.log("   📧 admin@gs.com / Senha: 123456");
  console.log("   📧 financeiro@gs.com / Senha: 123456");
  console.log("");
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
