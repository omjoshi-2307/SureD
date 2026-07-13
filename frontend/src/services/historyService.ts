import API from "../api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TxAction =
  | "ESCROW_CREATED"
  | "DEPOSIT"
  | "STUDENT_CONFIRM"
  | "LANDLORD_CONFIRM"
  | "RELEASE"
  | "REFUND"
  | "DISPUTE_RAISED"
  | "DISPUTE_RESOLVED"
  | "CANCELLED";

export type TxRole = "student" | "landlord" | "admin" | "system";

export interface TxRecord {
  _id: string;
  escrowId?: number;
  mongoEscrowId?: string;
  txHash: string;
  action: TxAction;
  actorWallet: string;
  role?: TxRole;
  propertyName?: string;
  amount?: number;
  currency?: string;
  network: string;
  contractId?: string;
  statusBefore?: string;
  statusAfter?: string;
  createdAt: string;
}

export interface TxHistoryResponse {
  success: boolean;
  history: TxRecord[];
  total: number;
  page: number;
}

export interface TxHistoryParams {
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
  type?: string;
}

// ─── Human-readable action labels ────────────────────────────────────────────

export const ACTION_LABELS: Record<string, string> = {
  ESCROW_CREATED: "Escrow Created",
  DEPOSIT: "Deposit",
  STUDENT_CONFIRM: "Student Confirmation",
  LANDLORD_CONFIRM: "Landlord Confirmation",
  RELEASE: "Deposit Released",
  REFUND: "Refund",
  DISPUTE_RAISED: "Dispute Raised",
  DISPUTE_RESOLVED: "Dispute Resolved",
  CANCELLED: "Cancelled",
};

// ─── Status badge tone mapping ────────────────────────────────────────────────

export type BadgeTone = "info" | "success" | "warning" | "danger" | "neutral";

export const ACTION_TONE: Record<string, BadgeTone> = {
  ESCROW_CREATED: "info",
  DEPOSIT: "warning",
  STUDENT_CONFIRM: "info",
  LANDLORD_CONFIRM: "info",
  RELEASE: "success",
  REFUND: "warning",
  DISPUTE_RAISED: "danger",
  DISPUTE_RESOLVED: "neutral",
  CANCELLED: "neutral",
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Fetch all transaction history records for a given wallet address.
 * Works for both students and landlords — the backend matches actorWallet.
 */
export const getTransactionsByWallet = async (
  wallet: string,
  params: TxHistoryParams = {}
): Promise<TxHistoryResponse> => {
  const { sort = "newest", page = 1, limit = 20, type } = params;
  const query = new URLSearchParams({
    sort,
    page: String(page),
    limit: String(limit),
    ...(type && type !== "All" ? { type } : {}),
  });
  const response = await API.get(`/transactions/wallet/${wallet}?${query}`);
  return response.data;
};
