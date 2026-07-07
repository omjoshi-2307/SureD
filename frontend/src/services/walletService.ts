import {
  isConnected,
  requestAccess,
  getAddress,
} from "@stellar/freighter-api";

export const connectWallet = async (): Promise<string> => {
  try {
    const installed = await isConnected();

    if (!installed.isConnected) {
      throw new Error("Freighter Wallet is not installed.");
    }

    await requestAccess();

    const address = await getAddress();

    return address.address;
  } catch (err) {
    console.error(err);
    throw err;
  }
};