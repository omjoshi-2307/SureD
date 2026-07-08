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
