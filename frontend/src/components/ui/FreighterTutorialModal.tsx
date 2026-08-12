import React from 'react';
import { X, ExternalLink, Download, ShieldCheck, CheckCircle2, ArrowRight, Wallet, Sparkles, HelpCircle } from 'lucide-react';

interface FreighterTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlbedo?: () => void;
  isFreighterInstalled?: boolean;
}

export const FreighterTutorialModal: React.FC<FreighterTutorialModalProps> = ({
  isOpen,
  onClose,
  onSelectAlbedo,
  isFreighterInstalled = false,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5, 5, 12, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'linear-gradient(145deg, #161423 0%, #0B0A11 100%)',
        border: '1px solid rgba(124, 92, 255, 0.25)',
        borderRadius: 24,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124, 92, 255, 0.2)',
        padding: 28,
        color: '#FFF',
        fontFamily: "'Inter', sans-serif",
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.2), rgba(167, 139, 250, 0.1))',
              border: '1px solid rgba(124, 92, 255, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#A78BFA'
            }}>
              <Wallet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                Get Freighter Wallet
                <span style={{
                  fontSize: '0.68rem',
                  background: isFreighterInstalled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: isFreighterInstalled ? '#34D399' : '#F59E0B',
                  border: `1px solid ${isFreighterInstalled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                  padding: '2px 8px', borderRadius: 50, fontWeight: 600
                }}>
                  {isFreighterInstalled ? 'Installed ✓' : 'Not Detected'}
                </span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                Secure non-custodial Stellar wallet extension for browser
              </p>
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

        {/* 3-Step Setup Tutorial */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16, padding: 18, marginBottom: 20
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A78BFA', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={15} /> 3-Step Setup Guide
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C5CFF, #A78BFA)',
                color: '#FFF', fontSize: '0.75rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                1
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#FFF' }}>Install Freighter Browser Extension</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  Available for Chrome, Brave, Firefox, and Edge browsers.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                2
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#FFF' }}>Create or Import Stellar Account</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  Set your wallet password and securely store your 24-word recovery phrase.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                3
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#FFF' }}>Connect to SureDeposit</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  Click "Connect Wallet" on SureDeposit to authorize access.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
              borderRadius: 12, padding: '12px 18px',
              color: '#FFF', fontWeight: 700, fontSize: '0.88rem',
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(124, 92, 255, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Download size={16} />
            Download Freighter Extension
            <ExternalLink size={14} style={{ opacity: 0.8 }} />
          </a>

          {onSelectAlbedo && (
            <button
              onClick={() => {
                onClose();
                onSelectAlbedo();
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12, padding: '11px 18px',
                color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              🌐 Don't want extensions? Use Albedo Web Wallet instead
            </button>
          )}
        </div>

        <div style={{ marginTop: 18, textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ShieldCheck size={13} style={{ color: '#34D399' }} />
          Official Stellar Development Foundation wallet standard.
        </div>
      </div>
    </div>
  );
};
