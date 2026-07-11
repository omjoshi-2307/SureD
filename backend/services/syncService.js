const { Contract, rpc, nativeToScVal, scValToNative, TransactionBuilder, BASE_FEE, Networks, Keypair } = require("@stellar/stellar-sdk");
const Escrow = require("../models/Escrow");
const { createHistoryRecord } = require("../controllers/historyController");

// Normalize PascalCase enum to UPPER_SNAKE_CASE
function normalizeStatus(statusVal) {
  if (!statusVal) return null;
  let sStr = "";
  if (statusVal instanceof Map) {
    sStr = String(statusVal.keys().next().value || "");
  } else if (typeof statusVal === "object") {
    sStr = Object.keys(statusVal)[0] || "";
  } else {
    sStr = String(statusVal);
  }

  return sStr
    .replace(/([A-Z])/g, "_$1")
    .toUpperCase()
    .replace(/^_+/, "");
}

// Main sync logic
exports.syncEscrowState = async (escrowId) => {
  const escrow = await Escrow.findOne({ escrowId: Number(escrowId) });
  if (!escrow) {
    throw new Error("Escrow not found in database.");
  }

  const rpcUrl = process.env.VITE_SOROBAN_RPC || "https://soroban-testnet.stellar.org";
  const networkPassphrase = process.env.VITE_NETWORK_PASSPHRASE || Networks.TESTNET;
  const contractId = escrow.contractId;

  const server = new rpc.Server(rpcUrl);
  const contract = new Contract(contractId);

  // Simulation dummy source
  const tempKey = Keypair.random();
  const sourceAccount = new rpc.Account(tempKey.publicKey(), "0");
  const escrowIdScVal = nativeToScVal(BigInt(escrowId), { type: "u64" });

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call("get_escrow", escrowIdScVal))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if (simResult.error) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  if (!simResult.results || simResult.results.length === 0) {
    throw new Error("No result returned from simulation.");
  }

  const scVal = simResult.results[0].retval;
  if (!scVal || scVal.switch().value === 0) { // scvVoid or null
    throw new Error("Escrow not found on blockchain.");
  }

  const nativeVal = scValToNative(scVal);
  if (!nativeVal) {
    throw new Error("Failed to parse on-chain escrow structure.");
  }

  // Parse status
  let rawStatus = nativeVal.status;
  if (nativeVal instanceof Map) {
    rawStatus = nativeVal.get("status");
  }
  const onChainStatus = normalizeStatus(rawStatus);

  if (!onChainStatus) {
    throw new Error("Failed to normalize blockchain status.");
  }

  const dbStatus = escrow.status;
  let synchronized = false;

  if (dbStatus !== onChainStatus) {
    escrow.status = onChainStatus;
    await escrow.save();

    // Log a synchronization event
    try {
      await createHistoryRecord({
        escrowId: Number(escrowId),
        txHash: `SYNC_ACTION_${Date.now()}`,
        action: 'SYNC',
        actorWallet: 'SYSTEM',
        network: escrow.blockchainNetwork || "Stellar Testnet",
        contractId,
        statusBefore: dbStatus,
        statusAfter: onChainStatus,
      });
    } catch (err) {
      console.error("Failed to log sync history:", err);
    }
    synchronized = true;
  }

  return {
    blockchainState: {
      escrowId: Number(escrowId),
      status: onChainStatus,
      studentConfirmed: nativeVal.student_confirmed || nativeVal.studentConfirmed || false,
      landlordConfirmed: nativeVal.landlord_confirmed || nativeVal.landlordConfirmed || false,
    },
    databaseState: {
      escrowId: escrow.escrowId,
      status: escrow.status,
    },
    synchronized,
  };
};
