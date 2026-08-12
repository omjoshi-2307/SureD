const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

describe("Transaction History Unit Tests", () => {
  // Simulating in-memory history storage and deduplication logic
  const mockHistoryDB = new Map();

  function recordHistory({ txHash, action, actorWallet, role, amount, escrowId, mongoEscrowId }) {
    if (mockHistoryDB.has(txHash)) {
      return { duplicate: true, record: mockHistoryDB.get(txHash) };
    }
    const newRecord = {
      _id: "hist_" + Date.now() + "_" + Math.random(),
      txHash,
      action,
      actorWallet,
      role,
      amount,
      escrowId,
      mongoEscrowId,
      createdAt: new Date(),
    };
    mockHistoryDB.set(txHash, newRecord);
    return { duplicate: false, record: newRecord };
  }

  function queryHistoryByWallet(wallet, escrows = []) {
    const walletRegex = new RegExp("^" + wallet.trim() + "$", "i");
    const escrowMongoIds = escrows.map((e) => String(e._id));
    const escrowNumericIds = escrows.map((e) => e.escrowId).filter((id) => id !== undefined && id !== null);

    const allRecords = Array.from(mockHistoryDB.values());

    return allRecords.filter((rec) => {
      const matchActor = walletRegex.test(rec.actorWallet);
      const matchMongoEscrow = rec.mongoEscrowId && escrowMongoIds.includes(rec.mongoEscrowId);
      const matchNumericEscrow = rec.escrowId !== undefined && escrowNumericIds.includes(rec.escrowId);
      return matchActor || matchMongoEscrow || matchNumericEscrow;
    });
  }

  test("Transaction deduplication prevents duplicate records with identical txHash", () => {
    mockHistoryDB.clear();
    const txHash = "f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8";

    const res1 = recordHistory({
      txHash,
      action: "ESCROW_CREATED",
      actorWallet: "GBKIVCMERKV22Y3TG4WBIX4VUYB4OTY64BRZND4UY6FPMJKIPGUEB7SP",
      role: "student",
      amount: 1000,
      escrowId: 1,
    });
    assert.equal(res1.duplicate, false);

    const res2 = recordHistory({
      txHash,
      action: "ESCROW_CREATED",
      actorWallet: "GBKIVCMERKV22Y3TG4WBIX4VUYB4OTY64BRZND4UY6FPMJKIPGUEB7SP",
      role: "student",
      amount: 1000,
      escrowId: 1,
    });
    assert.equal(res2.duplicate, true);
    assert.equal(mockHistoryDB.size, 1);
  });

  test("Query returns records by actorWallet even if escrows list is initially empty", () => {
    mockHistoryDB.clear();
    const studentWallet = "GDSTUDENT1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1";

    recordHistory({
      txHash: "tx_deposit_001",
      action: "DEPOSIT",
      actorWallet: studentWallet,
      role: "student",
      amount: 500,
    });

    const results = queryHistoryByWallet(studentWallet, []);
    assert.equal(results.length, 1);
    assert.equal(results[0].action, "DEPOSIT");
  });

  test("Case-insensitive wallet query retrieves history correctly", () => {
    mockHistoryDB.clear();
    const exactWallet = "GBKIVCMERKV22Y3TG4WBIX4VUYB4OTY64BRZND4UY6FPMJKIPGUEB7SP";

    recordHistory({
      txHash: "tx_landlord_confirm",
      action: "LANDLORD_CONFIRM",
      actorWallet: exactWallet,
      role: "landlord",
      escrowId: 5,
    });

    const results = queryHistoryByWallet("  gbkivcmerkv22y3tg4wbix4vuyb4oty64brznd4uy6fpmjkipgueb7sp  ", []);
    assert.equal(results.length, 1);
    assert.equal(results[0].txHash, "tx_landlord_confirm");
  });
});
