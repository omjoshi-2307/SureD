/**
 * sorobanService.ts — updated for @stellar/stellar-sdk v15.1.0
 *
 * Bridges the DepositSafe frontend with the SureDeposit Soroban smart contract.
 *
 * Contract entry-point used here: `initialize(student, landlord, amount)`
 *   - student  : Address  — the connected Freighter wallet (caller / student)
 *   - landlord : Address  — the landlord's Stellar public key
 *   - amount   : i128     — deposit amount in stroops (1 XLM = 10_000_000 stroops)
 *
 * Environment variables (set in .env at the frontend root):
 *   VITE_CONTRACT_ID          — deployed Soroban contract ID  (required)
 *   VITE_SOROBAN_RPC          — Soroban RPC URL               (default: Testnet)
 *   VITE_NETWORK_PASSPHRASE   — Stellar network passphrase    (default: Testnet)
 *
 * v15 migration notes
 * ───────────────────
 * • SorobanRpc  namespace → rpc  (lowercase export from stellar-sdk)
 * • SorobanRpc.Server    → rpc.Server
 * • SorobanRpc.Api.*     → rpc.Api.*
 * • SorobanRpc.assembleTransaction(tx, sim).build() → rpc.assembleTransaction(tx, sim)
 *   (v15 returns a Transaction directly, not a builder)
 * • Manual getTransaction() polling loop → server.pollTransaction(hash, opts)
 * • xdr.TransactionEnvelope.fromXDR() hack → TransactionBuilder.fromXDR()
 */

import {
  Contract,
  Networks,
  rpc,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  Address,
  scValToNative,
} from "@stellar/stellar-sdk";
import { signTransaction, getAddress } from "@stellar/freighter-api";

/* ── Configuration ──────────────────────────────────────────────── */
const CONTRACT_ID: string =
  import.meta.env.VITE_CONTRACT_ID ?? "PLACEHOLDER_CONTRACT_ID";

const RPC_URL: string =
  import.meta.env.VITE_SOROBAN_RPC ??
  "https://soroban-testnet.stellar.org";

const NETWORK_PASSPHRASE: string =
  import.meta.env.VITE_NETWORK_PASSPHRASE ?? Networks.TESTNET;

/* ── Types ───────────────────────────────────────────────────────── */
export interface CreateEscrowParams {
  /** Landlord's Stellar public key (G…) */
  landlordAddress: string;
  /** Deposit amount in XLM (e.g. 1200) */
  amountXlm: number;
}

export interface CreateEscrowResult {
  /** The submitted transaction hash */
  txHash: string;
  /** Generated escrow ID from the contract result */
  escrowId?: number;
  /** Student address used */
  studentWallet: string;
  /** Contract ID deployed */
  contractId: string;
}

export interface ReleaseEscrowResult {
  txHash: string;
}

/* ── Helper: XLM → stroops (i128 ScVal) ─────────────────────────── */
function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}

/* ── Main exported function ──────────────────────────────────────── */

/**
 * createEscrow
 *
 * 1. Gets the student's public key from Freighter.
 * 2. Builds a Soroban `initialize` invocation transaction.
 * 3. Prepares it via rpc.Server.prepareTransaction() (simulation + fee assembly).
 * 4. Signs through Freighter (user sees the wallet approval popup).
 * 5. Submits the signed XDR to the Soroban RPC.
 * 6. Polls for finality via server.pollTransaction().
 * 7. Returns the transaction hash on success.
 *
 * Throws descriptively on:
 *   - Freighter not connected / user rejects signing
 *   - Simulation / preparation failure
 *   - Submission failure
 *   - On-chain execution failure
 *   - Poll timeout
 */
export async function createEscrow(
  params: CreateEscrowParams
): Promise<CreateEscrowResult> {
  const { landlordAddress, amountXlm } = params;

  /* 1 ── Get student address from Freighter ───────────────────────── */
  const addressResult = await getAddress();
  if (!addressResult.address) {
    throw new Error(
      "Freighter wallet is not connected. Please connect your wallet first."
    );
  }
  const studentPublicKey = addressResult.address;

  /* 2 ── Initialise the v15 RPC server ───────────────────────────── */
  // v15: rpc.Server (not SorobanRpc.Server)
  const server = new rpc.Server(RPC_URL, { allowHttp: false });
  const contract = new Contract(CONTRACT_ID);

  /* 3 ── Load the student account from the network ───────────────── */
  const account = await server.getAccount(studentPublicKey);

  /* 4 ── Build the raw `initialize` invocation ───────────────────── */
  console.log("Student Public Key:", studentPublicKey);
  console.log("Landlord Public Key:", landlordAddress);
  console.log("Amount:", amountXlm);

  const studentScVal  = Address.fromString(studentPublicKey).toScVal();
  const landlordScVal = Address.fromString(landlordAddress).toScVal();
  const amountScVal   = nativeToScVal(xlmToStroops(amountXlm), { type: "i128" });

  const rawTx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call("initialize", studentScVal, landlordScVal, amountScVal)
    )
    .setTimeout(180)
    .build();

  /* 5 ── Simulate + assemble in one call ──────────────────────────── */
  // v15: server.prepareTransaction() simulates AND assembles (sets correct
  // resource fee + auth footprint). Returns a Transaction, not a builder.
  // Replaces the old: simulateTransaction() → assembleTransaction().build()
  let preparedTx: Parameters<typeof server.sendTransaction>[0];
  try {
    preparedTx = await server.prepareTransaction(rawTx);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Transaction simulation failed: ${msg}`);
  }

  /* 6 ── Sign via Freighter (wallet approval popup) ───────────────── */
  const signResult = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  // Freighter v6 returns { signedTxXdr: string } on success or { error: string } on rejection
  if ("error" in signResult && signResult.error) {
    throw new Error(signResult.error as string);
  }

  const signedXdr: string =
    "signedTxXdr" in signResult
      ? (signResult as { signedTxXdr: string }).signedTxXdr
      : (signResult as unknown as string);

  /* 7 ── Parse the signed XDR back into a Transaction ─────────────── */
  // v15: TransactionBuilder.fromXDR() (replaces the xdr.TransactionEnvelope hack)
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  /* 8 ── Submit the signed transaction ────────────────────────────── */
  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    const detail =
      sendResponse.errorResult
        ? JSON.stringify(sendResponse.errorResult)
        : "unknown error";
    throw new Error(`Transaction submission failed: ${detail}`);
  }

  const txHash = sendResponse.hash;

  /* 9 ── Poll for finality ─────────────────────────────────────────── */
  // v15: server.pollTransaction() replaces the manual getTransaction() loop.
  // It accepts the hash (string) and optional { attempts, sleepStrategy }.
  const pollResult = await server.pollTransaction(txHash, {
    attempts: 20,                              // up to ~30 s with default sleep
    sleepStrategy: rpc.LinearSleepStrategy,   // 1 s, 2 s, 3 s … between retries
  });

  if (pollResult.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Transaction was submitted but failed on-chain.");
  }

  if (pollResult.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    throw new Error("Transaction timed out waiting for confirmation.");
  }

  // status === SUCCESS
// status === SUCCESS
let escrowId: number | undefined;

try {
  if (pollResult.returnValue) {
    const nativeVal = scValToNative(pollResult.returnValue);

    console.log("Native Return:", nativeVal);

    if (nativeVal instanceof Map) {
      const idVal =
        nativeVal.get("escrow_id") ??
        nativeVal.get("escrowId");

      if (idVal !== undefined) {
        escrowId = Number(idVal);
      }
    } else if (nativeVal && typeof nativeVal === "object") {
      const idVal =
        (nativeVal as any).escrow_id ??
        (nativeVal as any).escrowId;

      if (idVal !== undefined) {
        escrowId = Number(idVal);
      }
    }
  }
} catch (err) {
  console.error("Failed to decode contract return value:", err);
}

console.log("Native Return:", pollResult.returnValue);
console.log("Escrow ID returned:", escrowId);
console.log("Poll Result:", pollResult);

return {
  txHash,
  escrowId,
  studentWallet: studentPublicKey,
  contractId: CONTRACT_ID,
};
}

export async function releaseEscrow(
  escrowId: number
): Promise<ReleaseEscrowResult> {
  const addressResult = await getAddress();

if (!addressResult.address) {
  throw new Error(
    "Freighter wallet is not connected. Please connect your wallet first."
  );
}

const callerAddress = addressResult.address;

const server = new rpc.Server(RPC_URL, { allowHttp: false });

const contract = new Contract(CONTRACT_ID);

const account = await server.getAccount(callerAddress);
const callerScVal = Address.fromString(callerAddress).toScVal();

const escrowIdScVal = nativeToScVal(
  BigInt(escrowId),
  { type: "u64" }
);

const rawTx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: NETWORK_PASSPHRASE,
})
  .addOperation(
    contract.call(
      "release",
      escrowIdScVal,
      callerScVal
    )
  )
  .setTimeout(180)
  .build();

  let preparedTx: Parameters<typeof server.sendTransaction>[0];

try {
  preparedTx = await server.prepareTransaction(rawTx);
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  throw new Error(`Transaction simulation failed: ${msg}`);
}
const signResult = await signTransaction(preparedTx.toXDR(), {
  networkPassphrase: NETWORK_PASSPHRASE,
});

if ("error" in signResult && signResult.error) {
  throw new Error(signResult.error as string);
}

const signedXdr =
  "signedTxXdr" in signResult
    ? (signResult as { signedTxXdr: string }).signedTxXdr
    : (signResult as unknown as string);

const signedTx = TransactionBuilder.fromXDR(
  signedXdr,
  NETWORK_PASSPHRASE
);
const sendResponse = await server.sendTransaction(signedTx);

if (sendResponse.status === "ERROR") {
  const detail =
    sendResponse.errorResult
      ? JSON.stringify(sendResponse.errorResult)
      : "unknown error";

  throw new Error(`Transaction submission failed: ${detail}`);
}

const txHash = sendResponse.hash;
const pollResult = await server.pollTransaction(txHash, {
  attempts: 20,
  sleepStrategy: rpc.LinearSleepStrategy,
});

if (pollResult.status === rpc.Api.GetTransactionStatus.FAILED) {
  throw new Error("Transaction was submitted but failed on-chain.");
}
if (pollResult.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
  throw new Error("Transaction timed out waiting for confirmation.");
}
if (pollResult.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
  throw new Error("Unexpected transaction status.");
}
return {
  txHash,
};
}

export interface DepositEscrowResult {
  txHash: string;
}

export interface ConfirmEscrowResult {
  txHash: string;
}

export async function depositEscrow(
  escrowId: number
): Promise<DepositEscrowResult> {
  const addressResult = await getAddress();

  if (!addressResult.address) {
    throw new Error(
      "Freighter wallet is not connected. Please connect your wallet first."
    );
  }

  const callerAddress = addressResult.address;

  const server = new rpc.Server(RPC_URL, { allowHttp: false });

  const contract = new Contract(CONTRACT_ID);

  const account = await server.getAccount(callerAddress);

  const callerScVal = Address.fromString(callerAddress).toScVal();

  const escrowIdScVal = nativeToScVal(
    BigInt(escrowId),
    { type: "u64" }
  );

  const rawTx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "deposit",
        escrowIdScVal,
        callerScVal
      )
    )
    .setTimeout(180)
    .build();

  let preparedTx: Parameters<typeof server.sendTransaction>[0];

  try {
    preparedTx = await server.prepareTransaction(rawTx);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Transaction simulation failed: ${msg}`);
  }

  const signResult = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if ("error" in signResult && signResult.error) {
    throw new Error(signResult.error as string);
  }

  const signedXdr =
    "signedTxXdr" in signResult
      ? (signResult as { signedTxXdr: string }).signedTxXdr
      : (signResult as unknown as string);

  const signedTx = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    const detail =
      sendResponse.errorResult
        ? JSON.stringify(sendResponse.errorResult)
        : "unknown error";

    throw new Error(`Transaction submission failed: ${detail}`);
  }

  const txHash = sendResponse.hash;

  const pollResult = await server.pollTransaction(txHash, {
    attempts: 20,
    sleepStrategy: rpc.LinearSleepStrategy,
  });

  if (pollResult.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Transaction was submitted but failed on-chain.");
  }

  if (pollResult.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    throw new Error("Transaction timed out waiting for confirmation.");
  }

  if (pollResult.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error("Unexpected transaction status.");
  }

  return {
    txHash,
  };
}

export async function confirmEscrow(
  escrowId: number
): Promise<ConfirmEscrowResult> {
  const addressResult = await getAddress();

  if (!addressResult.address) {
    throw new Error(
      "Freighter wallet is not connected. Please connect your wallet first."
    );
  }

  const callerAddress = addressResult.address;

  const server = new rpc.Server(RPC_URL, { allowHttp: false });

  const contract = new Contract(CONTRACT_ID);

  const account = await server.getAccount(callerAddress);

  const callerScVal = Address.fromString(callerAddress).toScVal();

  const escrowIdScVal = nativeToScVal(
    BigInt(escrowId),
    { type: "u64" }
  );

  const rawTx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "confirm",
        escrowIdScVal,
        callerScVal
      )
    )
    .setTimeout(180)
    .build();

  let preparedTx: Parameters<typeof server.sendTransaction>[0];

  try {
    preparedTx = await server.prepareTransaction(rawTx);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Transaction simulation failed: ${msg}`);
  }

  const signResult = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if ("error" in signResult && signResult.error) {
    throw new Error(signResult.error as string);
  }

  const signedXdr =
    "signedTxXdr" in signResult
      ? (signResult as { signedTxXdr: string }).signedTxXdr
      : (signResult as unknown as string);

  const signedTx = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    const detail =
      sendResponse.errorResult
        ? JSON.stringify(sendResponse.errorResult)
        : "unknown error";

    throw new Error(`Transaction submission failed: ${detail}`);
  }

  const txHash = sendResponse.hash;

  const pollResult = await server.pollTransaction(txHash, {
    attempts: 20,
    sleepStrategy: rpc.LinearSleepStrategy,
  });

  if (pollResult.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Transaction was submitted but failed on-chain.");
  }

  if (pollResult.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    throw new Error("Transaction timed out waiting for confirmation.");
  }

  if (pollResult.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error("Unexpected transaction status.");
  }

  return {
    txHash,
  };
}
