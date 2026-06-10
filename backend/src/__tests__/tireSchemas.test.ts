import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTireBodySchema, updateTireBodySchema } from "../schemas/tireSchemas";

const TRUCK_ID = "550e8400-e29b-41d4-a716-446655440000";

const baseTire = {
  code: "PNE-001",
  brand: "Bridgestone",
  model: "R283",
  position: "E1E",
  truckId: TRUCK_ID,
  cost: 2500,
  initialKm: 45_000,
};

describe("createTireBodySchema", () => {
  it("permite cadastro sem vida útil (pneu já em uso)", () => {
    const result = createTireBodySchema.safeParse(baseTire);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.lifeExpectancyKm, undefined);
      assert.equal(result.data.initialKm, 45_000);
    }
  });

  it("trata vida útil vazia como opcional", () => {
    const result = createTireBodySchema.safeParse({
      ...baseTire,
      lifeExpectancyKm: "",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.lifeExpectancyKm, undefined);
    }
  });

  it("aceita vida útil quando informada", () => {
    const result = createTireBodySchema.safeParse({
      ...baseTire,
      lifeExpectancyKm: 120_000,
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.lifeExpectancyKm, 120_000);
    }
  });

  it("aceita KM inicial zero para pneu novo", () => {
    const result = createTireBodySchema.safeParse({
      ...baseTire,
      initialKm: 0,
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.initialKm, 0);
    }
  });

  it("rejeita vida útil inválida (zero ou negativa)", () => {
    const zero = createTireBodySchema.safeParse({
      ...baseTire,
      lifeExpectancyKm: 0,
    });
    assert.equal(zero.success, false);

    const negative = createTireBodySchema.safeParse({
      ...baseTire,
      lifeExpectancyKm: -500,
    });
    assert.equal(negative.success, false);
  });
});

describe("updateTireBodySchema", () => {
  it("permite remover vida útil enviando string vazia", () => {
    const result = updateTireBodySchema.safeParse({
      lifeExpectancyKm: "",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.lifeExpectancyKm, undefined);
    }
  });
});
