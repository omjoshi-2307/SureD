import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';

const C = {
  orange: '#E8734A', orangeLight: '#F0956B',
  bg: '#F4F6FA', white: '#FFFFFF', border: '#EEEEEE',
  textDark: '#1A1A1A', textMid: '#6B6B6B', textLight: '#AAAAAA',
};
const font = "'Poppins', sans-serif";

const Icon = ({ d, size = 17 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',           icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'deposits',    label: 'My Deposits',          icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
  { id: 'escrow',      label: 'Create Escrow',        icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
  { id: 'history',     label: 'Transaction History',  icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { id: 'profile',     label: 'Profile',              icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { id: 'settings',    label: 'Settings',             icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
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

interface EscrowItem {
  id: string;
  property: string;
  landlord: string;
  amount: number;
  currency: string;
  start: string;
  end: string;
  created: string;
  status: 'Locked' | 'Released' | 'Pending Move-in' | 'Disputed';
  emoji: string;
}

const MOCK_DEPOSITS: EscrowItem[] = [
  { id: 'ESC-001', property: 'Green Residency Apartments', landlord: 'Sarah Williams', amount: 500, currency: 'XLM', start: '01 Aug 2026', end: '31 Jul 2027', created: '05 Jul 2026', status: 'Locked', emoji: '🏢' },
  { id: 'ESC-002', property: 'Campus View Residence', landlord: 'Michael Brown', amount: 750, currency: 'XLM', start: '01 Sep 2026', end: '31 Aug 2027', created: '18 Jun 2026', status: 'Released', emoji: '🎓' },
  { id: 'ESC-003', property: 'Skyline Student Housing', landlord: 'Emma Wilson', amount: 450, currency: 'XLM', start: '01 Jan 2027', end: '31 Dec 2027', created: '22 May 2026', status: 'Pending Move-in', emoji: '🏙️' },
  { id: 'ESC-004', property: 'Urban Nest Apartments', landlord: 'David Smith', amount: 650, currency: 'XLM', start: '01 Oct 2026', end: '30 Sep 2027', created: '12 Apr 2026', status: 'Disputed', emoji: '🏗️' },
];

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '24px 26px',
    ...style,
  }}>
    {children}
  </div>
);

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Locked':          { bg: 'rgba(240,163,74,0.12)', color: '#C07A12', border: '1px solid rgba(240,163,74,0.3)' },
  'Released':        { bg: 'rgba(74,207,122,0.12)', color: '#2AAF5C', border: '1px solid rgba(74,207,122,0.3)' },
  'Pending Move-in': { bg: 'rgba(74,144,226,0.12)', color: '#2B6CB0', border: '1px solid rgba(74,144,226,0.3)' },
  'Disputed':        { bg: 'rgba(234,67,53,0.12)',  color: '#C53030', border: '1px solid rgba(234,67,53,0.3)' },
};

const Toast = ({ visible, message }: { visible: boolean; message: string }) => (
  <div style={{
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
    <span style={{ fontSize: '1.1rem' }}>ℹ️</span> {message}
  </div>
);

/* ══════════════════════════════════════════════════════════════════ */
const MyDeposits: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  /* Toolbar State */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  const handleExport = () => {
    triggerToast('Exporting transaction history... (Demo Mode)');
  };

  const handleDownloadReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerToast('Receipt download will be available after blockchain integration.');
  };

  /* Filter & Sort Logic */
  const filteredDeposits = MOCK_DEPOSITS.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.property.toLowerCase().includes(search.toLowerCase()) ||
      item.landlord.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const sortedDeposits = [...filteredDeposits].sort((a, b) => {
    if (sortBy === 'Newest First') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    }
    if (sortBy === 'Oldest First') {
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    }
    if (sortBy === 'Highest Deposit') {
      return b.amount - a.amount;
    }
    if (sortBy === 'Lowest Deposit') {
      return a.amount - b.amount;
    }
    if (sortBy === 'Property Name') {
      return a.property.localeCompare(b.property);
    }
    return 0;
  });

  const handleReset = () => {
    setSearch('');
    setStatusFilter('All');
    setSortBy('Newest First');
  };

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  /* Aggregate stats */
  const totalCount = MOCK_DEPOSITS.length;
  const lockedCount = MOCK_DEPOSITS.filter(d => d.status === 'Locked').length;
  const releasedCount = MOCK_DEPOSITS.filter(d => d.status === 'Released').length;
  const disputedCount = MOCK_DEPOSITS.filter(d => d.status === 'Disputed').length;

  const totalFunds = MOCK_DEPOSITS.reduce((sum, d) => sum + d.amount, 0);
  const lockedFunds = MOCK_DEPOSITS.filter(d => d.status === 'Locked' || d.status === 'Pending Move-in').reduce((sum, d) => sum + d.amount, 0);
  const releasedFunds = MOCK_DEPOSITS.filter(d => d.status === 'Released').reduce((sum, d) => sum + d.amount, 0);
  const avgDeposit = totalCount > 0 ? Math.round(totalFunds / totalCount) : 0;
  const maxDeposit = MOCK_DEPOSITS.length > 0 ? Math.max(...MOCK_DEPOSITS.map(d => d.amount)) : 0;

  return (
    <DashboardLayout
      role="student"
      userName="Alex Johnson"
      navItems={NAV_ITEMS}
      activeId="deposits"
      onNavChange={(id) => {
        if (id === 'dashboard') navigate('/student/dashboard');
        if (id === 'escrow') navigate('/student/create-escrow');
        if (id === 'deposits') navigate('/student/my-deposits');
      }}
    >
      <Toast visible={toast} message={toastMsg} />

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/student/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Dashboard
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
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

        {/* Small stats array on the right */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Deposits', value: totalCount, color: C.textMid },
            { label: 'Locked Deposits', value: lockedCount, color: C.orange },
            { label: 'Released Deposits', value: releasedCount, color: '#4ACF7A' },
            { label: 'Disputed Deposits', value: disputedCount, color: '#ea4335' },
          ].map(s => (
            <div key={s.label} style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '10px 16px', minWidth: 120, boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ font, fontSize: '0.68rem', color: C.textLight, fontWeight: 500 }}>{s.label}</div>
              <div style={{ font, fontWeight: 800, fontSize: '1.2rem', color: s.color, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 2-column layout ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 24, alignItems: 'start' }}
        className="lg:grid-cols-[1fr_300px]">

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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </span>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by Escrow ID, Property or Landlord"
                      style={{
                        font, fontSize: '0.82rem', padding: '10px 12px 10px 34px',
                        border: `1.5px solid ${C.border}`, borderRadius: 10, width: '100%',
                        outline: 'none', background: '#FAFAFA', boxSizing: 'border-box',
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
                      outline: 'none', background: '#FAFAFA', cursor: 'pointer',
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Locked">Locked</option>
                    <option value="Released">Released</option>
                    <option value="Pending Move-in">Pending Move-in</option>
                    <option value="Disputed">Disputed</option>
                  </select>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                      font, fontSize: '0.82rem', padding: '10px 14px',
                      border: `1.5px solid ${C.border}`, borderRadius: 10,
                      outline: 'none', background: '#FAFAFA', cursor: 'pointer',
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
                      border: `1.5px solid ${C.border}`, background: C.white,
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
                      cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,115,74,0.25)',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    📥 Export History
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Deposits Table / List Card */}
          <div style={fadeIn(140)}>
            <div style={{
              background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden',
            }}>
              
              {/* Desktop Table View */}
              <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                {sortedDeposits.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#FAFAFA' }}>
                        {['Escrow ID', 'Property', 'Landlord', 'Deposit Amount', 'Rental Period', 'Created Date', 'Current Status', 'Action'].map(h => (
                          <th key={h} style={{
                            font, fontWeight: 700, fontSize: '0.72rem', color: C.textLight, textAlign: 'left',
                            padding: '12px 20px', letterSpacing: '0.4px', whiteSpace: 'nowrap', textTransform: 'uppercase',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDeposits.map((row, i) => (
                        <tr
                          key={row.id}
                          onClick={() => navigate(`/student/escrow/${row.id}`)}
                          style={{
                            borderTop: `1px solid ${C.border}`,
                            background: i % 2 === 0 ? '#FFFFFF' : '#FDFCFC',
                            transition: 'background 0.15s', cursor: 'pointer',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,115,74,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FDFCFC'}
                        >
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{ font, fontWeight: 700, fontSize: '0.8rem', color: C.orange }}>{row.id}</span>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1.25rem' }}>{row.emoji}</span>
                              <span style={{ font, fontWeight: 600, fontSize: '0.82rem', color: C.textDark }}>{row.property}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{ font, fontSize: '0.82rem', color: C.textMid }}>{row.landlord}</span>
                          </td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{ font, fontWeight: 700, fontSize: '0.82rem', color: C.textDark }}>{row.amount} {row.currency}</span>
                          </td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{ font, fontSize: '0.78rem', color: C.textMid }}>{row.start} - {row.end}</span>
                          </td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{ font, fontSize: '0.78rem', color: C.textLight }}>{row.created}</span>
                          </td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              ...STATUS_STYLE[row.status],
                              font, fontWeight: 700, fontSize: '0.7rem', borderRadius: 50, padding: '4px 10px',
                              display: 'inline-block',
                            }}>{row.status}</span>
                          </td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/student/escrow/${row.id}`); }}
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
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState navigate={navigate} />
                )}
              </div>

              {/* Mobile Card-Based View */}
              <div className="md:hidden" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sortedDeposits.length > 0 ? (
                  sortedDeposits.map(row => (
                    <div
                      key={row.id}
                      onClick={() => navigate(`/student/escrow/${row.id}`)}
                      style={{
                        background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 12,
                        padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                        cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ font, fontWeight: 800, fontSize: '0.82rem', color: C.orange }}>{row.id}</span>
                        <span style={{
                          ...STATUS_STYLE[row.status],
                          font, fontWeight: 700, fontSize: '0.68rem', borderRadius: 50, padding: '3px 8px',
                        }}>{row.status}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.4rem' }}>{row.emoji}</span>
                        <div>
                          <div style={{ font, fontWeight: 700, fontSize: '0.85rem', color: C.textDark }}>{row.property}</div>
                          <div style={{ font, fontSize: '0.75rem', color: C.textMid }}>Landlord: {row.landlord}</div>
                        </div>
                      </div>

                      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Locked Deposit</div>
                          <div style={{ font, fontWeight: 800, fontSize: '0.88rem', color: C.textDark }}>{row.amount} {row.currency}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Lease Term</div>
                          <div style={{ font, fontSize: '0.75rem', color: C.textMid }}>{row.start} - {row.end}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/student/escrow/${row.id}`); }}
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
                            background: C.white, border: `1.5px solid ${C.border}`,
                            borderRadius: 50, padding: '8px 0', cursor: 'pointer',
                          }}
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))
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
              { label: 'Total Escrows', value: `${totalCount} Created`, icon: '📋', color: '#E8734A' },
              { label: 'Locked Funds', value: `${lockedFunds} XLM`, icon: '🔒', color: '#F0956B' },
              { label: 'Released Funds', value: `${releasedFunds} XLM`, icon: '🔓', color: '#4ACF7A' },
              { label: 'Average Deposit', value: `${avgDeposit} XLM`, icon: '📊', color: '#4ACFE8' },
              { label: 'Largest Deposit', value: `${maxDeposit} XLM`, icon: '🏆', color: '#F0A34A' },
            ].map(item => (
              <div key={item.label} style={{
                background: C.white, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}>
                <span style={{
                  fontSize: '1.25rem', width: 38, height: 38, borderRadius: 10,
                  background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 16 }}>
                📊 Deposit Allocation
              </div>

              {/* Chart Placeholder Graphic */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 140, position: 'relative' }}>
                {/* Simulated Segment Circular rings */}
                <div style={{
                  width: 110, height: 110, borderRadius: '50%',
                  border: '12px solid #E0E0E0', borderTopColor: C.orange,
                  borderRightColor: '#4ACF7A', borderBottomColor: '#4A90E2',
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
                  { label: 'Locked', color: C.orange, value: lockedCount },
                  { label: 'Released', color: '#4ACF7A', value: releasedCount },
                  { label: 'Pending', color: '#4A90E2', value: MOCK_DEPOSITS.filter(d => d.status === 'Pending Move-in').length },
                  { label: 'Disputed', color: '#ea4335', value: disputedCount },
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
            <Card style={{ background: 'rgba(232,115,74,0.03)', border: `1px solid rgba(232,115,74,0.14)` }}>
              <div style={{ font, fontWeight: 800, fontSize: '0.85rem', color: C.textDark, marginBottom: 10 }}>
                💡 Quick Tips
              </div>
              <ul style={{ font, fontSize: '0.76rem', color: C.textMid, paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Track and manage every created tenancy escrow easily from one central place.</li>
                <li>Click <strong>View Details</strong> in any row to monitor real-time smart contract progress.</li>
                <li>You can raise disputes directly from the details page if landlord conflicts arise.</li>
              </ul>
            </Card>

            {/* Recent Activity Timeline */}
            <Card>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 18 }}>
                🕒 Activity Timeline
              </div>
              {[
                { title: 'Waiting for Move-in', desc: 'ESC-003 status changed', time: '10:16 AM', date: '01 Jul 2026', icon: '⏳', color: '#4A90E2' },
                { title: 'Deposit Locked', desc: 'ESC-001 funds received', time: '09:44 AM', date: '01 Jul 2026', icon: '🔒', color: C.orange },
                { title: 'Escrow Created', desc: 'New deposit contract for ESC-001', time: '09:40 AM', date: '01 Jul 2026', icon: '🚀', color: C.orange },
                { title: 'Deposit Released', desc: 'ESC-002 unlocked by move-in', time: '04:12 PM', date: '18 Jun 2026', icon: '🔓', color: '#4ACF7A' },
              ].map((act, i, arr) => (
                <div key={act.title} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', width: 24, height: 24, borderRadius: '50%', background: `${act.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {act.icon}
                    </span>
                    {i < arr.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 18, background: '#EEEEEE', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? 14 : 0 }}>
                    <div style={{ font, fontWeight: 700, fontSize: '0.78rem', color: C.textDark }}>{act.title}</div>
                    <div style={{ font, fontSize: '0.7rem', color: C.textLight, marginTop: 2 }}>{act.desc}</div>
                    <div style={{ font, fontSize: '0.66rem', color: C.textLight, marginTop: 2 }}>{act.date} at {act.time}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

/* Empty State component */
const EmptyState = ({ navigate }: { navigate: any }) => (
  <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <div style={{ fontSize: '4.5rem' }}>📭</div>
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
        boxShadow: '0 4px 14px rgba(232,115,74,0.3)',
      }}
    >
      + Create Escrow
    </button>
  </div>
);

export default MyDeposits;
