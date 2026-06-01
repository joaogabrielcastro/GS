import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCsvContent, escapeCsvCell } from "../lib/csv";

describe("csv", () => {
  it("escapa aspas em células", () => {
    assert.equal(escapeCsvCell('texto "com" aspas'), '"texto ""com"" aspas"');
  });

  it("inclui BOM e separador ponto-e-vírgula", () => {
    const out = buildCsvContent(["A", "B"], [["1", "2"]]);
    assert.ok(out.startsWith("\uFEFF"));
    assert.ok(out.includes('"A";"B"'));
  });
});
