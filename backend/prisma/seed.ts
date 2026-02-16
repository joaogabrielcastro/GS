import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  // 1. Usuários
  console.log("👤 Criando usuários...");

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

  const motorista2 = await prisma.user.upsert({
    where: { email: "pedro@gs.com" },
    update: {},
    create: {
      email: "pedro@gs.com",
      password: hashedPassword,
      name: "Pedro Santos",
      cpf: "22233344455",
      phone: "11999887766",
      role: "MOTORISTA",
      active: true,
    },
  });

  // Admin
  await prisma.user.upsert({
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
  await prisma.user.upsert({
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

  // 2. Caminhões
  console.log("🚛 Criando caminhões...");

  const truck1 = await prisma.truck.upsert({
    where: { plate: "ABC-1234" },
    update: {},
    create: {
      plate: "ABC-1234",
      brand: "Volvo",
      model: "FH 540",
      year: 2022,
      totalKm: 150000,
      status: "ATIVO",
      acquisitionDate: new Date("2022-01-15"),
      notes: "Caminhão principal da frota",
      currentDriver: {
        // Fixed: drivers -> currentDriver
        connect: { id: motorista.id },
      },
    },
  });

  const truck2 = await prisma.truck.upsert({
    where: { plate: "XYZ-9876" },
    update: {},
    create: {
      plate: "XYZ-9876",
      brand: "Scania",
      model: "R 450",
      year: 2021,
      totalKm: 280000,
      status: "MANUTENCAO",
      acquisitionDate: new Date("2021-05-20"),
      notes: "Em manutenção preventiva",
    },
  });

  const truck3 = await prisma.truck.upsert({
    where: { plate: "MER-2023" },
    update: {},
    create: {
      plate: "MER-2023",
      brand: "Mercedes-Benz",
      model: "Actros 2651",
      year: 2023,
      totalKm: 50000,
      status: "ATIVO",
      acquisitionDate: new Date("2023-01-10"),
      notes: "Caminhão disponível para operações",
      currentDriver: undefined, // Sem motorista atribuído
    },
  });

  // 3. Atribuir caminhões a motoristas (se necessário atualizar relações existentes)
  // O connect acima já fez isso para o truck1.

  // 4. Checklists e Ocorrências
  console.log("📝 Criando registros...");

  // Tentar criar apenas se não existirem muitos (para não duplicar a cada seed se não limparmos)
  const countOcurrences = await prisma.occurrence.count();
  if (countOcurrences === 0) {
    // Ocorrência 1
    await prisma.occurrence.create({
      data: {
        type: "PNEU_ESTOURADO",
        status: "PENDENTE",
        description: "Pneu dianteiro direito estourou na estrada",
        driverId: motorista.id,
        truckId: truck1.id,
      },
    });

    // Ocorrência 2
    await prisma.occurrence.create({
      data: {
        type: "PROBLEMA_MECANICO",
        status: "EM_ANALISE",
        description: "Barulho estranho no motor",
        driverId: motorista2.id,
        truckId: truck2.id,
      },
    });
  }

  const countChecklists = await prisma.dailyChecklist.count();
  if (countChecklists === 0) {
    await prisma.dailyChecklist.create({
      data: {
        driverId: motorista.id,
        truckId: truck1.id,
        // kmStart removido pois não existe no schema
        overallCondition: "BOM", // Substituindo isApproved por overallCondition ou apenas removendo se não existir boolean
        // isApproved removido pois não existe no schema (assumindo based on logs)
        // Wait, let me check the read schema again.
        // Schema: overallCondition String?
        // No isApproved.
        notes: "Tudo certo",
        // checklistJSON removido pois não existe no schema
      },
    });
  }

  console.log("✅ Seed concluído! Dados inseridos:");
  console.log("   Login Motorista: motorista@gs.com / 123456");
  console.log("   Login Admin: admin@gs.com / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
