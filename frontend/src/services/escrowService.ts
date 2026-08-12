import API from "../api/axios";

export interface CreateEscrowDbParams {
  escrowId?: number;
  transactionHash: string;
  studentWallet: string;
  landlordWallet: string;
  propertyName: string;
  propertyAddress: string;
  depositAmount: number;
  currency: string;
  rentalStartDate: string | Date;
  rentalEndDate: string | Date;
  purpose: string;
  contractId: string;
  blockchainNetwork: string;
}

export interface FundEscrowDbParams {
  txHash: string;
}
export interface ConfirmEscrowDbParams {
  txHash: string;
}

export interface ReleaseEscrowDbParams {
  txHash: string;
}

export const createEscrowDb = async (data: CreateEscrowDbParams) => {
  const response = await API.post("/escrows", data);
  return response.data;
};

export const getEscrowDb = async (id: string | number) => {
  const response = await API.get(`/escrows/${id}`);
  return response.data;
};

export const getEscrowsByStudentDb = async (wallet: string) => {
  const response = await API.get(`/escrows/student/${wallet}`);
  return response.data;
};

export const getEscrowsByLandlordDb = async (wallet: string) => {
  const response = await API.get(`/escrows/landlord/${wallet}`);
  return response.data;
};

export const fundEscrowDb = async (
  id: string | number,
  data: FundEscrowDbParams
) => {
  const response = await API.patch(
    `/escrows/${id}/fund`,
    data
  );

  return response.data;
};

export const confirmEscrowDb = async (
  id: string | number,
  data: ConfirmEscrowDbParams
) => {
  const response = await API.patch(
    `/escrows/${id}/confirm`,
    data
  );

  return response.data;
};

export const releaseEscrowDb = async (
  id: string | number,
  data: ReleaseEscrowDbParams
) => {
  const response = await API.patch(
    `/escrows/${id}/release`,
    data
  );

  return response.data;
};

export interface RefundEscrowDbParams {
  txHash: string;
}

export const refundEscrowDb = async (
  id: string | number,
  data: RefundEscrowDbParams
) => {
  const response = await API.patch(
    `/escrows/${id}/refund`,
    data
  );

  return response.data;
};

export interface CancelEscrowDbParams {
  reason?: string;
}

export const cancelEscrowDb = async (
  id: string | number,
  data: CancelEscrowDbParams
) => {
  const response = await API.patch(
    `/escrows/${id}/cancel`,
    data
  );

  return response.data;
};
