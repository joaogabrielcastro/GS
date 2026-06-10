import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createChecklistBodySchema } from "../schemas/checklistSchemas";

const TRUCK_ID = "550e8400-e29b-41d4-a716-446655440000";

const basePayload = {
  truckId: TRUCK_ID,
  overallCondition: "BOM",
  tiresCondition: "BOM",
  cabinCondition: "BOM",
  canvasCondition: "BOM",
};

describe("createChecklistBodySchema", () => {
  it("exige hodômetro no corpo da requisição", () => {
    const result = createChecklistBodySchema.safeParse(basePayload);
    assert.equal(result.success, false);
  });

  it("aceita hodômetro numérico e string coercível", () => {
    const asNumber = createChecklistBodySchema.safeParse({
      ...basePayload,
      odometer: 185_420,
    });
    assert.equal(asNumber.success, true);
    if (asNumber.success) {
      assert.equal(asNumber.data.odometer, 185_420);
    }

    const asString = createChecklistBodySchema.safeParse({
      ...basePayload,
      odometer: "92000",
    });
    assert.equal(asString.success, true);
    if (asString.success) {
      assert.equal(asString.data.odometer, 92_000);
    }
  });

  it("aceita hodômetro zero", () => {
    const result = createChecklistBodySchema.safeParse({
      ...basePayload,
      odometer: 0,
    });
    assert.equal(result.success, true);
  });

  it("rejeita hodômetro negativo", () => {
    const result = createChecklistBodySchema.safeParse({
      ...basePayload,
      odometer: -100,
    });
    assert.equal(result.success, false);
  });
});
