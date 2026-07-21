import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { STUDENT_NAV_ITEMS as NAV_ITEMS } from '@/components/dashboard/navItems';
import {
  AlertTriangle, Ban, BarChart3, ChevronRight, Clock, Coins, FileDown,
  Home, Hourglass, Inbox, Info, Layers, Lightbulb, Lock, PieChart, Plus,
  Rocket, Search, Trophy, Unlock,
} from 'lucide-react';
import { getEscrowsByStudentDb } from '@/services/escrowService';

const C = {
  orange: '#A78BFA', orangeLight: '#8B5CF6',
  bg: '#0B0A10', white: '#FFFFFF', border: 'rgba(255,255,255,0.08)',
  surface: 'rgba(255,255,255,0.04)',
  textDark: '#FFFFFF', textMid: 'rgba(255,255,255,0.64)', textLight: 'rgba(255,255,255,0.4)',
};
const font = "'Inter', sans-serif";

interface DbEscrow {
  _id: string;
  escrowId?: number;
  propertyName: string;
  propertyAddress?: string;
  landlordWallet: string;
  depositAmount: number;
  currency: string;
  createdAt: string;
  status: 'CREATED' | 'FUNDED' | 'PENDING_CONFIRMATION' | 'RELEASED' | 'DISPUTED' | 'CANCELLED';
  transactionHash?: string;
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`,
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    padding: '24px 26px',
    ...style,
  }}>
    {children}
  </div>
);

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'CREATED':              { bg: 'rgba(151,160,181,0.12)', color: '#97A0B5', border: '1px solid rgba(151,160,181,0.35)' },
  'FUNDED':               { bg: 'rgba(46,107,255,0.12)',  color: '#6E9BFF', border: '1px solid rgba(46,107,255,0.4)' },
  'PENDING_CONFIRMATION': { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)' },
  'RELEASED':             { bg: 'rgba(16,185,129,0.12)',  color: '#10B981', border: '1px solid rgba(16,185,129,0.35)' },
  'DISPUTED':             { bg: 'rgba(239,68,68,0.12)',   color: '#F87171', border: '1px solid rgba(239,68,68,0.35)' },
  'CANCELLED':            { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF', border: '1px solid rgba(107,114,128,0.35)' },
};

const Toast = ({ visible, message }: { visible: boolean; message: string }) => (
  <div role="status" aria-live="polite" style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    background: 'linear-gradient(135deg, #1A1A2E, #2E2E4E)',
    color: '#fff', borderRadius: 14, padding: '14px 22px',
    font, fontWeight: 600, fontSize: '0.88rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'center', gap: 10,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.4s, transform 0.4s',
    pointerEvents: 'none',
  }}>
    <span style={{ display: 'flex', flexShrink: 0 }}><Info size={16} strokeWidth={2} aria-hidden="true" /></span> {message}
  </div>
);

/* ══════════════════════════════════════════════════════════════════ */
/* ── Skeleton rows for loading state ── */
const SkeletonTableRow = () => (
  <tr style={{ borderTop: `1px solid ${C.border}`, animation: 'depositPulse 1.5s infinite ease-in-out' }}>
    {[60, 160, 120, 80, 110, 90, 70, 80].map((w, i) => (
      <td key={i} style={{ padding: '14px 20px' }}>
        <div style={{ height: 15, width: w, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
      </td>
    ))}
  </tr>
);

const SkeletonCard = () => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: 16, animation: 'depositPulse 1.5s infinite ease-in-out',
  }}>
    <div style={{ height: 14, width: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 12 }} />
    <div style={{ height: 16, width: 200, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 8 }} />
    <div style={{ height: 14, width: 140, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
  </div>
);

const MyDeposits: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const displayName = storedUser ? (JSON.parse(storedUser).name || "Student") : "Student";
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  /* Live data state */
  const [escrows, setEscrows] = useState<DbEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Toolbar State */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);

    // Load live escrows from DB
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.walletAddress) {
        getEscrowsByStudentDb(parsed.walletAddress)
          .then((data: any) => {
            const sorted = (data.escrows || []).sort(
              (a: DbEscrow, b: DbEscrow) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setEscrows(sorted);
          })
          .catch((err: any) => {
            setError(err?.response?.data?.message || err.message || 'Failed to load deposits.');
          })
          .finally(() => setLoading(false));
        return;
      }
    }
    setLoading(false);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  const handleExport = () => {
    triggerToast('Exporting transaction history...');
  };

  const handleDownloadReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerToast('Receipt download will be available after blockchain integration.');
  };

  /* Filter & Sort Logic (operates on live DB escrows) */
  const filteredDeposits = escrows.filter(item => {
    const escrowLabel = item.escrowId !== undefined
      ? `ESC-${String(item.escrowId).padStart(3, '0')}`
      : item._id;
    const matchesSearch =
      escrowLabel.toLowerCase().includes(search.toLowerCase()) ||
      item.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      item.landlordWallet.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const sortedDeposits = [...filteredDeposits].sort((a, b) => {
    if (sortBy === 'Newest First')   return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'Oldest First')   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'Highest Deposit') return b.depositAmount - a.depositAmount;
    if (sortBy === 'Lowest Deposit')  return a.depositAmount - b.depositAmount;
    if (sortBy === 'Property Name')   return a.propertyName.localeCompare(b.propertyName);
    return 0;
  });

  const handleReset = () => {
    setSearch('');
    setStatusFilter('All');
    setSortBy('Newest First');
  };

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? undefined : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  /* Aggregate stats (computed from live data) */
  const totalCount  = escrows.length;
  const lockedCount = escrows.filter(d => d.status === 'CREATED' || d.status === 'FUNDED').length;
  const releasedCount  = escrows.filter(d => d.status === 'RELEASED').length;
  const disputedCount  = escrows.filter(d => d.status === 'DISPUTED').length;
  const pendingCount   = escrows.filter(d => d.status === 'PENDING_CONFIRMATION').length;

  const totalFunds   = escrows.reduce((sum, d) => sum + d.depositAmount, 0);
  const lockedFunds  = escrows.filter(d => ['CREATED','FUNDED','PENDING_CONFIRMATION'].includes(d.status)).reduce((sum, d) => sum + d.depositAmount, 0);
  const releasedFunds = escrows.filter(d => d.status === 'RELEASED').reduce((sum, d) => sum + d.depositAmount, 0);
  const avgDeposit   = totalCount > 0 ? Math.round(totalFunds / totalCount) : 0;
  const maxDeposit   = totalCount > 0 ? Math.max(...escrows.map(d => d.depositAmount)) : 0;

  return (
    <>
    <style>{`
      @keyframes depositPulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
    `}</style>
    <DashboardLayout
      role="student"
      userName={displayName}
      navItems={NAV_ITEMS}
      activeId="deposits"
      dark
      onNavChange={(id) => {
        if (id === 'dashboard') navigate('/student/dashboard');
        if (id === 'escrow') navigate('/student/create-escrow');
        if (id === 'deposits') navigate('/student/my-deposits');
        if (id === 'history') navigate('/student/transactions');
        if (id === 'profile') navigate('/student/profile');
        if (id === 'settings') navigate('/student/settings');
      }}
    >
      <Toast visible={toast} message={toastMsg} />

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/student/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Dashboard
        </button>
        <ChevronRight size={13} strokeWidth={2} aria-hidden="true" style={{ color: C.textLight }} />
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>My Deposits</span>
      </div>

      {/* ── Page Header & Stat Cards ── */}
      <div style={{ ...fadeIn(50), marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: C.textDark, letterSpacing: '-0.6px', marginBottom: 6 }}>
            My Deposits
          </h1>
          <p style={{ font, fontWeight: 400, fontSize: '0.9rem', color: C.textMid }}>
            View and track all your rental escrow deposits.
          </p>
        </div>

        {/* Live stats pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Deposits',    value: loading ? '…' : totalCount,    color: C.textMid },
            { label: 'Active Deposits',   value: loading ? '…' : lockedCount,   color: C.orange },
            { label: 'Released',          value: loading ? '…' : releasedCount, color: '#10B981' },
            { label: 'Disputed',          value: loading ? '…' : disputedCount, color: '#F87171' },
          ].map(s => (
            <div key={s.label} style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '10px 16px', minWidth: 120, boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ font, fontSize: '0.68rem', color: C.textLight, fontWeight: 500 }}>{s.label}</div>
              <div style={{ font, fontWeight: 800, fontSize: '1.2rem', color: s.color, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 2-column layout ══ */}
      <div style={{ display: 'grid', gap: 24, alignItems: 'start' }}
        className="grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Search and Filters toolbar */}
          <div style={fadeIn(100)}>
            <Card style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1, minWidth: 260 }}>
                  
                  {/* Search Bar */}
                  <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textLight, display: 'flex' }}>
                      <Search size={14} strokeWidth={2.2} aria-hidden="true" />
                    </span>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by Escrow ID, Property or Landlord"
                      style={{
                        font, fontSize: '0.82rem', padding: '10px 12px 10px 34px',
                        border: `1.5px solid ${C.border}`, borderRadius: 10, width: '100%',
                        outline: 'none', background: 'rgba(255,255,255,0.03)', boxSizing: 'border-box',
                        color: '#fff', caretColor: '#A78BFA',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = C.orange}
                      onBlur={e => e.currentTarget.style.borderColor = C.border}
                    />
                  </div>

                  {/* Filter Dropdown */}
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{
                      font, fontSize: '0.82rem', padding: '10px 14px',
                      border: `1.5px solid ${C.border}`, borderRadius: 10,
                      outline: 'none', background: '#16141F', color: '#fff', cursor: 'pointer',
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="CREATED">Created</option>
                    <option value="FUNDED">Funded</option>
                    <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                    <option value="RELEASED">Released</option>
                    <option value="DISPUTED">Disputed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                      font, fontSize: '0.82rem', padding: '10px 14px',
                      border: `1.5px solid ${C.border}`, borderRadius: 10,
                      outline: 'none', background: '#16141F', color: '#fff', cursor: 'pointer',
                    }}
                  >
                    <option value="Newest First">Newest First</option>
                    <option value="Oldest First">Oldest First</option>
                    <option value="Highest Deposit">Highest Deposit</option>
                    <option value="Lowest Deposit">Lowest Deposit</option>
                    <option value="Property Name">Property Name</option>
                  </select>

                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleReset}
                    style={{
                      font, fontWeight: 600, fontSize: '0.8rem', color: C.textMid,
                      border: `1.5px solid ${C.border}`, background: C.surface,
                      borderRadius: 10, padding: '9px 16px', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.orange}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >
                    Reset
                  </button>

                  <button
                    onClick={handleExport}
                    style={{
                      font, fontWeight: 700, fontSize: '0.8rem', color: C.white,
                      background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                      border: 'none', borderRadius: 10, padding: '10px 18px',
                      cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,92,255,0.25)',
                      transition: 'transform 0.2s',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <FileDown size={13} strokeWidth={2} aria-hidden="true" /> Export History
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Deposits Table / List Card */}
          <div style={fadeIn(140)}>
            <div style={{
              background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden',
            }}>
              
              {/* Desktop Table View */}
              <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                {loading ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                        {['Escrow ID', 'Property', 'Landlord', 'Amount', 'Address', 'Created Date', 'Status', 'Action'].map(h => (
                          <th key={h} style={{ font, fontWeight: 700, fontSize: '0.72rem', color: C.textLight, textAlign: 'left', padding: '12px 20px', letterSpacing: '0.4px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody><SkeletonTableRow /><SkeletonTableRow /><SkeletonTableRow /></tbody>
                  </table>
                ) : error ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#F87171', font, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><AlertTriangle size={15} strokeWidth={2} aria-hidden="true" /> {error}</div>
                ) : sortedDeposits.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                        {['Escrow ID', 'Property', 'Landlord', 'Amount', 'Address', 'Created Date', 'Status', 'Action'].map(h => (
                          <th key={h} style={{
                            font, fontWeight: 700, fontSize: '0.72rem', color: C.textLight, textAlign: 'left',
                            padding: '12px 20px', letterSpacing: '0.4px', whiteSpace: 'nowrap', textTransform: 'uppercase',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDeposits.map((row) => {
                        const targetId = row.escrowId !== undefined ? String(row.escrowId) : row._id;
                        const escrowLabel = row.escrowId !== undefined ? `ESC-${String(row.escrowId).padStart(3,'0')}` : 'Pending';
                        const formattedDate = new Date(row.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
                        const ss = STATUS_STYLE[row.status] || STATUS_STYLE['CREATED'];
                        return (
                          <tr
                            key={row._id}
                            onClick={() => navigate(`/student/escrow/${targetId}`)}
                            style={{
                              borderTop: `1px solid ${C.border}`,
                              background: 'transparent',
                              transition: 'background 0.15s', cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,92,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                              <span style={{ font, fontWeight: 700, fontSize: '0.8rem', color: C.orange }}>{escrowLabel}</span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={14} strokeWidth={2} aria-hidden="true" /></span>
                                <span style={{ font, fontWeight: 600, fontSize: '0.82rem', color: C.textDark }}>{row.propertyName}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                              <span style={{ font, fontSize: '0.82rem', color: C.textMid }}>{row.landlordWallet.slice(0,6)}…{row.landlordWallet.slice(-4)}</span>
                            </td>
                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                              <span style={{ font, fontWeight: 700, fontSize: '0.82rem', color: C.textDark }}>{row.depositAmount} {row.currency}</span>
                            </td>
                            <td style={{ padding: '14px 20px', maxWidth: 180 }}>
                              <span style={{ font, fontSize: '0.78rem', color: C.textMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{row.propertyAddress || '—'}</span>
                            </td>
                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                              <span style={{ font, fontSize: '0.78rem', color: C.textLight }}>{formattedDate}</span>
                            </td>
                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                background: ss.bg, color: ss.color, border: ss.border,
                                font, fontWeight: 700, fontSize: '0.7rem', borderRadius: 50, padding: '4px 10px',
                                display: 'inline-block',
                              }}>{row.status}</span>
                            </td>
                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate(`/student/escrow/${targetId}`); }}
                                  style={{ font, fontWeight: 700, fontSize: '0.75rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  View Details
                                </button>
                                <span style={{ color: C.textLight }}>|</span>
                                <button
                                  onClick={handleDownloadReceipt}
                                  style={{ font, fontWeight: 500, fontSize: '0.75rem', color: C.textLight, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  Receipt
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState navigate={navigate} />
                )}
              </div>

              {/* Mobile Card-Based View */}
              <div className="md:hidden" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading ? (
                  [1,2,3].map(k => <SkeletonCard key={k} />)
                ) : sortedDeposits.length > 0 ? (
                  sortedDeposits.map(row => {
                    const targetId = row.escrowId !== undefined ? String(row.escrowId) : row._id;
                    const escrowLabel = row.escrowId !== undefined ? `ESC-${String(row.escrowId).padStart(3,'0')}` : 'Pending';
                    const ss = STATUS_STYLE[row.status] || STATUS_STYLE['CREATED'];
                    return (
                      <div
                        key={row._id}
                        onClick={() => navigate(`/student/escrow/${targetId}`)}
                        style={{
                          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                          padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                          cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ font, fontWeight: 800, fontSize: '0.82rem', color: C.orange }}>{escrowLabel}</span>
                          <span style={{ background: ss.bg, color: ss.color, border: ss.border, font, fontWeight: 700, fontSize: '0.68rem', borderRadius: 50, padding: '3px 8px' }}>{row.status}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={16} strokeWidth={2} aria-hidden="true" /></span>
                          <div>
                            <div style={{ font, fontWeight: 700, fontSize: '0.85rem', color: C.textDark }}>{row.propertyName}</div>
                            <div style={{ font, fontSize: '0.75rem', color: C.textMid }}>Landlord: {row.landlordWallet.slice(0,6)}…{row.landlordWallet.slice(-4)}</div>
                          </div>
                        </div>

                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Deposit</div>
                            <div style={{ font, fontWeight: 800, fontSize: '0.88rem', color: C.textDark }}>{row.depositAmount} {row.currency}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Created</div>
                            <div style={{ font, fontSize: '0.75rem', color: C.textMid }}>{new Date(row.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/student/escrow/${targetId}`); }}
                            style={{
                              flex: 1, font, fontWeight: 700, fontSize: '0.75rem', color: C.white,
                              background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none',
                              borderRadius: 50, padding: '8px 0', cursor: 'pointer',
                            }}
                          >
                            View Details
                          </button>
                          <button
                            onClick={handleDownloadReceipt}
                            style={{
                              flex: 1, font, fontWeight: 600, fontSize: '0.75rem', color: C.textMid,
                              background: C.surface, border: `1.5px solid ${C.border}`,
                              borderRadius: 50, padding: '8px 0', cursor: 'pointer',
                            }}
                          >
                            Receipt
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState navigate={navigate} />
                )}
              </div>

            </div>
          </div>

          {/* Summary Panel grid */}
          <div style={{
            ...fadeIn(180),
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}>
            {[
              { label: 'Total Escrows', value: loading ? '…' : `${totalCount}`, icon: <Layers size={16} strokeWidth={2} aria-hidden="true" />, color: '#A78BFA' },
              { label: 'Locked/Funded', value: loading ? '…' : `${lockedFunds} XLM`, icon: <Lock size={16} strokeWidth={2} aria-hidden="true" />, color: '#8B5CF6' },
              { label: 'Released Funds', value: loading ? '…' : `${releasedFunds} XLM`, icon: <Unlock size={16} strokeWidth={2} aria-hidden="true" />, color: '#10B981' },
              { label: 'Average Deposit', value: loading ? '…' : `${avgDeposit} XLM`, icon: <BarChart3 size={16} strokeWidth={2} aria-hidden="true" />, color: '#4ACFE8' },
              { label: 'Largest Deposit', value: loading ? '…' : `${maxDeposit} XLM`, icon: <Trophy size={16} strokeWidth={2} aria-hidden="true" />, color: '#F59E0B' },
            ].map(item => (
              <div key={item.label} style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}>
                <span style={{
                  width: 38, height: 38, borderRadius: 10, color: item.color,
                  background: `${item.color}15`, border: `1px solid ${item.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{item.icon}</span>
                <div>
                  <div style={{ font, fontSize: '0.68rem', color: C.textLight, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ font, fontWeight: 800, fontSize: '0.88rem', color: C.textDark, marginTop: 2 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ════════════ RIGHT COLUMN (Sidebar) ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, ...fadeIn(120) }}>

          {/* Deposit Statistics Pie Chart Placeholder */}
          <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChart size={15} strokeWidth={2} aria-hidden="true" style={{ color: '#A78BFA' }} /> Deposit Allocation
              </div>

              {/* Chart Placeholder Graphic */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 140, position: 'relative' }}>
                {/* Simulated Segment Circular rings */}
                <div style={{
                  width: 110, height: 110, borderRadius: '50%',
                  border: '12px solid rgba(255,255,255,0.1)', borderTopColor: C.orange,
                  borderRightColor: '#10B981', borderBottomColor: '#2E6BFF',
                  transform: 'rotate(-45deg)',
                }} />
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ font, fontWeight: 800, fontSize: '1.2rem', color: C.textDark }}>{totalCount}</div>
                  <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Deposits</div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                {[
                  { label: 'Active', color: C.orange, value: lockedCount },
                  { label: 'Released', color: '#10B981', value: releasedCount },
                  { label: 'Pending', color: '#2E6BFF', value: pendingCount },
                  { label: 'Disputed', color: '#F87171', value: disputedCount },
                ].map(leg => (
                  <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: leg.color, flexShrink: 0 }} />
                    <span style={{ font, fontSize: '0.72rem', color: C.textMid }}>
                      {leg.label} ({leg.value})
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Tips */}
            <Card style={{ background: 'rgba(124,92,255,0.03)', border: `1px solid rgba(124,92,255,0.14)` }}>
              <div style={{ font, fontWeight: 800, fontSize: '0.85rem', color: C.textDark, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lightbulb size={14} strokeWidth={2} aria-hidden="true" style={{ color: '#A78BFA' }} /> Quick Tips
              </div>
              <ul style={{ font, fontSize: '0.76rem', color: C.textMid, paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Track and manage every created tenancy escrow easily from one central place.</li>
                <li>Click <strong>View Details</strong> in any row to monitor real-time smart contract progress.</li>
                <li>You can raise disputes directly from the details page if landlord conflicts arise.</li>
              </ul>
            </Card>

            {/* Recent Activity Timeline */}
            <Card>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={15} strokeWidth={2} aria-hidden="true" style={{ color: '#A78BFA' }} /> Activity Timeline
              </div>
              {escrows.length === 0 ? (
                <div style={{ font, fontSize: '0.78rem', color: C.textLight, textAlign: 'center', padding: '20px 0' }}>
                  No activity yet.
                </div>
              ) : (
                escrows.slice(0, 5).map((esc, i, arr) => {
                  const activityIcon = ({
                    CREATED: <Rocket size={12} strokeWidth={2} aria-hidden="true" />,
                    FUNDED: <Coins size={12} strokeWidth={2} aria-hidden="true" />,
                    PENDING_CONFIRMATION: <Hourglass size={12} strokeWidth={2} aria-hidden="true" />,
                    RELEASED: <Unlock size={12} strokeWidth={2} aria-hidden="true" />,
                    DISPUTED: <AlertTriangle size={12} strokeWidth={2} aria-hidden="true" />,
                    CANCELLED: <Ban size={12} strokeWidth={2} aria-hidden="true" />,
                  } as Record<string, React.ReactNode>)[esc.status] || <Layers size={12} strokeWidth={2} aria-hidden="true" />;
                  const activityColor = {
                    CREATED: C.orange,
                    FUNDED: '#F59E0B',
                    PENDING_CONFIRMATION: '#2E6BFF',
                    RELEASED: '#10B981',
                    DISPUTED: '#F87171',
                    CANCELLED: '#6B7280',
                  }[esc.status] || C.textLight;
                  const statusLabel = {
                    CREATED: 'Created',
                    FUNDED: 'Locked',
                    PENDING_CONFIRMATION: 'Awaiting Confirmation',
                    RELEASED: 'Released',
                    DISPUTED: 'Disputed',
                    CANCELLED: 'Cancelled',
                  }[esc.status] || esc.status;
                  const escLabel = esc.escrowId !== undefined ? `ESC-${String(esc.escrowId).padStart(3,'0')}` : 'Escrow';
                  const actDate = new Date(esc.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
                  const actTime = new Date(esc.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={esc._id} style={{ display: 'flex', gap: 10 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', color: activityColor, background: `${activityColor}15`, border: `1px solid ${activityColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {activityIcon}
                        </span>
                        {i < arr.length - 1 && (
                          <div style={{ width: 2, flex: 1, minHeight: 18, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < arr.length - 1 ? 14 : 0 }}>
                        <div style={{ font, fontWeight: 700, fontSize: '0.78rem', color: C.textDark }}>{statusLabel}</div>
                        <div style={{ font, fontSize: '0.7rem', color: C.textLight, marginTop: 2 }}>{esc.propertyName} — {escLabel}</div>
                        <div style={{ font, fontSize: '0.66rem', color: C.textLight, marginTop: 2 }}>{actDate} at {actTime}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
    </>  
  );
};

/* Empty State component */
const EmptyState = ({ navigate }: { navigate: any }) => (
  <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
      <Inbox size={30} strokeWidth={1.8} aria-hidden="true" />
    </div>
    <div style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark }}>No Deposits Found</div>
    <p style={{ font, fontSize: '0.83rem', color: C.textMid, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
      Create your first rental escrow to securely protect your deposit using blockchain smart contracts.
    </p>
    <button
      onClick={() => navigate('/student/create-escrow')}
      style={{
        font, fontWeight: 700, fontSize: '0.82rem', color: C.white,
        background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
        border: 'none', borderRadius: 50, padding: '11px 24px', cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(124,92,255,0.3)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      <Plus size={14} strokeWidth={2.2} aria-hidden="true" /> Create Escrow
    </button>
  </div>
);

export default MyDeposits;
