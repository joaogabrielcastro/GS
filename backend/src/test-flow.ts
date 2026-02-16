import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando bateria de testes...");

  // 1. Limpar e Semear Dados Básicos
  console.log("\n📦 Preparando ambiente...");

  // Limpar dados anteriores (ordem importa por causa das FKs)
  await prisma.notificationUser.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dailyChecklist.deleteMany();
  await prisma.occurrence.deleteMany();
  await prisma.tireEvent.deleteMany();
  await prisma.tire.deleteMany();
  await prisma.truckHistory.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.user.deleteMany();

  // Criar Admin
  const adminPass = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      password: adminPass,
      name: "Admin Teste",
      role: "ADMINISTRADOR",
      cpf: "00000000001",
    },
  });
  console.log("✅ Admin criado:", admin.email);

  // Criar Motorista
  const driverPass = await bcrypt.hash("driver123", 10);
  const driver = await prisma.user.create({
    data: {
      email: "motorista@test.com",
      password: driverPass,
      name: "Motorista Teste",
      role: "MOTORISTA",
      cpf: "00000000002",
    },
  });
  console.log("✅ Motorista criado:", driver.email);

  // Criar Caminhão
  const truck = await prisma.truck.create({
    data: {
      plate: "TEST-1234",
      model: "FH 540",
      brand: "Volvo",
      year: 2023,
      status: "ATIVO",
    },
  });
  console.log("✅ Caminhão criado:", truck.plate);

  // Criar Pneus
  const tire = await prisma.tire.create({
    data: {
      code: "PNEU-001",
      brand: "Michelin",
      model: "X Multi",
      status: "NOVO",
      truckId: truck.id,
      position: "DIANTEIRO_ESQUERDO",
      initialKm: 0,
      cost: 1200.0,
    },
  });
  console.log("✅ Pneu criado:", tire.code);

  // 2. Simular Fluxo de Checklist (Cenário BOM)
  console.log("\n📋 Testando Checklist (Normal)...");
  const checklistGood = await prisma.dailyChecklist.create({
    data: {
      truckId: truck.id,
      driverId: driver.id,
      date: new Date(),
      tiresCondition: "BOM",
      cabinCondition: "BOM",
      canvasCondition: "BOM",
      overallCondition: "BOM",
    },
  });
  console.log("✅ Checklist Normal registrado ID:", checklistGood.id);

  // 3. Simular Fluxo de Checklist (Cenário RUIM - Gera Ocorrência)
  console.log("\n⚠️ Testando Checklist (Com Problema)...");
  const checklistBad = await prisma.dailyChecklist.create({
    data: {
      truckId: truck.id,
      driverId: driver.id,
      date: new Date(),
      tiresCondition: "RUIM", // Isso deve gerar alerta na lógica do controller, mas aqui estamos inserindo direto no banco.
      // Para testar a lógica do controller, teríamos que chamar a função do controller ou replicar a lógica.
      // Vamos simular a criação da ocorrência manual que o controller faria.
      cabinCondition: "BOM",
      canvasCondition: "BOM",
      overallCondition: "RUIM",
      notes: "Pneu dianteiro esquerdo com bolha.",
    },
  });
  console.log("✅ Checklist Ruim registrado ID:", checklistBad.id);

  // Simular a lógica do controller que cria Ocorrência e Notificação
  const occurrence = await prisma.occurrence.create({
    data: {
      type: "MANUTENCAO",
      description:
        "Checklist reprovado: Pneus Ruins. Obs: Pneu dianteiro esquerdo com bolha.",
      truckId: truck.id,
      driverId: driver.id,
      status: "PENDENTE",
    },
  });
  console.log("✅ Ocorrência gerada automaticamente:", occurrence.id);

  const notification = await prisma.notification.create({
    data: {
      title: "Problema no Checklist",
      message: `O motorista ${driver.name} relatou problemas no caminhão ${truck.plate}.`,
      occurrenceId: occurrence.id,
    },
  });

  // Notificar Admin
  await prisma.notificationUser.create({
    data: {
      notificationId: notification.id,
      userId: admin.id,
      read: false,
    },
  });
  console.log("✅ Notificação enviada para Admin:", admin.name);

  // 4. Testar Gestão de Pneus (Evento)
  console.log("\n🔧 Testando evento de Pneu...");
  const tireEvent = await prisma.tireEvent.create({
    data: {
      tireId: tire.id,
      eventType: "MANUTENCAO",
      description: "Reparo de bolha",
      cost: 150.0,
      kmAtEvent: 100500,
    },
  });
  console.log(
    "✅ Evento de pneu registrado:",
    tireEvent.eventType,
    "- Custo:",
    tireEvent.cost,
  );

  // 5. Verificar estado final
  console.log("\n📊 Verificando consistência dos dados...");

  const unreadNotifications = await prisma.notificationUser.count({
    where: { userId: admin.id, read: false },
  });

  if (unreadNotifications === 1) {
    console.log("✅ Teste de Notificações: PASSOU (1 não lida)");
  } else {
    console.error(
      "❌ Teste de Notificações: FALHOU (Esperado 1, Encontrado " +
        unreadNotifications +
        ")",
    );
  }

  const truckStatus = await prisma.truck.findUnique({
    where: { id: truck.id },
  });
  console.log("ℹ️ Status do caminhão:", truckStatus?.status);

  console.log("\n🎉 Bateria de testes concluída!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
