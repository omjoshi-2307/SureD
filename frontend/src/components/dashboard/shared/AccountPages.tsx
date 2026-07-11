import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { connectWallet } from '@/services/walletService';
import { fetchUserProfile, syncWallet, updateUserProfile, type ActivityItem, type ProfileStats, type ProfileUpdatePayload, type UserProfile, type WalletUpdatePayload } from '@/services/authService';

type PageRole = 'student' | 'landlord';

type Props = {
  role: PageRole;
};

const C = {
  orange: '#E8734A',
  orangeLight: '#F0956B',
  bg: '#F4F6FA',
  white: '#FFFFFF',
  border: '#EEEEEE',
  textDark: '#1A1A1A',
  textMid: '#6B6B6B',
  textLight: '#AAAAAA',
};

const font = "'Poppins', sans-serif";

const Icon = ({ d, size = 17 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const buildNavItems = (role: PageRole): NavItem[] => {
  if (role === 'student') {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
      { id: 'deposits', label: 'My Deposits', icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
      { id: 'escrow', label: 'Create Escrow', icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
      { id: 'history', label: 'Transaction History', icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
      { id: 'profile', label: 'Profile', icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
      { id: 'settings', label: 'Settings', icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
      { id: 'logout', label: 'Logout', icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ), isLogout: true },
    ].map((item) => ({ ...item }));
  }

  return [
    { id: 'dashboard', label: 'Dashboard', icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
    { id: 'properties', label: 'My Properties', icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
    { id: 'incoming', label: 'Incoming Deposits', icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
    { id: 'movein', label: 'Confirm Move-in', icon: <Icon d="M9 11l3 3L22 4" /> },
    { id: 'transactions', label: 'Transactions', icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
    { id: 'profile', label: 'Profile', icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
    { id: 'settings', label: 'Settings', icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
    { id: 'logout', label: 'Logout', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ), isLogout: true },
  ].map((item) => ({ ...item }));
};

const fadeIn = (delay = 0): React.CSSProperties => ({
  animation: `fadeInUp 0.5s ease ${delay}ms both`,
});

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: '0 10px 30px rgba(17,24,39,0.04)', padding: 24, ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ label }: { label: string }) => (
  <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 16 }}>{label}</h3>
);

const StatusBadge = ({ label, tone }: { label: string; tone: 'info' | 'success' | 'warning' | 'danger' | 'neutral' }) => {
  const map = {
    info: { bg: 'rgba(74,144,226,0.1)', color: '#2B6CB0' },
    success: { bg: 'rgba(74,207,122,0.1)', color: '#2AAF5C' },
    warning: { bg: 'rgba(240,163,74,0.1)', color: '#C07A12' },
    danger: { bg: 'rgba(234,67,53,0.1)', color: '#C53030' },
    neutral: { bg: 'rgba(107,114,128,0.1)', color: '#4B5563' },
  }[tone];

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: map.bg, color: map.color, fontFamily: font, fontWeight: 700, fontSize: '0.72rem' }}>
      {label}
    </span>
  );
};

const Toast = ({ visible, message, type = 'info' }: { visible: boolean; message: string; type?: 'info' | 'warning' | 'error' | 'success' }) => {
  const bg = type === 'error' ? 'linear-gradient(135deg,#2E1A1A,#4E2E2E)' : type === 'warning' ? 'linear-gradient(135deg,#2E2210,#4E3A10)' : type === 'success' ? 'linear-gradient(135deg,#1D3C2A,#2C5A3B)' : 'linear-gradient(135deg,#1A1A2E,#2E2E4E)';
  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 9999, background: bg, color: '#fff', padding: '14px 18px', borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.18)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.25s ease', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 10, fontFamily: font, fontWeight: 600 }}>
      <span>{icon}</span>
      {message}
    </div>
  );
};

const sampleTransactions = [
  { id: 'TX-1024', escrowId: 'ESC-014', property: 'Harbor Avenue', type: 'Escrow Created', status: 'Created', amount: '$1,200', wallet: 'G...4A1C', date: '2026-07-03', network: 'Testnet', hash: '0x7c98...f4a1' },
  { id: 'TX-1023', escrowId: 'ESC-013', property: 'Cedar Point', type: 'Deposit', status: 'Funded', amount: '$950', wallet: 'G...2D9E', date: '2026-07-01', network: 'Testnet', hash: '0x9b15...a881' },
  { id: 'TX-1022', escrowId: 'ESC-012', property: 'Maple House', type: 'Release', status: 'Released', amount: '$1,780', wallet: 'G...8F3B', date: '2026-06-28', network: 'Testnet', hash: '0x3e10...c1d2' },
  { id: 'TX-1021', escrowId: 'ESC-011', property: 'River View', type: 'Dispute', status: 'Disputed', amount: '$600', wallet: 'G...6B11', date: '2026-06-24', network: 'Testnet', hash: '0x4a7d...8f47' },
];

export const TransactionHistoryPage: React.FC<Props> = ({ role }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return sampleTransactions.filter((tx) => {
      const matchesSearch = [tx.id, tx.escrowId, tx.property, tx.hash, tx.wallet].some((value) => value.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
      const matchesType = typeFilter === 'All' || tx.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / 3));
  const visible = filtered.slice((currentPage - 1) * 3, currentPage * 3);

  return (
    <DashboardLayout role={role} userName={role === 'student' ? 'Alex Johnson' : 'Mina Park'} navItems={buildNavItems(role)} activeId={role === 'student' ? 'history' : 'transactions'} onNavChange={(id) => {
      if (id === 'dashboard') navigate(role === 'student' ? '/student/dashboard' : '/landlord/dashboard');
      if (id === 'deposits') navigate('/student/my-deposits');
      if (id === 'escrow') navigate('/student/create-escrow');
      if (id === 'history' || id === 'transactions') navigate(role === 'student' ? '/student/transactions' : '/landlord/transactions');
      if (id === 'profile') navigate(role === 'student' ? '/student/profile' : '/landlord/profile');
      if (id === 'settings') navigate(role === 'student' ? '/student/settings' : '/landlord/settings');
    }}>
      <div style={{ padding: '24px 24px 40px', background: C.bg, minHeight: '100vh' }}>
        <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ ...fadeIn(), display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: font, fontWeight: 800, fontSize: '1.45rem', color: C.textDark, margin: 0 }}>Transaction History</h1>
              <p style={{ fontFamily: font, fontSize: '0.92rem', color: C.textMid, margin: '6px 0 0' }}>View all blockchain and escrow transactions in one place.</p>
            </div>
            <button style={{ border: 'none', borderRadius: 999, padding: '10px 16px', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: '#fff', fontFamily: font, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(232,115,74,0.25)' }}>Export CSV</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { label: 'Total Transactions', value: '128', tone: 'info' },
              { label: 'Successful', value: '112', tone: 'success' },
              { label: 'Pending', value: '8', tone: 'warning' },
              { label: 'Released', value: '76', tone: 'success' },
              { label: 'Disputed', value: '4', tone: 'danger' },
              { label: 'TVL', value: '$84.2K', tone: 'info' },
            ].map((stat) => (
              <Card key={stat.label} style={{ padding: 18 }}>
                <div style={{ fontFamily: font, fontSize: '0.78rem', color: C.textLight, marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontFamily: font, fontWeight: 800, fontSize: '1.15rem', color: C.textDark }}>{stat.value}</div>
              </Card>
            ))}
          </div>

          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <SectionTitle label="Search & Filters" />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search by escrow, property, hash or wallet" style={{ minWidth: 240, borderRadius: 999, border: `1px solid ${C.border}`, padding: '10px 14px', fontFamily: font, color: C.textDark }} />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ borderRadius: 999, border: `1px solid ${C.border}`, padding: '10px 14px', fontFamily: font, color: C.textDark }}>
                  <option value="All">All Status</option>
                  <option value="Created">Created</option>
                  <option value="Funded">Funded</option>
                  <option value="Released">Released</option>
                  <option value="Disputed">Disputed</option>
                </select>
                <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} style={{ borderRadius: 999, border: `1px solid ${C.border}`, padding: '10px 14px', fontFamily: font, color: C.textDark }}>
                  <option value="All">All Types</option>
                  <option value="Escrow Created">Escrow Created</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Release">Release</option>
                  <option value="Dispute">Dispute</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.textLight, fontSize: '0.75rem', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px' }}>Transaction ID</th>
                    <th style={{ padding: '10px 8px' }}>Escrow ID</th>
                    <th style={{ padding: '10px 8px' }}>Property</th>
                    <th style={{ padding: '10px 8px' }}>Type</th>
                    <th style={{ padding: '10px 8px' }}>Status</th>
                    <th style={{ padding: '10px 8px' }}>Amount</th>
                    <th style={{ padding: '10px 8px' }}>Wallet</th>
                    <th style={{ padding: '10px 8px' }}>Date</th>
                    <th style={{ padding: '10px 8px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: C.textDark }}>{tx.id}</td>
                      <td style={{ padding: '12px 8px', color: C.textMid }}>{tx.escrowId}</td>
                      <td style={{ padding: '12px 8px', color: C.textMid }}>{tx.property}</td>
                      <td style={{ padding: '12px 8px', color: C.textMid }}>{tx.type}</td>
                      <td style={{ padding: '12px 8px' }}><StatusBadge label={tx.status} tone={tx.status === 'Released' ? 'success' : tx.status === 'Disputed' ? 'danger' : tx.status === 'Funded' ? 'warning' : 'info'} /></td>
                      <td style={{ padding: '12px 8px', color: C.textDark, fontWeight: 700 }}>{tx.amount}</td>
                      <td style={{ padding: '12px 8px', color: C.textMid }}>{tx.wallet}</td>
                      <td style={{ padding: '12px 8px', color: C.textMid }}>{tx.date}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button style={{ border: `1px solid ${C.border}`, borderRadius: 999, padding: '6px 10px', background: '#fff', color: C.textDark, cursor: 'pointer', fontSize: '0.72rem' }}>View</button>
                          <button style={{ border: `1px solid ${C.border}`, borderRadius: 999, padding: '6px 10px', background: '#fff', color: C.orange, cursor: 'pointer', fontSize: '0.72rem' }}>Stellar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ color: C.textLight, fontSize: '0.82rem' }}>Showing {visible.length} of {filtered.length} transactions</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)} style={{ border: `1px solid ${C.border}`, borderRadius: 999, padding: '8px 12px', background: currentPage === p ? `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})` : '#fff', color: currentPage === p ? '#fff' : C.textDark, cursor: 'pointer', fontWeight: 700 }}>{p}</button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const formatDate = (value?: string) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const ProfilePage: React.FC<Props> = ({ role }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    fullName: '',
    username: '',
    bio: '',
    phone: '',
    location: '',
    profilePicture: '',
  });

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2200);
  };

  const loadProfile = async () => {
    setError('');
    try {
      const data = await fetchUserProfile();
      setProfile(data.user);
      setStats(data.stats);
      setActivity(data.activity);
      setFormState({
        fullName: data.user.name || '',
        username: data.user.username || '',
        bio: data.user.bio || '',
        phone: data.user.phone || '',
        location: data.user.location || '',
        profilePicture: data.user.profilePicture || '',
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfile();
        if (!mounted) return;
        setProfile(data.user);
        setStats(data.stats);
        setActivity(data.activity);
        setFormState({
          fullName: data.user.name || '',
          username: data.user.username || '',
          bio: data.user.bio || '',
          phone: data.user.phone || '',
          location: data.user.location || '',
          profilePicture: data.user.profilePicture || '',
        });
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void run();
    const interval = window.setInterval(() => {
      void run();
    }, 15000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [authUser?.id]);

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.fullName.trim()) {
      showToast('Full name is required', 'warning');
      return;
    }
    if (formState.username.trim() && formState.username.trim().length < 3) {
      showToast('Username must be at least 3 characters', 'warning');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload: ProfileUpdatePayload = {
        name: formState.fullName.trim(),
        username: formState.username.trim() || undefined,
        bio: formState.bio.trim() || '',
        phone: formState.phone.trim() || '',
        location: formState.location.trim() || '',
        profilePicture: formState.profilePicture.trim() || '',
      };
      const response = await updateUserProfile(payload);
      if ('success' in response && response.success) {
        setProfile(response.user as UserProfile);
        showToast('Profile updated successfully', 'success');
      } else {
        showToast('Unable to save profile', 'error');
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectWallet = async () => {
    setWalletLoading(true);
    setError('');
    try {
      const address = await connectWallet();
      const payload: WalletUpdatePayload = {
        walletAddress: address,
        isWalletConnected: true,
        walletType: 'Freighter',
        network: 'Testnet',
        walletVerified: true,
      };
      const response = await syncWallet(payload);
      setProfile(response.user as UserProfile);
      showToast('Wallet connected successfully', 'success');
      await loadProfile();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    setWalletLoading(true);
    setError('');
    try {
      const response = await syncWallet({ walletAddress: '', isWalletConnected: false, walletType: '', network: 'Testnet', walletVerified: false });
      setProfile(response.user as UserProfile);
      showToast('Wallet disconnected', 'success');
      await loadProfile();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!profile?.walletAddress) return;
    try {
      await navigator.clipboard.writeText(profile.walletAddress);
      showToast('Address copied', 'success');
    } catch {
      showToast('Unable to copy address', 'error');
    }
  };

  const displayName = profile?.name || authUser?.name || 'User';
  const initials = (displayName || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const profileCompletion = useMemo(() => {
    const fields = [
      Boolean(profile?.name),
      Boolean(profile?.email),
      Boolean(profile?.username),
      Boolean(profile?.phone),
      Boolean(profile?.location),
      Boolean(profile?.bio),
      Boolean(profile?.walletAddress),
      Boolean(profile?.profilePicture),
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  const walletStatus = profile?.isWalletConnected ? 'Connected' : 'Not Connected';
  const walletLabel = profile?.walletAddress ? `${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}` : 'Not connected';

  return (
    <DashboardLayout role={role} userName={displayName} navItems={buildNavItems(role)} activeId="profile" onNavChange={(id) => {
      if (id === 'dashboard') navigate(role === 'student' ? '/student/dashboard' : '/landlord/dashboard');
      if (id === 'deposits') navigate('/student/my-deposits');
      if (id === 'escrow') navigate('/student/create-escrow');
      if (id === 'history' || id === 'transactions') navigate(role === 'student' ? '/student/transactions' : '/landlord/transactions');
      if (id === 'profile') navigate(role === 'student' ? '/student/profile' : '/landlord/profile');
      if (id === 'settings') navigate(role === 'student' ? '/student/settings' : '/landlord/settings');
    }}>
      <div style={{ padding: '24px 24px 40px', background: C.bg, minHeight: '100vh' }}>
        <div style={{ ...fadeIn(), display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: font, fontWeight: 800, fontSize: '1.45rem', color: C.textDark, margin: 0 }}>Profile</h1>
              <p style={{ fontFamily: font, fontSize: '0.92rem', color: C.textMid, margin: '6px 0 0' }}>Manage your personal information and wallet details.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => void loadProfile()} style={{ border: `1px solid ${C.border}`, borderRadius: 999, padding: '10px 16px', background: '#fff', color: C.textDark, fontFamily: font, fontWeight: 700, cursor: 'pointer' }}>Refresh</button>
              <button onClick={handleSave} disabled={saving} style={{ border: 'none', borderRadius: 999, padding: '10px 16px', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: '#fff', fontFamily: font, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1, boxShadow: '0 8px 20px rgba(232,115,74,0.25)' }}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>

          {error ? (
            <div style={{ border: `1px solid rgba(234,67,53,0.2)`, borderRadius: 14, padding: '12px 14px', background: 'rgba(234,67,53,0.06)', color: '#C53030', fontFamily: font, fontWeight: 600 }}>{error}</div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, alignItems: 'start' }}>
            {loading ? (
              <>
                <Card style={{ padding: 24 }}>
                  <div style={{ height: 18, width: '40%', background: '#f3f4f6', borderRadius: 999, marginBottom: 16 }} />
                  <div style={{ height: 64, width: 64, borderRadius: '50%', background: '#f3f4f6', marginBottom: 16 }} />
                  <div style={{ height: 14, width: '70%', background: '#f3f4f6', borderRadius: 999, marginBottom: 10 }} />
                  <div style={{ height: 14, width: '50%', background: '#f3f4f6', borderRadius: 999, marginBottom: 18 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[1, 2, 3, 4].map((item) => <div key={item} style={{ height: 64, borderRadius: 12, background: '#f3f4f6' }} />)}
                  </div>
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ height: 18, width: '40%', background: '#f3f4f6', borderRadius: 999, marginBottom: 16 }} />
                  <div style={{ height: 84, width: 84, borderRadius: '50%', background: '#f3f4f6', marginBottom: 12 }} />
                  <div style={{ height: 14, width: '70%', background: '#f3f4f6', borderRadius: 999, marginBottom: 10 }} />
                </Card>
              </>
            ) : (
              <>
                <Card style={{ padding: 24 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>{initials}</div>
                    <div>
                      <h2 style={{ fontFamily: font, fontWeight: 800, margin: 0, color: C.textDark }}>{displayName}</h2>
                      <p style={{ margin: '4px 0 0', fontFamily: font, fontSize: '0.86rem', color: C.textMid }}>{profile?.role === 'student' ? 'Student' : 'Landlord'} • {walletStatus}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[{ label: 'Email', value: profile?.email || 'Not provided' }, { label: 'Username', value: profile?.username || 'Not set' }, { label: 'Phone', value: profile?.phone || 'Not set' }, { label: 'Member Since', value: formatDate(profile?.createdAt) }].map((item) => (
                      <div key={item.label} style={{ padding: 12, borderRadius: 12, background: '#FAFAFA', border: `1px solid ${C.border}` }}>
                        <div style={{ fontFamily: font, fontSize: '0.72rem', color: C.textLight }}>{item.label}</div>
                        <div style={{ fontFamily: font, fontWeight: 700, color: C.textDark, fontSize: '0.87rem', marginTop: 4 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card style={{ padding: 24 }}>
                  <SectionTitle label="Profile Completion" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{ width: 84, height: 84, borderRadius: '50%', display: 'grid', placeItems: 'center', background: `conic-gradient(${C.orange} ${profileCompletion}%, #F2F2F2 0)`, color: C.textDark, fontWeight: 800 }}>{profileCompletion}%</div>
                    <div>
                      <div style={{ fontFamily: font, fontWeight: 700, color: C.textDark }}>{profileCompletion >= 80 ? 'Excellent profile' : 'Complete more details'}</div>
                      <p style={{ fontFamily: font, fontSize: '0.84rem', color: C.textMid, margin: '6px 0 0' }}>Your profile is synced from your authenticated account and updates automatically.</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20 }}>
            <Card style={{ padding: 24 }}>
              <SectionTitle label="Personal Information" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: font, fontSize: '0.76rem', color: C.textLight }}>Full Name</span>
                  <input value={formState.fullName} onChange={(e) => handleChange('fullName', e.target.value)} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px 12px', fontFamily: font }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: font, fontSize: '0.76rem', color: C.textLight }}>Username</span>
                  <input value={formState.username} onChange={(e) => handleChange('username', e.target.value)} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px 12px', fontFamily: font }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: font, fontSize: '0.76rem', color: C.textLight }}>Profile Picture URL</span>
                  <input value={formState.profilePicture} onChange={(e) => handleChange('profilePicture', e.target.value)} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px 12px', fontFamily: font }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: font, fontSize: '0.76rem', color: C.textLight }}>Phone Number</span>
                  <input value={formState.phone} onChange={(e) => handleChange('phone', e.target.value)} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px 12px', fontFamily: font }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
                  <span style={{ fontFamily: font, fontSize: '0.76rem', color: C.textLight }}>Bio</span>
                  <textarea value={formState.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={3} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px 12px', fontFamily: font, resize: 'vertical' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
                  <span style={{ fontFamily: font, fontSize: '0.76rem', color: C.textLight }}>Location</span>
                  <input value={formState.location} onChange={(e) => handleChange('location', e.target.value)} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px 12px', fontFamily: font }} />
                </label>
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <SectionTitle label="Wallet & Blockchain Overview" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[{ label: 'Wallet Address', value: walletLabel }, { label: 'Network', value: profile?.network || 'Testnet' }, { label: 'Wallet Status', value: walletStatus }, { label: 'Wallet Type', value: profile?.walletType || 'Freighter' }, { label: 'Escrows Created', value: stats?.escrowsCreated?.toString() || '0' }, { label: 'Escrows Completed', value: stats?.escrowsCompleted?.toString() || '0' }].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                    <span style={{ fontFamily: font, fontSize: '0.78rem', color: C.textLight }}>{item.label}</span>
                    <span style={{ fontFamily: font, fontWeight: 700, color: C.textDark }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  <button onClick={handleCopyAddress} disabled={!profile?.walletAddress} style={{ border: `1px solid ${C.border}`, borderRadius: 999, padding: '8px 12px', background: '#fff', color: C.textDark, cursor: profile?.walletAddress ? 'pointer' : 'not-allowed', fontSize: '0.82rem' }}>Copy Address</button>
                  <button onClick={handleConnectWallet} disabled={walletLoading} style={{ border: `1px solid ${C.border}`, borderRadius: 999, padding: '8px 12px', background: '#fff', color: C.orange, cursor: walletLoading ? 'wait' : 'pointer', fontSize: '0.82rem' }}>{walletLoading ? 'Working…' : profile?.isWalletConnected ? 'Reconnect Wallet' : 'Connect Wallet'}</button>
                  <button onClick={handleDisconnectWallet} disabled={walletLoading || !profile?.isWalletConnected} style={{ border: `1px solid rgba(234,67,53,0.2)`, borderRadius: 999, padding: '8px 12px', background: '#fff', color: '#C53030', cursor: walletLoading || !profile?.isWalletConnected ? 'not-allowed' : 'pointer', fontSize: '0.82rem' }}>Disconnect</button>
                </div>
                {profile?.walletAddress ? (
                  <a href={`https://stellar.expert/explorer/testnet/account/${profile.walletAddress}`} target="_blank" rel="noreferrer" style={{ fontFamily: font, fontSize: '0.82rem', color: C.orange, fontWeight: 700, textDecoration: 'none' }}>View on explorer</a>
                ) : null}
              </div>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20 }}>
            <Card style={{ padding: 24 }}>
              <SectionTitle label="Recent Activity" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activity.length === 0 ? (
                  <div style={{ fontFamily: font, color: C.textMid }}>No recent activity yet.</div>
                ) : activity.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(232,115,74,0.12)', color: C.orange }}>{item.icon || '🔗'}</div>
                      <div>
                        <div style={{ fontFamily: font, fontWeight: 700, color: C.textDark }}>{item.title}</div>
                        <div style={{ fontFamily: font, fontSize: '0.78rem', color: C.textMid }}>{formatDateTime(item.timestamp)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge label={item.status} tone={item.status === 'Released' || item.status === 'Completed' ? 'success' : item.status === 'Disputed' ? 'danger' : 'info'} />
                      {item.transactionLink ? <div style={{ marginTop: 6 }}><a href={item.transactionLink} target="_blank" rel="noreferrer" style={{ fontFamily: font, fontSize: '0.76rem', color: C.orange, textDecoration: 'none' }}>View Tx</a></div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <SectionTitle label="Security Overview" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[{ label: 'Email Verified', value: profile?.emailVerified ? 'Verified' : 'Pending', tone: profile?.emailVerified ? 'success' : 'warning' }, { label: 'Wallet Verified', value: profile?.walletVerified ? 'Verified' : 'Pending', tone: profile?.walletVerified ? 'success' : 'warning' }, { label: 'KYC Status', value: profile?.kycStatus || 'Pending', tone: profile?.kycStatus === 'Approved' ? 'success' : 'warning' }, { label: '2FA Status', value: profile?.twoFactorEnabled ? 'Enabled' : 'Disabled', tone: profile?.twoFactorEnabled ? 'success' : 'neutral' }, { label: 'Last Login', value: formatDateTime(profile?.lastLogin), tone: 'info' }].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                    <span style={{ fontFamily: font, fontSize: '0.78rem', color: C.textLight }}>{item.label}</span>
                    <StatusBadge label={item.value} tone={item.tone as 'info' | 'success' | 'warning' | 'danger' | 'neutral'} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        <Toast visible={toastVisible} message={toastMsg} type={toastType} />
      </div>
    </DashboardLayout>
  );
};

export const SettingsPage: React.FC<Props> = ({ role }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ notifications: true, theme: 'system', language: 'English', privacyPreferences: 'Standard' });

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2200);
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as UserProfile;
      setSettings({
        notifications: parsed.notifications ?? true,
        theme: parsed.theme || 'system',
        language: parsed.language || 'English',
        privacyPreferences: parsed.privacyPreferences || 'Standard',
      });
    } catch {
      // Ignore malformed local storage data.
    }
  }, []);

  const toggle = (key: 'notifications') => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateUserProfile({
        theme: settings.theme,
        notifications: settings.notifications,
        language: settings.language,
        privacyPreferences: settings.privacyPreferences,
      });
      if ('success' in response && response.success) {
        showToast('Settings saved successfully', 'success');
      } else {
        showToast('Unable to save settings', 'error');
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={role} userName={authUser?.name || 'User'} navItems={buildNavItems(role)} activeId="settings" onNavChange={(id) => {
      if (id === 'dashboard') navigate(role === 'student' ? '/student/dashboard' : '/landlord/dashboard');
      if (id === 'deposits') navigate('/student/my-deposits');
      if (id === 'escrow') navigate('/student/create-escrow');
      if (id === 'transactions') navigate(role === 'student' ? '/student/transactions' : '/landlord/transactions');
      if (id === 'profile') navigate(role === 'student' ? '/student/profile' : '/landlord/profile');
      if (id === 'settings') navigate(role === 'student' ? '/student/settings' : '/landlord/settings');
    }}>
      <div style={{ padding: '24px 24px 40px', background: C.bg, minHeight: '100vh' }}>
        <div style={{ ...fadeIn(), display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: font, fontWeight: 800, fontSize: '1.45rem', color: C.textDark, margin: 0 }}>Settings</h1>
              <p style={{ fontFamily: font, fontSize: '0.92rem', color: C.textMid, margin: '6px 0 0' }}>Manage your account preferences and wallet connectivity.</p>
            </div>
            <button onClick={() => void handleSave()} disabled={saving} style={{ border: 'none', borderRadius: 999, padding: '10px 16px', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: '#fff', fontFamily: font, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', boxShadow: '0 8px 20px rgba(232,115,74,0.25)' }}>{saving ? 'Saving…' : 'Save Settings'}</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card style={{ padding: 24 }}>
              <SectionTitle label="Preferences" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: font, fontSize: '0.87rem', color: C.textDark }}>Notifications</span>
                  <button onClick={() => toggle('notifications')} style={{ width: 44, height: 24, borderRadius: 999, border: 'none', background: settings.notifications ? `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})` : '#D9D9D9', cursor: 'pointer', position: 'relative' }}>
                    <span style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: settings.notifications ? 23 : 3, transition: 'left 0.2s' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: font, fontSize: '0.87rem', color: C.textDark }}>Theme</span>
                  <select value={settings.theme} onChange={(e) => setSettings((prev) => ({ ...prev, theme: e.target.value }))} style={{ borderRadius: 999, border: `1px solid ${C.border}`, padding: '8px 12px', fontFamily: font, color: C.textDark }}>
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: font, fontSize: '0.87rem', color: C.textDark }}>Language</span>
                  <select value={settings.language} onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))} style={{ borderRadius: 999, border: `1px solid ${C.border}`, padding: '8px 12px', fontFamily: font, color: C.textDark }}>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <span style={{ fontFamily: font, fontSize: '0.87rem', color: C.textDark }}>Privacy</span>
                  <select value={settings.privacyPreferences} onChange={(e) => setSettings((prev) => ({ ...prev, privacyPreferences: e.target.value }))} style={{ borderRadius: 999, border: `1px solid ${C.border}`, padding: '8px 12px', fontFamily: font, color: C.textDark }}>
                    <option value="Standard">Standard</option>
                    <option value="Private">Private</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <SectionTitle label="Account Security" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}><span style={{ fontFamily: font, color: C.textDark }}>Connected Wallet</span><span style={{ fontFamily: font, fontWeight: 700, color: C.orange }}>{authUser?.walletAddress ? 'Connected' : 'Not connected'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}><span style={{ fontFamily: font, color: C.textDark }}>Preferred Network</span><span style={{ fontFamily: font, fontWeight: 700, color: C.textDark }}>Testnet</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}><span style={{ fontFamily: font, color: C.textDark }}>2FA Status</span><span style={{ fontFamily: font, fontWeight: 700, color: C.textDark }}>Disabled</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}><span style={{ fontFamily: font, color: C.textDark }}>Active Sessions</span><span style={{ fontFamily: font, fontWeight: 700, color: C.textDark }}>1</span></div>
              </div>
            </Card>
          </div>

          <Card style={{ padding: 24 }}>
            <SectionTitle label="Danger Zone" />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => setShowConfirm(true)} style={{ border: '1px solid rgba(234,67,53,0.2)', borderRadius: 999, padding: '10px 16px', background: '#fff', color: '#C53030', fontFamily: font, fontWeight: 700, cursor: 'pointer' }}>Reset Preferences</button>
              <button onClick={() => setShowConfirm(true)} style={{ border: '1px solid rgba(234,67,53,0.2)', borderRadius: 999, padding: '10px 16px', background: '#fff', color: '#C53030', fontFamily: font, fontWeight: 700, cursor: 'pointer' }}>Disconnect Wallet</button>
              <button onClick={() => setShowConfirm(true)} style={{ border: '1px solid rgba(234,67,53,0.2)', borderRadius: 999, padding: '10px 16px', background: '#fff', color: '#C53030', fontFamily: font, fontWeight: 700, cursor: 'pointer' }}>Logout</button>
            </div>
          </Card>
        </div>
        {showConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.24)', display: 'grid', placeItems: 'center', zIndex: 10000 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 'min(92vw, 420px)', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontFamily: font, marginTop: 0, color: C.textDark }}>Confirm action</h3>
              <p style={{ fontFamily: font, color: C.textMid, lineHeight: 1.6 }}>This action cannot be undone. Continue?</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button onClick={() => setShowConfirm(false)} style={{ border: `1px solid ${C.border}`, borderRadius: 999, padding: '10px 14px', background: '#fff', fontFamily: font, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { setShowConfirm(false); showToast('Action confirmed', 'success'); }} style={{ border: 'none', borderRadius: 999, padding: '10px 14px', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: '#fff', fontFamily: font, fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
              </div>
            </div>
          </div>
        )}
        <Toast visible={toastVisible} message={toastMsg} type={toastType} />
      </div>
    </DashboardLayout>
  );
};
