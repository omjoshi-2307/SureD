import React, { useState, useEffect } from 'react';
import { Wallet, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { getSavedWallet, WalletProvider, connectWallet } from '@/services/walletService';
import { WalletSelectorModal } from './WalletSelectorModal';
import { FreighterTutorialModal } from './FreighterTutorialModal';
import { isConnected as isFreighterConnected } from '@stellar/freighter-api';

interface WalletConnectBannerProps {
  onWalletConnected?: (address: string, provider: WalletProvider) => void;
}

export const WalletConnectBanner: React.FC<WalletConnectBannerProps> = ({ onWalletConnected }) => {
  const [wallet, setWallet] = useState<{ address: string; provider: WalletProvider } | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [freighterInstalled, setFreighterInstalled] = useState(false);

  const syncWalletState = async () => {
    const saved = getSavedWallet();
    setWallet(saved);

    try {
      const res = await isFreighterConnected();
      setFreighterInstalled(!!res?.isConnected);
    } catch {
      setFreighterInstalled(false);
    }
  };

  useEffect(() => {
    syncWalletState();
    window.addEventListener('storage', syncWalletState);
    return () => window.removeEventListener('storage', syncWalletState);
  }, []);

  const handleConnected = (address: string, provider: WalletProvider) => {
    setWallet({ address, provider });
    if (onWalletConnected) {
      onWalletConnected(address, provider);
    }
  };

  const handleAlbedoDirect = async () => {
    try {
      const res = await connectWallet('albedo');
      handleConnected(res.address, res.provider);
    } catch (err: any) {
      console.error(err);
    }
  };

  // If wallet is connected, render a clean compact status bar
  if (wallet && wallet.address) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 14,
        padding: '12px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34D399',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: 8 }}>
              Active Wallet Connected
              <span style={{ fontSize: '0.68rem', background: 'rgba(124, 92, 255, 0.2)', color: '#A78BFA', padding: '1px 8px', borderRadius: 50, textTransform: 'capitalize' }}>
                {wallet.provider}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>
              {wallet.address.slice(0, 10)}...{wallet.address.slice(-10)}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSelector(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            padding: '6px 14px',
            color: '#FFF',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Switch Wallet
        </button>

        <WalletSelectorModal
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
          onConnected={handleConnected}
        />
      </div>
    );
  }

  // If wallet is NOT connected, render prominent asking bar
  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.18) 0%, rgba(233, 97, 245, 0.08) 100%)',
        border: '1px solid rgba(124, 92, 255, 0.35)',
        borderRadius: 16,
        padding: '16px 22px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 8px 30px rgba(124, 92, 255, 0.15)',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 280 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
            color: '#FFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124, 92, 255, 0.4)',
            flexShrink: 0
          }}>
            <Wallet size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFF', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Connect Your Stellar Wallet
              {!freighterInstalled && (
                <span style={{ fontSize: '0.66rem', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '2px 8px', borderRadius: 50 }}>
                  Freighter Not Detected
                </span>
              )}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              Link your Freighter or Web Wallet to create escrows, fund deposits, and approve releases safely.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowTutorial(true)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 10,
              padding: '9px 14px',
              color: '#A78BFA',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <HelpCircle size={14} /> Setup Guide
          </button>

          <button
            onClick={() => setShowSelector(true)}
            style={{
              background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 18px',
              color: '#FFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 92, 255, 0.35)',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Wallet size={15} /> Connect Wallet <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <WalletSelectorModal
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onConnected={handleConnected}
      />

      <FreighterTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onSelectAlbedo={handleAlbedoDirect}
        isFreighterInstalled={freighterInstalled}
      />
    </>
  );
};
