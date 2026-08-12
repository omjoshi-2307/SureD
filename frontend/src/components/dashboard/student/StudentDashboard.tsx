import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { STUDENT_NAV_ITEMS as NAV_ITEMS } from '@/components/dashboard/navItems';
import {
  ArrowRight, Check, CircleCheckBig, CircleDollarSign, Clock, Download,
  Layers, Lock, MessageCircle, Plus, Shield, ShieldPlus, Wallet, X,
} from 'lucide-react';
import { connectWallet } from "@/services/walletService";
import { updateWallet } from "@/services/authService";
import { getEscrowsByStudentDb } from "@/services/escrowService";
import { WalletConnectBanner } from "@/components/ui/WalletConnectBanner";

/* ── Escrow lifecycle status palette (matches the landing design system) ── */
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  CREATED:              { background: 'rgba(151,160,181,0.12)', color: '#97A0B5', border: '1px solid rgba(151,160,181,0.35)' },
  FUNDED:               { background: 'rgba(46,107,255,0.12)',  color: '#6E9BFF', border: '1px solid rgba(46,107,255,0.4)' },
  PENDING_CONFIRMATION: { background: 'rgba(245,158,11,0.12)',  color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)' },
  RELEASED:             { background: 'rgba(16,185,129,0.12)',  color: '#10B981', border: '1px solid rgba(16,185,129,0.35)' },
  DISPUTED:             { background: 'rgba(239,68,68,0.12)',   color: '#F87171', border: '1px solid rgba(239,68,68,0.35)' },
  CANCELLED:            { background: 'rgba(107,114,128,0.12)', color: '#9CA3AF', border: '1px solid rgba(107,114,128,0.35)' },
};

/* ── Dark violet palette ── */
const C = {
  violet: '#7C5CFF',
  violetSoft: '#A78BFA',
  border: 'rgba(255,255,255,0.08)',
  surface: 'rgba(255,255,255,0.04)',
  textDark: '#FFFFFF',
  textMid: 'rgba(255,255,255,0.64)',
  textLight: 'rgba(255,255,255,0.4)',
  font: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
  display: "'Space Grotesk', sans-serif",
};

const cardBase: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
};

/* ── Quick action button ── */
const QuickBtn = ({ label, icon, primary, onClick }: { label: string; icon: React.ReactNode; primary?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`${primary ? 'btn-glow' : 'btn-glass'} icon-anim`}
    style={{ padding: '11px 20px', fontSize: '0.83rem', fontWeight: 600 }}
  >
    <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span> {label}
  </button>
);

/* ── Skeleton loading row ── */
const SkeletonRow = () => (
  <tr style={{ borderTop: `1px solid ${C.border}`, animation: 'pulse 1.5s infinite ease-in-out' }}>
    {[60, 180, 100, 80, 70, 80].map((w, i) => (
      <td key={i} style={{ padding: '14px 20px' }}>
        <div style={{ height: i === 4 ? 22 : 16, width: w, background: 'rgba(255,255,255,0.08)', borderRadius: i === 4 ? 50 : 4 }} />
      </td>
    ))}
  </tr>
);

const StudentDashboard: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const displayName = storedUser ? (JSON.parse(storedUser).name || "Student") : "Student";
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('dashboard');
  const [walletAddress, setWalletAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadDashboardData = async (wallet: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEscrowsByStudentDb(wallet);
      const sorted = (data.escrows || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEscrows(sorted);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load escrows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.walletAddress) {
        setWalletAddress(parsed.walletAddress);
        loadDashboardData(parsed.walletAddress);
        return;
      }
    }
    setLoading(false);
  }, []);

  const handleNavChange = (id: string) => {
    if (id === 'escrow') {
      navigate('/student/create-escrow');
    } else if (id === 'deposits') {
      navigate('/student/my-deposits');
    } else if (id === 'history') {
      navigate('/student/transactions');
    } else if (id === 'profile') {
      navigate('/student/profile');
    } else if (id === 'settings') {
      navigate('/student/settings');
    } else if (id === 'dashboard') {
      navigate('/student/dashboard');
    } else {
      setActiveId(id);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      setNotice(null);
      const address = await connectWallet();

      // Save wallet to backend
      await updateWallet(address);

      // Update UI
      setWalletAddress(address);

      // Fetch escrows
      await loadDashboardData(address);

      setNotice({ kind: 'success', text: 'Wallet connected and saved successfully.' });
    } catch (error: any) {
      console.error(error);
      setNotice({ kind: 'error', text: error.message || 'Failed to connect wallet.' });
    } finally {
      setConnecting(false);
    }
  };

  // Dynamic stats calculation (same data, ordered by lifecycle: active → pending → completed → value)
  const activeEscrowsCount = escrows.filter(e => ["CREATED", "FUNDED", "PENDING_CONFIRMATION", "DISPUTED"].includes(e.status)).length;
  const completedDepositsCount = escrows.filter(e => e.status === "RELEASED").length;
  const pendingDepositsCount = escrows.filter(e => ["CREATED", "PENDING_CONFIRMATION"].includes(e.status)).length;
  const totalDepositValue = escrows.reduce((sum, e) => sum + (e.depositAmount || 0), 0);

  const dynamicStats = [
    {
      label: 'Active Escrows', value: String(activeEscrowsCount), sub: 'Currently locked or created', color: '#6E9BFF',
      icon: <Lock size={15} strokeWidth={2} aria-hidden="true" />,
    },
    {
      label: 'Pending Deposits', value: String(pendingDepositsCount), sub: 'Awaiting action', color: '#F59E0B',
      icon: <Clock size={15} strokeWidth={2} aria-hidden="true" />,
    },
    {
      label: 'Completed Deposits', value: String(completedDepositsCount), sub: 'Released to landlord', color: '#10B981',
      icon: <CircleCheckBig size={15} strokeWidth={2} aria-hidden="true" />,
    },
    {
      label: 'Total Deposit Value', value: `${totalDepositValue} XLM`, sub: 'Across all properties', color: '#A78BFA',
      icon: <CircleDollarSign size={15} strokeWidth={2} aria-hidden="true" />,
    },
  ];

  return (
    <DashboardLayout
      role="student"
      userName={displayName}
      navItems={NAV_ITEMS}
      activeId={activeId}
      onNavChange={handleNavChange}
      dark
    >
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>

      {/* ── Wallet Connect Asking Bar ── */}
      <WalletConnectBanner onWalletConnected={(addr) => {
        setWalletAddress(addr);
        loadDashboardData(addr);
      }} />

      {/* ── Welcome Banner ── */}
      <div style={{
        ...cardBase,
        borderRadius: 20, padding: '28px 32px', marginBottom: 16,
        borderTop: '1px solid rgba(224,215,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Violet glow atmosphere */}
        <div style={{
          position: 'absolute', right: -60, top: '-80%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.35) 0%, transparent 65%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '30%', bottom: -120,
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.18) 0%, transparent 70%)',
          filter: 'blur(36px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <h1 className="text-hero-gradient" style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
            marginBottom: 6, letterSpacing: '-0.8px',
          }}>
            Welcome back, {displayName}
          </h1>
          <p style={{
            fontFamily: C.font, fontWeight: 400,
            fontSize: '0.9rem', color: C.textMid,
          }}>
            {loading ? "Loading escrows..." : `You have ${pendingDepositsCount} pending deposits and ${activeEscrowsCount} active escrows to manage.`}
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <QuickBtn
              label="Create Escrow"
              primary
              onClick={() => navigate('/student/create-escrow')}
              icon={<Plus size={14} strokeWidth={2.2} aria-hidden="true" />}
            />
            <QuickBtn
              label={connecting ? 'Connecting…' : walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
              onClick={walletAddress ? undefined : handleConnectWallet}
              icon={walletAddress
                ? <Check size={14} strokeWidth={2.2} aria-hidden="true" />
                : <Wallet size={14} strokeWidth={2} aria-hidden="true" />}
            />
          </div>
          {walletAddress && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(124,92,255,0.12)',
              border: '1px solid rgba(124,92,255,0.35)',
              borderRadius: 50,
              padding: '5px 14px',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#10B981',
                boxShadow: '0 0 8px rgba(16,185,129,0.8)', flexShrink: 0,
              }} />
              <span style={{ fontSize: '0.7rem', color: C.textLight, fontFamily: C.font }}>
                Stellar
              </span>
              <span style={{
                fontFamily: C.mono,
                fontWeight: 500,
                fontSize: '0.72rem',
                color: '#E0D7FF',
                letterSpacing: '0.03em',
              }}>
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-6)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Wallet notice (replaces blocking alerts) ── */}
      {notice && (
        <div style={{
          marginBottom: 16,
          padding: '11px 16px',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          background: notice.kind === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: notice.kind === 'success' ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(239,68,68,0.35)',
          fontFamily: C.font, fontSize: '0.82rem', fontWeight: 500,
          color: notice.kind === 'success' ? '#34D399' : '#FCA5A5',
        }}>
          <span>{notice.text}</span>
          <button
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 2, display: 'flex' }}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 16, marginTop: notice ? 0 : 12,
      }}>
        {dynamicStats.map(stat => (
          <div key={stat.label} style={{
            ...cardBase,
            padding: '20px 22px',
            transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
            cursor: 'default',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.18)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.4), 0 0 24px rgba(124,92,255,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'none';
              (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{
                color: stat.color,
                background: `${stat.color}1F`,
                border: `1px solid ${stat.color}40`,
                boxShadow: `0 0 16px ${stat.color}26`,
                borderRadius: 10, width: 42, height: 42,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{stat.icon}</span>
              <span style={{
                fontFamily: C.mono, fontSize: '0.62rem',
                fontWeight: 500, color: '#34D399',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 50,
                padding: '3px 8px',
                letterSpacing: '0.06em',
              }}>LIVE</span>
            </div>
            <div style={{
              fontFamily: C.display, fontWeight: 700,
              fontSize: '1.65rem', color: C.textDark, letterSpacing: '-1px', lineHeight: 1,
            }}>{stat.value}</div>
            <div style={{
              fontFamily: C.font, fontWeight: 500,
              fontSize: '0.8rem', color: C.textMid, marginTop: 6,
            }}>{stat.label}</div>
            <div style={{
              fontFamily: C.font, fontSize: '0.72rem',
              color: C.textLight, marginTop: 4,
            }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{
        ...cardBase,
        padding: '20px 24px', marginBottom: 16,
      }}>
        <h3 style={{
          fontFamily: C.font, fontWeight: 600,
          fontSize: '0.95rem', color: C.textDark, marginBottom: 16,
        }}>Quick actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <QuickBtn
            label="Create New Escrow" primary
            onClick={() => navigate('/student/create-escrow')}
            icon={<ShieldPlus size={14} strokeWidth={2} aria-hidden="true" />}
          />
          <QuickBtn
            label="View All Deposits"
            onClick={() => navigate('/student/my-deposits')}
            icon={<Layers size={14} strokeWidth={2} aria-hidden="true" />}
          />
          <QuickBtn
            label="Download Statement"
            icon={<Download size={14} strokeWidth={2} aria-hidden="true" />}
          />
          <QuickBtn
            label="Contact Support"
            icon={<MessageCircle size={14} strokeWidth={2} aria-hidden="true" />}
          />
        </div>
      </div>

      {/* ── Recent Escrow Table ── */}
      <div style={{
        ...cardBase,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <h3 style={{
            fontFamily: C.font, fontWeight: 600,
            fontSize: '0.95rem', color: C.textDark,
          }}>Recent escrow activity</h3>
          <button onClick={() => navigate('/student/my-deposits')} className="dl-arrow-link" style={{
            fontFamily: C.font, fontWeight: 500,
            fontSize: '0.78rem', color: C.violetSoft, background: 'none',
            border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            View all
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {/* Table — scrollable on small screens */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Escrow ID', 'Property', 'Landlord', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{
                    fontFamily: C.mono, fontWeight: 500,
                    fontSize: '0.64rem', color: C.textLight, textAlign: 'left',
                    padding: '12px 20px', letterSpacing: '0.12em', whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : error ? (
                <tr style={{ borderTop: `1px solid ${C.border}` }}>
                  <td colSpan={6} style={{ padding: '24px 20px', textAlign: 'center', color: '#FCA5A5', fontFamily: C.font, fontWeight: 500, fontSize: '0.85rem' }}>
                    {error}
                  </td>
                </tr>
              ) : escrows.length === 0 ? (
                <tr style={{ borderTop: `1px solid ${C.border}` }}>
                  <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <div style={{
                      width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%',
                      background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.3)',
                      boxShadow: '0 0 24px rgba(124,92,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: C.violetSoft,
                    }}>
                      <Shield size={24} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div style={{ fontFamily: C.font, fontWeight: 600, fontSize: '1rem', color: C.textDark }}>No escrows yet</div>
                    <p style={{ fontFamily: C.font, fontSize: '0.8rem', color: C.textMid, marginTop: 4, marginBottom: 16, lineHeight: 1.6 }}>
                      Create your first rental escrow to securely protect your deposit on the Stellar blockchain.
                    </p>
                    <button
                      onClick={() => navigate('/student/create-escrow')}
                      className="btn-glow"
                      style={{ fontSize: '0.8rem', padding: '9px 22px' }}
                    >
                      Create first escrow
                    </button>
                  </td>
                </tr>
              ) : (
                escrows.slice(0, 5).map((row) => {
                  const targetId = row.escrowId !== undefined ? String(row.escrowId) : row._id;
                  const formattedDate = new Date(row.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
                  return (
                    <tr key={row._id}
                      onClick={() => navigate(`/student/escrow/${targetId}`)}
                      style={{
                        borderTop: `1px solid ${C.border}`,
                        background: 'transparent',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,92,255,0.07)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontFamily: C.mono, fontWeight: 500,
                          fontSize: '0.76rem', color: C.violetSoft,
                        }}>{row.escrowId !== undefined ? `ESC-${String(row.escrowId).padStart(3, '0')}` : 'Pending'}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontFamily: C.font, fontWeight: 500,
                          fontSize: '0.83rem', color: C.textDark,
                        }}>{row.propertyName}</span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontFamily: C.mono, fontSize: '0.74rem', color: C.textMid,
                        }}>{row.landlordWallet.slice(0, 6)}…{row.landlordWallet.slice(-6)}</span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontFamily: C.display, fontWeight: 700,
                          fontSize: '0.85rem', color: C.textDark, letterSpacing: '-0.2px',
                        }}>{row.depositAmount} {row.currency}</span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          ...STATUS_STYLE[row.status],
                          fontFamily: C.mono, fontWeight: 500,
                          fontSize: '0.64rem', borderRadius: 50, padding: '4px 10px',
                          display: 'inline-block', letterSpacing: '0.08em',
                        }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontFamily: C.font, fontSize: '0.78rem', color: C.textLight,
                        }}>{formattedDate}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
