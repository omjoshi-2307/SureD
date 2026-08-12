const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

describe("Soroban & Stellar Integration Unit Tests", () => {
  // XLM to stroops conversion helper (1 XLM = 10,000,000 stroops)
  function xlmToStroops(xlm) {
    return BigInt(Math.round(xlm * 10_000_000));
  }

  function stroopsToXlm(stroops) {
    return Number(stroops) / 10_000_000;
  }

  // Normalize PascalCase enum from Soroban to UPPER_SNAKE_CASE
  function normalizeStatus(statusVal) {
    if (!statusVal) return null;
    let sStr = "";
    if (typeof statusVal === "object" && statusVal !== null) {
      sStr = Object.keys(statusVal)[0] || "";
    } else {
      sStr = String(statusVal);
    }

    return sStr
      .replace(/([A-Z])/g, "_$1")
      .toUpperCase()
      .replace(/^_+/, "");
  }

  test("XLM to Stroops conversion precision", () => {
    assert.equal(xlmToStroops(1), 10_000_000n);
    assert.equal(xlmToStroops(1200), 12_000_000_000n);
    assert.equal(xlmToStroops(0.5), 5_000_000n);

    assert.equal(stroopsToXlm(10_000_000n), 1);
    assert.equal(stroopsToXlm(12_000_000_000n), 1200);
  });

  test("Normalize Soroban PascalCase status values to SureD status constants", () => {
    assert.equal(normalizeStatus("Created"), "CREATED");
    assert.equal(normalizeStatus("Funded"), "FUNDED");
    assert.equal(normalizeStatus("PendingConfirmation"), "PENDING_CONFIRMATION");
    assert.equal(normalizeStatus("Released"), "RELEASED");
    assert.equal(normalizeStatus("Refunded"), "REFUNDED");
    assert.equal(normalizeStatus("Disputed"), "DISPUTED");
    assert.equal(normalizeStatus("Cancelled"), "CANCELLED");

    // Object enum representation from Soroban scValToNative
    assert.equal(normalizeStatus({ PendingConfirmation: [] }), "PENDING_CONFIRMATION");
    assert.equal(normalizeStatus({ Released: [] }), "RELEASED");
  });

  test("Stellar Public Key format validation", () => {
    const validGKey = "GBKIVCMERKV22Y3TG4WBIX4VUYB4OTY64BRZND4UY6FPMJKIPGUEB7SP";
    assert.equal(validGKey.startsWith("G"), true);
    assert.equal(validGKey.length, 56);
    assert.match(validGKey, /^G[A-Z2-7]{55}$/);

    const validCKey = "CB6Y7J6KQOLJ7DDDV5265LBRUOPFVFDBNUVNQYRYJ3BGVXZTKUSBMF2X";
    assert.equal(validCKey.startsWith("C"), true);
    assert.equal(validCKey.length, 56);
    assert.match(validCKey, /^C[A-Z2-7]{55}$/);
  });
});
