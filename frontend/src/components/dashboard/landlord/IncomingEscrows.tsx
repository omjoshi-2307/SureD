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
  { id: 'dashboard',    label: 'Dashboard',           icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'properties',   label: 'My Properties',       icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'incoming',     label: 'Incoming Deposits',   icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
  { id: 'movein',       label: 'Confirm Move-in',     icon: <Icon d="M9 11l3 3L22 4" /> },
  { id: 'transactions', label: 'Transactions',        icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { id: 'profile',      label: 'Profile',             icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { id: 'settings',     label: 'Settings',            icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
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

interface EscrowRequest {
  id: string;
  student: string;
  property: string;
  amount: number;
  currency: string;
  start: string;
  end: string;
  created: string;
  status: 'Locked' | 'Released' | 'Pending Move-in' | 'Disputed' | 'Pending';
  emoji: string;
  university: string;
  email: string;
}

const INITIAL_REQUESTS: EscrowRequest[] = [
  { id: 'ESC-001', student: 'Alex Johnson', property: 'Green Residency Apartments', amount: 500, currency: 'XLM', start: '01 Aug 2026', end: '31 Jul 2027', created: '05 Jul 2026', status: 'Locked', emoji: '🏢', university: 'University of Leeds', email: 'alex.j@university.ac.uk' },
  { id: 'ESC-002', student: 'Sophia Davis', property: 'Campus View Residence', amount: 750, currency: 'XLM', start: '01 Sep 2026', end: '31 Aug 2027', created: '18 Jun 2026', status: 'Released', emoji: '🎓', university: 'Leeds Beckett University', email: 's.davis@beckett.ac.uk' },
  { id: 'ESC-003', student: 'Daniel White', property: 'Skyline Student Housing', amount: 650, currency: 'XLM', start: '01 Oct 2026', end: '30 Sep 2027', created: '22 May 2026', status: 'Pending Move-in', emoji: '🏙️', university: 'University of Manchester', email: 'd.white@manchester.ac.uk' },
  { id: 'ESC-004', student: 'Emily Brown', property: 'Urban Nest Apartments', amount: 450, currency: 'XLM', start: '01 Jan 2027', end: '31 Dec 2027', created: '12 Apr 2026', status: 'Disputed', emoji: '🏗️', university: 'Birmingham City University', email: 'e.brown@bcu.ac.uk' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Locked':                  { bg: 'rgba(240,163,74,0.12)', color: '#C07A12', border: '1px solid rgba(240,163,74,0.3)' },
  'Released':                { bg: 'rgba(74,207,122,0.12)', color: '#2AAF5C', border: '1px solid rgba(74,207,122,0.3)' },
  'Pending Move-in':         { bg: 'rgba(74,144,226,0.12)', color: '#2B6CB0', border: '1px solid rgba(74,144,226,0.3)' },
  'Disputed':                { bg: 'rgba(234,67,53,0.12)',  color: '#C53030', border: '1px solid rgba(234,67,53,0.3)' },
  'Pending':                 { bg: 'rgba(163,163,163,0.12)', color: '#4A4A4A', border: '1px solid rgba(163,163,163,0.3)' },
  'Move-in Confirmed':       { bg: 'rgba(74,207,122,0.12)', color: '#2AAF5C', border: '1px solid rgba(74,207,122,0.3)' },
};

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '24px 26px',
    ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ label }: { label: string }) => (
  <h3 style={{ font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 18 }}>
    {label}
  </h3>
);

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
const IncomingEscrows: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  /* Data state */
  const [requests, setRequests] = useState<EscrowRequest[]>(INITIAL_REQUESTS);
  const [selectedReq, setSelectedReq] = useState<EscrowRequest | null>(INITIAL_REQUESTS[0]);

  /* Toolbar State */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');

  /* Modals */
  const [confirmMoveInReq, setConfirmMoveInReq] = useState<EscrowRequest | null>(null);
  const [rejectReq, setRejectReq] = useState<EscrowRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [chatStudent, setChatStudent] = useState<EscrowRequest | null>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  /* Action callbacks */
  const handleConfirmMoveIn = () => {
    if (!confirmMoveInReq) return;
    setRequests(prev => prev.map(item => {
      if (item.id === confirmMoveInReq.id) {
        const updated = { ...item, status: 'Released' as const };
        if (selectedReq?.id === item.id) {
          setSelectedReq(updated);
        }
        return updated;
      }
      return item;
    }));
    setConfirmMoveInReq(null);
    triggerToast('Move-in confirmed successfully (Demo Mode)');
  };

  const handleReject = () => {
    if (!rejectReq) return;
    setRequests(prev => prev.filter(item => item.id !== rejectReq.id));
    if (selectedReq?.id === rejectReq.id) {
      setSelectedReq(null);
    }
    setRejectReq(null);
    setRejectReason('');
    triggerToast('Escrow request rejected (Demo Mode)');
  };

  /* Filter & Sort Logic */
  const filteredRequests = requests.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.student.toLowerCase().includes(search.toLowerCase()) ||
      item.property.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
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
    if (sortBy === 'Student Name') {
      return a.student.localeCompare(b.student);
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

  /* Stats variables */
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Locked' || r.status === 'Pending').length;
  const moveInCount = requests.filter(r => r.status === 'Pending Move-in').length;
  const releasedCount = requests.filter(r => r.status === 'Released').length;

  return (
    <DashboardLayout
      role="landlord"
      userName="James Carter"
      navItems={NAV_ITEMS}
      activeId="incoming"
      onNavChange={(id) => {
        if (id === 'dashboard') navigate('/landlord/dashboard');
      }}
    >
      <Toast visible={toast} message={toastMsg} />

      {/* ── Confirm Move-in Modal ── */}
      {confirmMoveInReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: C.white, borderRadius: 20, width: '100%', maxWidth: 440,
            padding: 32, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', font,
          }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: C.textDark, marginBottom: 12 }}>
              Confirm Student Move-in?
            </h3>
            <p style={{ fontSize: '0.88rem', color: C.textMid, lineHeight: 1.6, marginBottom: 24 }}>
              By confirming the move-in, the escrow will be marked as completed and the deposit will be released to your wallet once blockchain integration is active.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmMoveInReq(null)}
                style={{
                  font, fontWeight: 600, fontSize: '0.82rem', color: C.textMid,
                  border: `1.5px solid ${C.border}`, background: C.white,
                  borderRadius: 50, padding: '10px 22px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMoveIn}
                style={{
                  font, fontWeight: 700, fontSize: '0.82rem', color: C.white,
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                  border: 'none', borderRadius: 50, padding: '10px 22px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(232,115,74,0.25)',
                }}
              >
                Confirm Move-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: C.white, borderRadius: 20, width: '100%', maxWidth: 440,
            padding: 32, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', font,
          }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ea4335', marginBottom: 12 }}>
              Reject Escrow Request?
            </h3>
            <p style={{ fontSize: '0.88rem', color: C.textMid, lineHeight: 1.6, marginBottom: 16 }}>
              Please specify the reason for rejecting student <strong>{rejectReq.student}</strong>'s deposit request.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Property no longer available / Date conflict"
              style={{
                width: '100%', height: 90, borderRadius: 12, border: `1.5px solid ${C.border}`,
                padding: 12, font, fontSize: '0.82rem', outline: 'none', background: '#FAFAFA',
                boxSizing: 'border-box', marginBottom: 20, resize: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#ea4335'}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRejectReq(null)}
                style={{
                  font, fontWeight: 600, fontSize: '0.82rem', color: C.textMid,
                  border: `1.5px solid ${C.border}`, background: C.white,
                  borderRadius: 50, padding: '10px 22px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                style={{
                  font, fontWeight: 700, fontSize: '0.82rem', color: C.white,
                  background: '#ea4335', border: 'none',
                  borderRadius: 50, padding: '10px 22px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234,67,53,0.25)',
                }}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Modal Placeholder ── */}
      {chatStudent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: C.white, borderRadius: 20, width: '100%', maxWidth: 460,
            padding: 24, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', font,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font, fontWeight: 700, color: '#fff', fontSize: '0.9rem',
                }}>{chatStudent.student.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: C.textDark }}>{chatStudent.student}</div>
                  <div style={{ fontSize: '0.7rem', color: C.textLight }}>{chatStudent.university}</div>
                </div>
              </div>
              <button onClick={() => setChatStudent(null)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.textLight }}>×</button>
            </div>

            <div style={{
              height: 180, background: '#FAFAFA', border: `1.5px solid ${C.border}`,
              borderRadius: 12, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '80%', background: C.white, border: `1px solid ${C.border}`, padding: '8px 12px', borderRadius: '12px 12px 12px 0px' }}>
                <div style={{ font, fontSize: '0.78rem', color: C.textDark }}>Hello, I have locked the deposit. Can you please confirm the move-in?</div>
                <div style={{ font, fontSize: '0.62rem', color: C.textLight, textAlign: 'right' }}>09:42 AM</div>
              </div>
              <div style={{ alignSelf: 'center', font, fontSize: '0.7rem', color: C.textLight, margin: '6px 0' }}>Chat simulation mode</div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Type your message to the student…"
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 50, border: `1.5px solid ${C.border}`,
                  font, fontSize: '0.8rem', outline: 'none', background: '#FAFAFA',
                }}
                onFocus={e => e.currentTarget.style.borderColor = C.orange}
                onBlur={e => e.currentTarget.style.borderColor = C.border}
              />
              <button
                onClick={() => { setChatStudent(null); triggerToast('Message sent! (Demo Mode)'); }}
                style={{
                  font, fontWeight: 700, fontSize: '0.8rem', color: C.white,
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none',
                  borderRadius: 50, padding: '10px 18px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(232,115,74,0.25)',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/landlord/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Dashboard
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Incoming Escrow Requests</span>
      </div>

      {/* ── Page Header & Stats Tally ── */}
      <div style={{ ...fadeIn(50), marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: C.textDark, letterSpacing: '-0.6px', marginBottom: 6 }}>
            Incoming Escrow Requests
          </h1>
          <p style={{ font, fontWeight: 400, fontSize: '0.9rem', color: C.textMid }}>
            Review, monitor and manage rental escrow requests submitted by students.
          </p>
        </div>

        {/* Small stats array on the right */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Requests', value: totalCount, color: C.textMid },
            { label: 'Pending Requests', value: pendingCount, color: C.orange },
            { label: 'Confirmed Move-ins', value: requests.filter(r => r.status === 'Pending Move-in').length, color: '#4A90E2' },
            { label: 'Released Deposits', value: releasedCount, color: '#4ACF7A' },
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
                      placeholder="Search by Student, Escrow ID or Property"
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
                    <option value="Pending">Pending</option>
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
                    <option value="Student Name">Student Name</option>
                    <option value="Property Name">Property Name</option>
                  </select>

                </div>

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
                  Reset Filters
                </button>
              </div>
            </Card>
          </div>

          {/* Escrow Request Table */}
          <div style={fadeIn(140)}>
            <div style={{
              background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden',
            }}>
              
              {/* Desktop Table View */}
              <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                {sortedRequests.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#FAFAFA' }}>
                        {['Escrow ID', 'Student', 'Property', 'Deposit Amount', 'Lease Period', 'Request Date', 'Current Status', 'Actions'].map(h => (
                          <th key={h} style={{
                            font, fontWeight: 700, fontSize: '0.72rem', color: C.textLight, textAlign: 'left',
                            padding: '12px 20px', letterSpacing: '0.4px', whiteSpace: 'nowrap', textTransform: 'uppercase',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRequests.map((row, i) => {
                        const isSelected = selectedReq?.id === row.id;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => setSelectedReq(row)}
                            style={{
                              borderTop: `1px solid ${C.border}`,
                              background: isSelected
                                ? 'rgba(232,115,74,0.06)'
                                : i % 2 === 0 ? '#FFFFFF' : '#FDFCFC',
                              transition: 'background 0.15s', cursor: 'pointer',
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(232,115,74,0.04)'; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FDFCFC'; }}
                          >
                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                              <span style={{ font, fontWeight: 700, fontSize: '0.8rem', color: C.orange }}>{row.id}</span>
                            </td>
                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                  width: 26, height: 26, borderRadius: '50%',
                                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  font, fontWeight: 700, fontSize: '0.7rem', color: '#fff',
                                }}>{row.student.charAt(0)}</div>
                                <span style={{ font, fontWeight: 600, fontSize: '0.82rem', color: C.textDark }}>{row.student}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ font, fontWeight: 500, fontSize: '0.82rem', color: C.textDark }}>{row.property}</span>
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
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate(`/landlord/escrow/${row.id}`); }}
                                  style={{ font, fontWeight: 700, fontSize: '0.75rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  View
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmMoveInReq(row); }}
                                  style={{ font, fontWeight: 600, fontSize: '0.75rem', color: '#4ACF7A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  Confirm Move-in
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRejectReq(row); }}
                                  style={{ font, fontWeight: 500, fontSize: '0.75rem', color: '#ea4335', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setChatStudent(row); }}
                                  style={{ font, fontWeight: 500, fontSize: '0.75rem', color: '#4A90E2', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  Message
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState />
                )}
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sortedRequests.length > 0 ? (
                  sortedRequests.map(row => (
                    <div
                      key={row.id}
                      onClick={() => setSelectedReq(row)}
                      style={{
                        background: '#FFFFFF', border: `1px solid ${selectedReq?.id === row.id ? C.orange : C.border}`,
                        borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
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
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          font, fontWeight: 700, fontSize: '0.75rem', color: '#fff',
                        }}>{row.student.charAt(0)}</div>
                        <div>
                          <div style={{ font, fontWeight: 700, fontSize: '0.85rem', color: C.textDark }}>{row.student}</div>
                          <div style={{ font, fontSize: '0.75rem', color: C.textMid }}>{row.university}</div>
                        </div>
                      </div>

                      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Deposit Amount</div>
                          <div style={{ font, fontWeight: 800, fontSize: '0.88rem', color: C.textDark }}>{row.amount} {row.currency}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Created</div>
                          <div style={{ font, fontSize: '0.75rem', color: C.textMid }}>{row.created}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/landlord/escrow/${row.id}`); }}
                          style={{
                            flex: 1, font, fontWeight: 700, fontSize: '0.72rem', color: C.white,
                            background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none',
                            borderRadius: 50, padding: '8px 0', cursor: 'pointer',
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmMoveInReq(row); }}
                          style={{
                            flex: 1, font, fontWeight: 600, fontSize: '0.72rem', color: '#4ACF7A',
                            background: 'rgba(74,207,122,0.1)', border: '1px solid rgba(74,207,122,0.3)',
                            borderRadius: 50, padding: '8px 0', cursor: 'pointer',
                          }}
                        >
                          Move-in
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setRejectReq(row); }}
                          style={{
                            flex: 1, font, fontWeight: 500, fontSize: '0.72rem', color: '#ea4335',
                            background: 'rgba(234,67,53,0.1)', border: '1px solid rgba(234,67,53,0.3)',
                            borderRadius: 50, padding: '8px 0', cursor: 'pointer',
                          }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setChatStudent(row); }}
                          style={{
                            flex: 1, font, fontWeight: 500, fontSize: '0.72rem', color: '#4A90E2',
                            background: 'rgba(74,144,226,0.1)', border: '1px solid rgba(74,144,226,0.3)',
                            borderRadius: 50, padding: '8px 0', cursor: 'pointer',
                          }}
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>

            </div>
          </div>

          {/* Request Details Sidebar Overlay Panel (for Mobile / Desktop Selected Request) */}
          {selectedReq && (
            <div style={fadeIn(180)}>
              <Card style={{ border: `1.5px solid rgba(232,115,74,0.22)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <SectionTitle label="📋 Selected Request Details" />
                  <span style={{
                    ...STATUS_STYLE[selectedReq.status],
                    font, fontWeight: 700, fontSize: '0.75rem', borderRadius: 50, padding: '4px 12px',
                  }}>{selectedReq.status}</span>
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    font, fontWeight: 800, color: '#fff', fontSize: '1.3rem',
                  }}>{selectedReq.student.charAt(0)}</div>
                  <div>
                    <div style={{ font, fontWeight: 800, fontSize: '1.05rem', color: C.textDark }}>{selectedReq.student}</div>
                    <div style={{ font, fontSize: '0.8rem', color: C.textMid }}>🎓 {selectedReq.university}</div>
                    <div style={{ font, fontSize: '0.75rem', color: C.textLight }}>📧 {selectedReq.email}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
                  <div>
                    <div style={{ font, fontSize: '0.72rem', color: C.textLight }}>Property Name</div>
                    <div style={{ font, fontWeight: 600, fontSize: '0.82rem', color: C.textDark, marginTop: 2 }}>{selectedReq.property}</div>
                  </div>
                  <div>
                    <div style={{ font, fontSize: '0.72rem', color: C.textLight }}>Deposit Amount</div>
                    <div style={{ font, fontWeight: 700, fontSize: '0.85rem', color: C.orange, marginTop: 2 }}>{selectedReq.amount} {selectedReq.currency}</div>
                  </div>
                  <div>
                    <div style={{ font, fontSize: '0.72rem', color: C.textLight }}>Lease Duration</div>
                    <div style={{ font, fontWeight: 600, fontSize: '0.82rem', color: C.textDark, marginTop: 2 }}>12 months ({selectedReq.start} - {selectedReq.end})</div>
                  </div>
                  <div>
                    <div style={{ font, fontSize: '0.72rem', color: C.textLight }}>Wallet Connection</div>
                    <div style={{ font, fontWeight: 600, fontSize: '0.82rem', color: C.textLight, marginTop: 2 }}>Not Connected</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                  <button
                    onClick={() => setConfirmMoveInReq(selectedReq)}
                    style={{
                      font, fontWeight: 700, fontSize: '0.8rem', color: C.white,
                      background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none',
                      borderRadius: 50, padding: '10px 20px', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(232,115,74,0.25)',
                    }}
                  >
                    Confirm Move-in
                  </button>
                  <button
                    onClick={() => setRejectReq(selectedReq)}
                    style={{
                      font, fontWeight: 600, fontSize: '0.8rem', color: '#ea4335',
                      background: 'rgba(234,67,53,0.08)', border: '1.5px solid rgba(234,67,53,0.3)',
                      borderRadius: 50, padding: '9px 18px', cursor: 'pointer',
                    }}
                  >
                    Reject Escrow
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Landlord Quick Actions */}
          <div style={fadeIn(220)}>
            <Card>
              <SectionTitle label="⚡ Landlord Quick Actions" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                {[
                  { title: 'Approve Move-in', desc: 'Confirm Student move-in for active escrows', icon: '✅', action: () => triggerToast('Confirm move-in from row or details sidebar') },
                  { title: 'View Property', desc: 'Update properties inventory and rates', icon: '🏠', action: () => triggerToast('View properties module... (Demo Mode)') },
                  { title: 'Transaction History', desc: 'Audit released and disputed deposit entries', icon: '📊', action: () => navigate('/landlord/dashboard') },
                  { title: 'Help & Support', desc: 'Contact Stellar escrow support desk', icon: '💬', action: () => triggerToast('Contacting landlord desk... (Demo Mode)') },
                ].map(card => (
                  <div
                    key={card.title}
                    onClick={card.action}
                    style={{
                      border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '16px',
                      cursor: 'pointer', transition: 'all 0.25s', background: '#FAFAFA',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'none'; }}
                  >
                    <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: 8 }}>{card.icon}</span>
                    <div style={{ font, fontWeight: 700, fontSize: '0.82rem', color: C.textDark, marginBottom: 4 }}>{card.title}</div>
                    <div style={{ font, fontSize: '0.72rem', color: C.textMid, lineHeight: 1.4 }}>{card.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>

        {/* ════════════ RIGHT COLUMN (Sidebar) ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, ...fadeIn(120) }}>

          {/* Today's Tally Summary Card */}
          <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 16 }}>
                ⚙️ Landlord Summary
              </div>

              {[
                { label: "Today's Requests", value: '1 New', desc: 'Submitted by students' },
                { label: 'Pending Move-ins', value: `${moveInCount} Tenancies`, desc: 'Awaiting landlord sign-off' },
                { label: 'Deposits Waiting', value: `${pendingCount} Escrows`, desc: 'Locked on Stellar testnet' },
                { label: 'Total Locked Funds', value: `${requests.filter(r => r.status === 'Locked' || r.status === 'Pending Move-in').reduce((sum, r) => sum + r.amount, 0)} XLM`, desc: 'Active secure contracts' },
              ].map((item, i) => (
                <div key={item.label} style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none', paddingTop: i > 0 ? 12 : 0, paddingBottom: i < 3 ? 12 : 0 }}>
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight }}>{item.label}</div>
                  <div style={{ font, fontWeight: 700, fontSize: '0.85rem', color: C.textDark, marginTop: 2 }}>{item.value}</div>
                  <div style={{ font, fontSize: '0.68rem', color: C.textLight, marginTop: 1 }}>{item.desc}</div>
                </div>
              ))}
            </Card>

            {/* Quick Tips */}
            <Card style={{ background: 'rgba(232,115,74,0.03)', border: `1px solid rgba(232,115,74,0.14)` }}>
              <div style={{ font, fontWeight: 800, fontSize: '0.85rem', color: C.textDark, marginBottom: 10 }}>
                💡 Quick Tips
              </div>
              <ul style={{ font, fontSize: '0.76rem', color: C.textMid, paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Always verify the student tenant's status and credentials before confirming move-in.</li>
                <li>Review the lease period and rental agreements carefully on-chain.</li>
                <li>Use DepositSafe direct messaging to discuss adjustments or resolve concerns.</li>
              </ul>
            </Card>

            {/* Recent Activity Timeline */}
            <Card>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 18 }}>
                🕒 Escrow Timeline
              </div>
              {[
                { title: 'Waiting for Confirmation', desc: 'ESC-003 move-in requested by student', time: '10:16 AM', date: '01 Jul 2026', icon: '⏳', color: '#4A90E2' },
                { title: 'Deposit Locked', desc: 'ESC-001 funds confirmed locked on Stellar', time: '09:44 AM', date: '01 Jul 2026', icon: '🔒', color: C.orange },
                { title: 'Student Created Escrow', desc: 'ESC-001 created on dashboard', time: '09:40 AM', date: '01 Jul 2026', icon: '🚀', color: C.orange },
                { title: 'Released', desc: 'ESC-002 completed and deposit released', time: '04:12 PM', date: '18 Jun 2026', icon: '🔓', color: '#4ACF7A' },
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
const EmptyState = () => (
  <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <div style={{ fontSize: '4.5rem' }}>📭</div>
    <div style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark }}>No Incoming Escrows</div>
    <p style={{ font, fontSize: '0.83rem', color: C.textMid, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
      Student escrow requests will appear here once submitted.
    </p>
  </div>
);

export default IncomingEscrows;
