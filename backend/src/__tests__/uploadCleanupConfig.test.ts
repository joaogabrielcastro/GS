import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  getUploadCleanupFolders,
  isProtectedUploadFolder,
  isUploadCleanupEnabled,
} from "../lib/uploadCleanupConfig";

describe("uploadCleanupConfig", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it("protege checklist e occurrences", () => {
    assert.equal(isProtectedUploadFolder("checklist"), true);
    assert.equal(isProtectedUploadFolder("occurrences"), true);
    assert.equal(isProtectedUploadFolder("tires"), false);
  });

  it("em produção cleanup desligado por padrão", () => {
    process.env.NODE_ENV = "production";
    delete process.env.UPLOAD_CLEANUP_ENABLED;
    assert.equal(isUploadCleanupEnabled(), false);
  });

  it("não inclui pastas protegidas na limpeza", () => {
    process.env.UPLOAD_CLEANUP_FOLDERS = "checklist,occurrences,tires";
    assert.deepEqual(getUploadCleanupFolders(), ["tires"]);
  });
});
