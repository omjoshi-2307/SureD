import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';
import {
  getEscrowDb,
  releaseEscrowDb,
} from "@/services/escrowService";

import { releaseEscrow } from "@/services/sorobanService";

/* ─── Design tokens ─────────────────────────────────────────────── */
const C = {
  orange: '#E8734A', orangeLight: '#F0956B',
  bg: '#F4F6FA', white: '#FFFFFF', border: '#EEEEEE',
  textDark: '#1A1A1A', textMid: '#6B6B6B', textLight: '#AAAAAA',
};
const font = "'Poppins', sans-serif";

/* ─── Nav ───────────────────────────────────────────────────────── */
const Icon = ({ d, size = 17 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',         icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'properties',  label: 'My Properties',     icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'incoming',    label: 'Incoming Deposits',  icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
  { id: 'movein',      label: 'Confirm Move-in',   icon: <Icon d="M9 11l3 3L22 4" /> },
  { id: 'transactions',label: 'Transactions',       icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { id: 'profile',     label: 'Profile',            icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { id: 'settings',    label: 'Settings',           icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
  {
    id: 'logout', label: 'Logout', isLogout: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

/* ─── Status config — identical to student pages ─────────────────── */
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CREATED:              { label: 'Created',              color: '#2B6CB0', bg: 'rgba(74,144,226,0.1)',  border: 'rgba(74,144,226,0.3)' },
  FUNDED:               { label: 'Funded',               color: '#C07A12', bg: 'rgba(240,163,74,0.1)',  border: 'rgba(240,163,74,0.3)' },
  PENDING_CONFIRMATION: { label: 'Pending Confirmation', color: '#8E44AD', bg: 'rgba(155,89,182,0.1)',  border: 'rgba(155,89,182,0.3)' },
  RELEASED:             { label: 'Released',             color: '#2AAF5C', bg: 'rgba(74,207,122,0.1)',  border: 'rgba(74,207,122,0.3)' },
  DISPUTED:             { label: 'Disputed',             color: '#C53030', bg: 'rgba(234,67,53,0.1)',   border: 'rgba(234,67,53,0.3)' },
  CANCELLED:            { label: 'Cancelled',            color: '#4B5563', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
};

/* ─── Action button rules per status ────────────────────────────── */
// Button is enabled only when the escrow is in the matching state
const ACTION_RULES: Record<string, { depositReceived: boolean; confirmMoveIn: boolean; releaseDeposit: boolean; refundDeposit: boolean }> = {
  CREATED:              { depositReceived: true,  confirmMoveIn: false, releaseDeposit: false, refundDeposit: false },
  FUNDED:               { depositReceived: false, confirmMoveIn: true,  releaseDeposit: false, refundDeposit: false },
  PENDING_CONFIRMATION: { depositReceived: false, confirmMoveIn: false, releaseDeposit: true,  refundDeposit: false },
  RELEASED:             { depositReceived: false, confirmMoveIn: false, releaseDeposit: false, refundDeposit: false },
  DISPUTED:             { depositReceived: false, confirmMoveIn: false, releaseDeposit: false, refundDeposit: true  },
  CANCELLED:            { depositReceived: false, confirmMoveIn: false, releaseDeposit: false, refundDeposit: false },
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '24px 26px', ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ label }: { label: string }) => (
  <h3 style={{ font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 18 }}>{label}</h3>
);

const InfoRow = ({ label, value, bold, accent }: { label: string; value: React.ReactNode; bold?: boolean; accent?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, gap: 12 }}>
    <span style={{ font, fontSize: '0.78rem', color: C.textLight, flexShrink: 0 }}>{label}</span>
    <span style={{ font, fontWeight: bold ? 700 : 500, fontSize: '0.82rem', color: accent ? C.orange : C.textDark, textAlign: 'right' }}>{value}</span>
  </div>
);

const MonoBlock = ({ value }: { value: string }) => (
  <div style={{ font, fontWeight: 600, fontSize: '0.77rem', color: C.textMid, background: '#FAFAFA', padding: '7px 11px', borderRadius: 8, border: `1px solid ${C.border}`, overflowX: 'auto', whiteSpace: 'nowrap', fontFamily: 'monospace', marginBottom: 10 }}>
    {value}
  </div>
);

const SkeletonBlock = ({ w = '100%', h = 14, mb = 10 }: { w?: string | number; h?: number; mb?: number }) => (
  <div style={{ height: h, width: w, background: '#F0F0F0', borderRadius: 6, marginBottom: mb, animation: 'ledPulse 1.4s infinite ease-in-out' }} />
);

const Toast = ({ visible, message, type = 'info' }: { visible: boolean; message: string; type?: 'info' | 'warning' | 'error' | 'success' }) => {
  const bg = type === 'error' ? 'linear-gradient(135deg,#2E1A1A,#4E2E2E)'
    : type === 'warning' ? 'linear-gradient(135deg,#2E2210,#4E3A10)'
    : type === 'success' ? 'linear-gradient(135deg,#0E2E1A,#1A4E2E)'
    : 'linear-gradient(135deg,#1A1A2E,#2E2E4E)';
  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, background: bg, color: '#fff', borderRadius: 14, padding: '14px 22px', font, fontWeight: 600, fontSize: '0.88rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.4s, transform 0.4s', pointerEvents: 'none', maxWidth: 400 }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span> {message}
    </div>
  );
};

/* ── Timeline config ─────────────────────────────────────────────── */
const TIMELINE = [
  { key: 'CREATED',              label: 'Escrow Created',       icon: '🚀' },
  { key: 'FUNDED',               label: 'Deposit Funded',       icon: '💰' },
  { key: 'PENDING_CONFIRMATION', label: 'Awaiting Confirmation', icon: '⏳' },
  { key: 'RELEASED',             label: 'Deposit Released',     icon: '🔓' },
];
const STATUS_ORDER = ['CREATED', 'FUNDED', 'PENDING_CONFIRMATION', 'RELEASED'];
const PROGRESS_BY_STATUS: Record<string, number> = {
  CREATED: 20, FUNDED: 45, PENDING_CONFIRMATION: 65, RELEASED: 100, DISPUTED: 30, CANCELLED: 0,
};

/* ════════════════════════════════════════════════════════════════ */
const LandlordEscrowDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

  /* Data */
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* Confirm modal */
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  useEffect(() => {
    if (!id) { setFetchError('No escrow ID provided.'); setLoading(false); return; }
    getEscrowDb(id)
      .then((data: any) => setEscrow(data.escrow || data))
      .catch((err: any) => {
        if (err?.response?.status === 404) setFetchError('Escrow not found.');
        else setFetchError(err?.response?.data?.message || err.message || 'Failed to load escrow.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (msg: string, type: typeof toastType = 'info') => {
    setToastMsg(msg); setToastType(type); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  /* Derived values */
  const statusCfg   = escrow ? (STATUS_CONFIG[escrow.status] || STATUS_CONFIG['CREATED']) : null;
  const rules       = escrow ? (ACTION_RULES[escrow.status] || ACTION_RULES['CANCELLED']) : ACTION_RULES['CANCELLED'];
  const escrowLabel = escrow
    ? (escrow.escrowId !== undefined ? `ESC-${String(escrow.escrowId).padStart(3,'0')}` : 'Pending')
    : '';
  const progressPct = escrow ? (PROGRESS_BY_STATUS[escrow.status] ?? 20) : 0;
  const currentIdx  = escrow ? STATUS_ORDER.indexOf(escrow.status) : -1;
  const stellarUrl  = escrow?.transactionHash
    ? `https://stellar.expert/explorer/testnet/tx/${escrow.transactionHash}`
    : null;

  const fmtDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  /* Action dispatcher (demo mode, no blockchain calls) */
 const handleAction = async (action: string) => {
  setConfirmAction(null);

  try {
    if (action === "releaseDeposit") {
      if (!escrow?.escrowId) {
        throw new Error("Escrow ID not found.");
      }

      // 1. Execute blockchain transaction
      const result = await releaseEscrow(escrow.escrowId);

      // 2. Update MongoDB
      await releaseEscrowDb(escrow.escrowId, {
        txHash: result.txHash,
      });

      // 3. Refresh escrow details
      const refreshed = await getEscrowDb(escrow.escrowId);

      setEscrow(refreshed.escrow || refreshed);

      showToast(
        "Deposit released successfully!",
        "success"
      );

      return;
    }

    const msgs: Record<
      string,
      [string, typeof toastType]
    > = {
      depositReceived: [
        "Deposit marked as received (Demo Mode)",
        "success",
      ],
      confirmMoveIn: [
        "Move-in confirmed (Demo Mode)",
        "success",
      ],
      refundDeposit: [
        "Refund initiated (Demo Mode)",
        "warning",
      ],
    };

    const [msg, type] =
      msgs[action] || [
        "Action recorded (Demo Mode)",
        "info",
      ];

    showToast(msg, type);
  } catch (err: any) {
    showToast(
      err?.message || "Failed to release deposit.",
      "error"
    );
  }
};
  const ActionButton = ({
    label, color, icon, actionKey, enabled,
  }: { label: string; color: string; icon: string; actionKey: string; enabled: boolean }) => (
    <button
      onClick={() => enabled ? setConfirmAction(actionKey) : showToast(`This action is not available for status: ${escrow?.status}`, 'warning')}
      style={{
        width: '100%', font, fontWeight: 700, fontSize: '0.85rem',
        color: enabled ? '#fff' : C.textLight,
        background: enabled ? color : '#F5F5F5',
        border: enabled ? 'none' : `1.5px solid ${C.border}`,
        borderRadius: 50, padding: '12px', cursor: enabled ? 'pointer' : 'not-allowed',
        boxShadow: enabled ? `0 4px 14px ${color}55` : 'none',
        transition: 'all 0.2s', opacity: enabled ? 1 : 0.6,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
      onMouseEnter={e => { if (enabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 22px ${color}77`; } }}
      onMouseLeave={e => { if (enabled) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 14px ${color}55`; } }}
    >
      <span>{icon}</span> {label}
    </button>
  );

  return (
    <DashboardLayout
      role="landlord"
      userName="Landlord"
      navItems={NAV_ITEMS}
      activeId="incoming"
      onNavChange={navId => {
        if (navId === 'dashboard') navigate('/landlord/dashboard');
        if (navId === 'incoming') navigate('/landlord/incoming-escrows');
      }}
    >
      <style>{`@keyframes ledPulse{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}`}</style>
      <Toast visible={toastVisible} message={toastMsg} type={toastType} />

      {/* ── Confirm Action Modal ── */}
      {confirmAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: C.white, borderRadius: 20, padding: 32, maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 12 }}>
              {{ depositReceived: '💰', confirmMoveIn: '✅', releaseDeposit: '🔓', refundDeposit: '↩️' }[confirmAction] || '❓'}
            </div>
            <h2 style={{ font, fontWeight: 800, fontSize: '1.05rem', color: C.textDark, textAlign: 'center', marginBottom: 8 }}>
              {{ depositReceived: 'Mark Deposit as Received', confirmMoveIn: 'Confirm Move-In', releaseDeposit: 'Release Deposit', refundDeposit: 'Refund Deposit' }[confirmAction] || 'Confirm Action'}
            </h2>
            <p style={{ font, fontSize: '0.83rem', color: C.textMid, textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
              {confirmAction === "releaseDeposit"
  ? "This will trigger a blockchain transaction using your Freighter wallet. After the transaction succeeds, the escrow status will be updated."
  : "This action is currently running in Demo Mode."}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmAction(null)} style={{ flex: 1, font, fontWeight: 600, fontSize: '0.85rem', color: C.textDark, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 50, padding: '11px 0', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleAction(confirmAction)} style={{ flex: 1, font, fontWeight: 700, fontSize: '0.85rem', color: '#fff', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '11px 0', cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,115,74,0.3)' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/landlord/dashboard')} style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Dashboard</button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <button onClick={() => navigate('/landlord/incoming-escrows')} style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Incoming Deposits</button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Escrow Details</span>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div style={fadeIn(50)}>
          <div style={{ background: C.white, borderRadius: 20, padding: '28px 32px', marginBottom: 24, border: `1px solid ${C.border}` }}>
            <SkeletonBlock h={28} w="40%" mb={12} />
            <SkeletonBlock h={16} w="25%" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1,2,3].map(k => (
                <div key={k} style={{ background: C.white, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                  <SkeletonBlock h={18} w="50%" mb={16} />
                  {[1,2,3,4].map(j => <SkeletonBlock key={j} h={14} mb={12} />)}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1,2].map(k => (
                <div key={k} style={{ background: C.white, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                  <SkeletonBlock h={18} w="60%" mb={16} />
                  {[1,2,3].map(j => <SkeletonBlock key={j} h={14} mb={12} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && fetchError && (
        <div style={{ ...fadeIn(50), textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>😕</div>
          <h2 style={{ font, fontWeight: 800, fontSize: '1.3rem', color: C.textDark, marginBottom: 8 }}>
            {fetchError === 'Escrow not found.' ? 'Escrow Not Found' : 'Failed to Load'}
          </h2>
          <p style={{ font, fontSize: '0.88rem', color: C.textMid, marginBottom: 24 }}>{fetchError}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/landlord/incoming-escrows')} style={{ font, fontWeight: 700, fontSize: '0.85rem', color: C.white, background: `linear-gradient(135deg,${C.orange},${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '11px 24px', cursor: 'pointer' }}>
              ← Back to Incoming Deposits
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      {!loading && !fetchError && escrow && (
        <>
          {/* Page header */}
          <div style={{ ...fadeIn(50), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div>
              <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: C.textDark, letterSpacing: '-0.6px', marginBottom: 6 }}>
                Escrow Details
              </h1>
              <p style={{ font, fontWeight: 500, fontSize: '0.9rem', color: C.textMid }}>
                Escrow ID: <span style={{ color: C.orange, fontWeight: 700 }}>{escrowLabel}</span>
              </p>
            </div>
            {statusCfg && (
              <div style={{ background: statusCfg.bg, border: `1.5px solid ${statusCfg.border}`, borderRadius: 50, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusCfg.color }} />
                <span style={{ font, fontWeight: 700, fontSize: '0.8rem', color: statusCfg.color }}>{statusCfg.label}</span>
              </div>
            )}
          </div>

          {/* 2-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>

            {/* ════ LEFT COLUMN ════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Property card */}
              <div style={fadeIn(100)}>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 130, background: 'linear-gradient(135deg, rgba(232,115,74,0.12) 0%, rgba(240,149,107,0.06) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                    🏠
                  </div>
                  <div style={{ padding: 24 }}>
                    <SectionTitle label="🏠 Property Information" />
                    <div style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark, marginBottom: 4 }}>{escrow.propertyName}</div>
                    {escrow.propertyAddress && <div style={{ font, fontSize: '0.83rem', color: C.textMid, marginBottom: 16 }}>📍 {escrow.propertyAddress}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                      <InfoRow label="Deposit Amount" value={`${escrow.depositAmount} ${escrow.currency}`} />
                      <InfoRow label="Network" value={escrow.network || 'Stellar Testnet'} />
                      <InfoRow label="Status" value={statusCfg?.label || escrow.status} />
                      <InfoRow label="Created" value={fmtDate(escrow.createdAt)} />
                      {escrow.updatedAt && escrow.updatedAt !== escrow.createdAt && (
                        <InfoRow label="Last Updated" value={fmtDate(escrow.updatedAt)} />
                      )}
                      {escrow.purpose && <InfoRow label="Purpose" value={escrow.purpose} />}
                      {escrow.rentalStartDate && <InfoRow label="Rental Start" value={fmtDate(escrow.rentalStartDate)} />}
                      {escrow.rentalEndDate   && <InfoRow label="Rental End"   value={fmtDate(escrow.rentalEndDate)} />}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Wallet addresses */}
              <div style={{ ...fadeIn(140), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <Card>
                  <SectionTitle label="🎓 Student" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #4A90E2, #50E3C2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font, fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>S</div>
                    <div>
                      <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>Student Tenant</div>
                      <div style={{ font, fontSize: '0.73rem', color: C.textLight }}>Deposit originator</div>
                    </div>
                  </div>
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Wallet Address</div>
                  <MonoBlock value={escrow.studentWallet} />
                </Card>

                <Card>
                  <SectionTitle label="🏢 Landlord (You)" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', font, fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>L</div>
                    <div>
                      <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>Landlord</div>
                      <div style={{ font, fontSize: '0.73rem', color: C.textLight }}>Deposit recipient</div>
                    </div>
                  </div>
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Wallet Address</div>
                  <MonoBlock value={escrow.landlordWallet} />
                </Card>
              </div>

              {/* Blockchain info */}
              <div style={{ ...fadeIn(180), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <Card>
                  <SectionTitle label="📝 Escrow Summary" />
                  <InfoRow label="Escrow ID"   value={<span style={{ color: C.orange, fontWeight: 700 }}>{escrowLabel}</span>} />
                  <InfoRow label="MongoDB ID"   value={`${escrow._id?.slice(0,8)}…`} />
                  <InfoRow label="Deposit"      value={`${escrow.depositAmount} ${escrow.currency}`} bold />
                  <div style={{ height: 1, background: C.border, margin: '10px 0' }} />
                  <InfoRow label="Status"       value={statusCfg?.label || escrow.status} bold />
                  <InfoRow label="Network"      value={escrow.network || 'Stellar Testnet'} />
                  {escrow.contractId && <InfoRow label="Contract ID" value={`${escrow.contractId.slice(0,10)}…`} />}
                  {escrow.rentalStartDate && <InfoRow label="Rental Start" value={fmtDate(escrow.rentalStartDate)} />}
                  {escrow.rentalEndDate   && <InfoRow label="Rental End"   value={fmtDate(escrow.rentalEndDate)} />}
                  {escrow.purpose        && <InfoRow label="Purpose"       value={escrow.purpose} />}
                </Card>

                <Card>
                  <SectionTitle label="🔗 Blockchain Info" />
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Transaction Hash</div>
                  {escrow.transactionHash ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <MonoBlock value={`${escrow.transactionHash.slice(0,14)}…${escrow.transactionHash.slice(-6)}`} />
                      {stellarUrl && (
                        <a href={stellarUrl} target="_blank" rel="noopener noreferrer"
                          style={{ font, fontWeight: 700, fontSize: '0.72rem', color: C.orange, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          View ↗
                        </a>
                      )}
                    </div>
                  ) : (
                    <MonoBlock value="Not yet recorded" />
                  )}
                  <InfoRow label="Network" value={escrow.network || 'Stellar Testnet'} />
                  {escrow.contractId && <InfoRow label="Contract ID" value={`${escrow.contractId.slice(0,12)}…`} />}
                  <InfoRow label="Created"  value={fmtDate(escrow.createdAt)} />
                  {escrow.updatedAt && <InfoRow label="Updated" value={fmtDate(escrow.updatedAt)} />}
                  {stellarUrl && (
                    <a href={stellarUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font, fontWeight: 700, fontSize: '0.8rem', color: '#fff', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, borderRadius: 50, padding: '10px 16px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(232,115,74,0.25)', marginTop: 8 }}>
                      🔍 View on Stellar Expert
                    </a>
                  )}
                </Card>
              </div>
            </div>

            {/* ════ RIGHT COLUMN (sticky sidebar) ════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, ...fadeIn(120) }}>
              <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Progress card */}
                <Card style={{ border: `1.5px solid rgba(232,115,74,0.22)` }}>
                  <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 12 }}>⚙️ Escrow Progress</div>
                  <div style={{ background: '#EEEEEE', borderRadius: 10, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: `linear-gradient(90deg, ${C.orange}, ${C.orangeLight})`, borderRadius: 10, transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', font, fontSize: '0.72rem', color: C.textLight, marginBottom: 14 }}>
                    <span>Created</span>
                    <span style={{ color: C.orange, fontWeight: 700 }}>{progressPct}%</span>
                    <span>Released</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                    <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>Current Status</div>
                    <div style={{ font, fontWeight: 700, fontSize: '0.82rem', color: statusCfg?.color || C.textDark, marginTop: 2 }}>{statusCfg?.label || escrow.status}</div>
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>Deposit Amount</div>
                    <div style={{ font, fontWeight: 600, fontSize: '0.82rem', color: C.orange, marginTop: 2 }}>{escrow.depositAmount} {escrow.currency}</div>
                  </div>
                </Card>

                {/* Timeline card */}
                <Card>
                  <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 18 }}>📅 Escrow Timeline</div>
                  {TIMELINE.map((step, i, arr) => {
                    const stepIdx = STATUS_ORDER.indexOf(step.key);
                    const isCompleted = currentIdx >= stepIdx;
                    const isCurrent   = currentIdx === stepIdx;
                    return (
                      <div key={step.key} style={{ display: 'flex', gap: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: isCompleted ? '#4ACF7A' : isCurrent ? C.orange : '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700, transition: 'background 0.4s' }}>
                            {isCompleted ? '✓' : step.icon}
                          </div>
                          {i < arr.length - 1 && (
                            <div style={{ width: 2, flex: 1, minHeight: 22, background: isCompleted ? '#4ACF7A' : '#E0E0E0', margin: '4px 0', transition: 'background 0.4s' }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                          <div style={{ font, fontWeight: 700, fontSize: '0.78rem', color: isCurrent ? C.orange : isCompleted ? C.textDark : C.textLight }}>{step.label}</div>
                          <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>
                            {isCompleted && step.key === 'CREATED' ? fmtDate(escrow.createdAt)
                              : isCompleted ? 'Completed'
                              : isCurrent  ? 'In Progress'
                              : 'Future Step'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Card>

                {/* ─── ACTION BUTTONS ─── */}
                <Card>
                  <SectionTitle label="⚡ Landlord Actions" />
                  <p style={{ font, fontSize: '0.74rem', color: C.textLight, lineHeight: 1.55, marginBottom: 14 }}>
                    Buttons are enabled based on the current escrow status. All actions run in Demo Mode.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <ActionButton
                      label="Deposit Received"
                      icon="💰"
                      color="linear-gradient(135deg, #4A90E2, #2B6CB0)"
                      actionKey="depositReceived"
                      enabled={rules.depositReceived}
                    />
                    <ActionButton
                      label="Confirm Move-In"
                      icon="✅"
                      color="linear-gradient(135deg, #4ACF7A, #2AAF5C)"
                      actionKey="confirmMoveIn"
                      enabled={rules.confirmMoveIn}
                    />
                    <ActionButton
                      label="Release Deposit"
                      icon="🔓"
                      color={`linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`}
                      actionKey="releaseDeposit"
                      enabled={rules.releaseDeposit}
                    />
                    <ActionButton
                      label="Refund Deposit"
                      icon="↩️"
                      color="linear-gradient(135deg, #ea4335, #f06b6b)"
                      actionKey="refundDeposit"
                      enabled={rules.refundDeposit}
                    />
                  </div>
                  {/* Status note */}
                  {statusCfg && (
                    <div style={{ marginTop: 14, background: `${statusCfg.bg}`, border: `1px solid ${statusCfg.border}`, borderRadius: 10, padding: '8px 12px' }}>
                      <span style={{ font, fontSize: '0.72rem', color: statusCfg.color, fontWeight: 600 }}>
                        Current status: {statusCfg.label}
                      </span>
                    </div>
                  )}
                </Card>

                {/* Back button */}
                <button
                  onClick={() => navigate('/landlord/incoming-escrows')}
                  style={{ width: '100%', font, fontWeight: 600, fontSize: '0.85rem', color: C.textMid, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 50, padding: '11px 0', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.orange}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  ← Back to Incoming Deposits
                </button>

              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default LandlordEscrowDetails;
