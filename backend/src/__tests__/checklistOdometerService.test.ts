import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Prisma } from "@prisma/client";
import { applyTruckOdometerFromChecklist } from "../services/checklistOdometerService";

const TRUCK_ID = "550e8400-e29b-41d4-a716-446655440000";

type MockState = {
  truck: { totalKm: number } | null;
  truckKmAfterUpdate: number | null;
  tireIncrement: number | null;
  tireUpdateCount: number;
};

function createMockDb(
  options: { truck?: { totalKm: number } | null; tireUpdateCount?: number } = {},
) {
  const state: MockState = {
    truck: options.truck === undefined ? { totalKm: 0 } : options.truck,
    truckKmAfterUpdate: null,
    tireIncrement: null,
    tireUpdateCount: options.tireUpdateCount ?? 3,
  };

  const db = {
    truck: {
      findUnique: async () => state.truck,
      update: async ({
        data,
      }: {
        data: { totalKm: number };
      }) => {
        state.truckKmAfterUpdate = data.totalKm;
        if (state.truck) state.truck.totalKm = data.totalKm;
      },
    },
    tire: {
      updateMany: async ({
        where,
        data,
      }: {
        where: { truckId: string; active: boolean };
        data: { currentKm: { increment: number } };
      }) => {
        assert.equal(where.truckId, TRUCK_ID);
        assert.equal(where.active, true);
        state.tireIncrement = data.currentKm.increment;
        return { count: state.tireUpdateCount };
      },
    },
  };

  return { db: db as unknown as Prisma.TransactionClient, state };
}

describe("applyTruckOdometerFromChecklist", () => {
  it("retorna erro quando caminhão não existe", async () => {
    const { db } = createMockDb({ truck: null });
    const result = await applyTruckOdometerFromChecklist(db, TRUCK_ID, 100_000);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /não encontrado/i);
    }
  });

  it("rejeita hodômetro menor que o último registrado", async () => {
    const { db, state } = createMockDb({ truck: { totalKm: 50_000 } });
    const result = await applyTruckOdometerFromChecklist(db, TRUCK_ID, 49_999);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /não pode ser menor/i);
    }
    assert.equal(state.truckKmAfterUpdate, null);
    assert.equal(state.tireIncrement, null);
  });

  it("na primeira leitura (totalKm=0) só atualiza o caminhão, sem alterar pneus", async () => {
    const { db, state } = createMockDb({ truck: { totalKm: 0 } });
    const result = await applyTruckOdometerFromChecklist(db, TRUCK_ID, 185_420);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.truckKm, 185_420);
      assert.equal(result.deltaKm, 185_420);
      assert.equal(result.tiresUpdated, 0);
    }
    assert.equal(state.truckKmAfterUpdate, 185_420);
    assert.equal(state.tireIncrement, null);
  });

  it("aceita hodômetro igual ao anterior sem incrementar pneus", async () => {
    const { db, state } = createMockDb({ truck: { totalKm: 120_000 } });
    const result = await applyTruckOdometerFromChecklist(db, TRUCK_ID, 120_000);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.deltaKm, 0);
      assert.equal(result.tiresUpdated, 0);
    }
    assert.equal(state.truckKmAfterUpdate, 120_000);
    assert.equal(state.tireIncrement, null);
  });

  it("incrementa currentKm dos pneus ativos quando há KM rodado", async () => {
    const { db, state } = createMockDb({
      truck: { totalKm: 100_000 },
      tireUpdateCount: 4,
    });
    const result = await applyTruckOdometerFromChecklist(db, TRUCK_ID, 100_350);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.deltaKm, 350);
      assert.equal(result.tiresUpdated, 4);
    }
    assert.equal(state.truckKmAfterUpdate, 100_350);
    assert.equal(state.tireIncrement, 350);
  });
});
