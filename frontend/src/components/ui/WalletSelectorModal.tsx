import React, { useState, useEffect } from 'react';
import { X, Check, Wallet, Globe, ExternalLink, Key, Loader2, AlertCircle } from 'lucide-react';
import { getSupportedWallets, connectWallet, WalletInfo, WalletProvider } from '@/services/walletService';

interface WalletSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string, provider: WalletProvider) => void;
}

export const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({ isOpen, onClose, onConnected }) => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loadingProvider, setLoadingProvider] = useState<WalletProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSupportedWallets().then(setWallets);
      setError(null);
      setShowManualInput(false);
      setManualInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (wallet: WalletInfo) => {
    if (wallet.id === 'manual') {
      setShowManualInput(true);
      return;
    }

    setLoadingProvider(wallet.id);
    setError(null);
    try {
      const res = await connectWallet(wallet.id);
      onConnected(res.address, res.provider);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProvider('manual');
    setError(null);
    try {
      const res = await connectWallet('manual', manualInput.trim());
      onConnected(res.address, res.provider);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid wallet key');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5, 5, 10, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'linear-gradient(145deg, #14131D 0%, #0B0A11 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(124, 92, 255, 0.15)',
        padding: 24,
        color: '#FFF',
        fontFamily: "'Inter', sans-serif",
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(124, 92, 255, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#A78BFA'
            }}>
              <Wallet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Connect Stellar Wallet</h3>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>Select your preferred Stellar provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              width: 32, height: 32, borderRadius: 8, color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: '0.8rem', color: '#F87171',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <AlertCircle size={15} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {!showManualInput ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleSelect(wallet)}
                disabled={loadingProvider !== null}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 12,
                  background: loadingProvider === wallet.id ? 'rgba(124, 92, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#FFF', textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 92, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = loadingProvider === wallet.id ? 'rgba(124, 92, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.4rem' }}>{wallet.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {wallet.name}
                      {wallet.type === 'web' && (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>
                          Web standard
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', marginTop: 2 }}>
                      {wallet.description}
                    </div>
                  </div>
                </div>

                <div>
                  {loadingProvider === wallet.id ? (
                    <Loader2 size={16} className="animate-spin" style={{ color: '#A78BFA' }} />
                  ) : wallet.installed ? (
                    <span style={{ fontSize: '0.7rem', color: '#A78BFA', fontWeight: 600 }}>Connect</span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Not Installed</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>
                Enter Stellar Public Key (G...)
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFF', fontSize: '0.82rem', fontFamily: 'monospace', outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowManualInput(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: '#FFF', fontSize: '0.82rem', cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loadingProvider === 'manual' || !manualInput}
                style={{
                  flex: 2, padding: '10px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)', border: 'none',
                  color: '#FFF', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {loadingProvider === 'manual' ? 'Connecting...' : 'Set Wallet'}
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
          🔒 Non-custodial — SureDeposit never touches your private keys.
        </div>
      </div>
    </div>
  );
};
