import {
  isConnected as isFreighterConnected,
  requestAccess as requestFreighterAccess,
  getAddress as getFreighterAddress,
} from "@stellar/freighter-api";

export type WalletProvider = 'freighter' | 'albedo' | 'xbull' | 'rabet' | 'manual';

export interface WalletInfo {
  id: WalletProvider;
  name: string;
  icon: string;
  installed: boolean;
  type: 'extension' | 'web' | 'manual';
  description: string;
}

const WALLET_KEY = "suredeposit_active_wallet";
const WALLET_ADDR_KEY = "suredeposit_wallet_address";

/**
 * List available and supported Stellar wallets
 */
export const getSupportedWallets = async (): Promise<WalletInfo[]> => {
  let freighterInstalled = false;
  try {
    const res = await isFreighterConnected();
    freighterInstalled = !!res?.isConnected;
  } catch {
    freighterInstalled = false;
  }

  const xbullInstalled = typeof window !== 'undefined' && !!(window as any).xBull;
  const rabetInstalled = typeof window !== 'undefined' && !!(window as any).rabet;

  return [
    {
      id: 'freighter',
      name: 'Freighter Wallet',
      icon: '🚀',
      installed: freighterInstalled,
      type: 'extension',
      description: 'Official browser extension by Stellar Development Foundation',
    },
    {
      id: 'albedo',
      name: 'Albedo (Web Wallet)',
      icon: '🌐',
      installed: true, // Web wallet available everywhere
      type: 'web',
      description: 'No browser extension required — signs via web popup',
    },
    {
      id: 'xbull',
      name: 'xBull Wallet',
      icon: '🐂',
      installed: xbullInstalled,
      type: 'extension',
      description: 'Powerful multi-chain browser wallet for Stellar & Soroban',
    },
    {
      id: 'rabet',
      name: 'Rabet Wallet',
      icon: '🐰',
      installed: rabetInstalled,
      type: 'extension',
      description: 'Simple and secure Stellar browser extension',
    },
    {
      id: 'manual',
      name: 'Enter Public Key',
      icon: '🔑',
      installed: true,
      type: 'manual',
      description: 'Paste any G... Stellar public address directly',
    },
  ];
};

/**
 * Connect to a chosen wallet provider
 */
export const connectWallet = async (provider: WalletProvider = 'freighter', manualAddress?: string): Promise<{ address: string; provider: WalletProvider }> => {
  let address = '';

  if (provider === 'freighter') {
    const installed = await isFreighterConnected();
    if (!installed?.isConnected) {
      throw new Error("Freighter Wallet extension is not installed. Please install it or use Albedo.");
    }
    await requestFreighterAccess();
    const result = await getFreighterAddress();
    if (!result?.address) {
      throw new Error("Failed to retrieve public key from Freighter.");
    }
    address = result.address;
  } else if (provider === 'albedo') {
    // Albedo web wallet integration via popup intent
    address = await new Promise<string>((resolve, reject) => {
      const width = 450;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        'https://albedo.link/api/public_key',
        'albedo_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        reject(new Error("Pop-up window blocked. Please allow pop-ups for Albedo sign-in."));
        return;
      }

      const listener = (event: MessageEvent) => {
        if (event.origin === 'https://albedo.link' && event.data?.pubkey) {
          window.removeEventListener('message', listener);
          if (popup && !popup.closed) popup.close();
          resolve(event.data.pubkey);
        }
      };

      window.addEventListener('message', listener);

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', listener);
          reject(new Error("Albedo sign-in popup was closed before completing."));
        }
      }, 1000);
    });
  } else if (provider === 'xbull') {
    const xBull = (window as any).xBull;
    if (!xBull) {
      throw new Error("xBull Wallet is not installed.");
    }
    address = await xBull.getPublicKey();
  } else if (provider === 'rabet') {
    const rabet = (window as any).rabet;
    if (!rabet) {
      throw new Error("Rabet Wallet is not installed.");
    }
    const result = await rabet.connect();
    address = result.publicKey;
  } else if (provider === 'manual') {
    if (!manualAddress || !manualAddress.startsWith('G') || manualAddress.length !== 56) {
      throw new Error("Invalid Stellar public key. Must start with 'G' and be 56 characters long.");
    }
    address = manualAddress;
  } else {
    throw new Error(`Unsupported wallet provider: ${provider}`);
  }

  // Store selection
  localStorage.setItem(WALLET_KEY, provider);
  localStorage.setItem(WALLET_ADDR_KEY, address);

  return { address, provider };
};

export const getSavedWallet = (): { address: string; provider: WalletProvider } | null => {
  const provider = (localStorage.getItem(WALLET_KEY) as WalletProvider) || 'freighter';
  const address = localStorage.getItem(WALLET_ADDR_KEY) || '';
  if (!address) return null;
  return { address, provider };
};

export const disconnectWallet = (): void => {
  localStorage.removeItem(WALLET_KEY);
  localStorage.removeItem(WALLET_ADDR_KEY);
};