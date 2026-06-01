import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizePlate } from "../lib/plates";

describe("normalizePlate", () => {
  it("remove hífens e espaços e coloca maiúsculas", () => {
    assert.equal(normalizePlate("bde-7h72"), "BDE7H72");
    assert.equal(normalizePlate("  abc 1234 "), "ABC1234");
  });
});
