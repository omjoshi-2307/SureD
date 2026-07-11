import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleLogin } from '../../services/authService';

const C = { orange: '#E8734A', orangeLight: '#F0956B', bg: '#F4F6FA', white: '#FFFFFF', border: '#EEEEEE', textDark: '#1A1A1A', textMid: '#6B6B6B', textLight: '#AAAAAA' };
const font = "'Poppins', sans-serif";

const GoogleRoleSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  const [selectedRole, setSelectedRole] = useState<'student' | 'landlord' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!state?.credential || !state?.email) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, font }}>
        <div style={{ background: C.white, borderRadius: 20, padding: 40, maxWidth: 400, textAlign: 'center', border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: C.textDark, marginBottom: 8 }}>Session Expired</h2>
          <p style={{ fontSize: '0.85rem', color: C.textMid, marginBottom: 20 }}>Your Google sign-in session has expired. Please try again.</p>
          <button onClick={() => navigate('/')}
            style={{ font, fontWeight: 700, fontSize: '0.85rem', color: '#fff', background: `linear-gradient(135deg,${C.orange},${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '11px 24px', cursor: 'pointer' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedRole) { setError('Please select an account type.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const result = await googleLogin({
        credential: state.credential,
        name: state.name,
        email: state.email,
        role: selectedRole,
      });
      if (result.token && result.user) {
        const role = result.user.role;
        navigate(role === 'student' ? '/student/dashboard' : '/landlord/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, font, padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 24, padding: '36px 40px', maxWidth: 440, width: '100%', border: `1px solid ${C.border}`, boxShadow: '0 12px 48px rgba(0,0,0,0.08)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {state.picture ? (
            <img src={state.picture} alt="" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px', display: 'block', border: `2px solid ${C.border}` }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px', background: `linear-gradient(135deg,${C.orange},${C.orangeLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>
              {state.name?.charAt(0) || '?'}
            </div>
          )}
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: C.textDark, letterSpacing: '-0.5px', marginBottom: 6 }}>
            Choose Account Type
          </h1>
          <p style={{ fontSize: '0.85rem', color: C.textMid, lineHeight: 1.5 }}>
            Welcome, <strong>{state.name || state.email}</strong>!<br />
            Select how you'll use DepositSafe.
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {/* Student */}
          <button
            onClick={() => { setSelectedRole('student'); setError(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
              borderRadius: 16, border: `2px solid ${selectedRole === 'student' ? C.orange : C.border}`,
              background: selectedRole === 'student' ? 'rgba(232,115,74,0.06)' : C.white,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              boxShadow: selectedRole === 'student' ? '0 4px 16px rgba(232,115,74,0.15)' : 'none',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: selectedRole === 'student' ? `linear-gradient(135deg,${C.orange},${C.orangeLight})` : '#F5F5F5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
              transition: 'background 0.2s',
            }}>🎓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 2 }}>Student</div>
              <div style={{ fontSize: '0.78rem', color: C.textMid, lineHeight: 1.4 }}>
                I'm a tenant looking to secure my rental deposit on the blockchain.
              </div>
            </div>
            {selectedRole === 'student' && (
              <span style={{ fontSize: '1.2rem' }}>✓</span>
            )}
          </button>

          {/* Landlord */}
          <button
            onClick={() => { setSelectedRole('landlord'); setError(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
              borderRadius: 16, border: `2px solid ${selectedRole === 'landlord' ? C.orange : C.border}`,
              background: selectedRole === 'landlord' ? 'rgba(232,115,74,0.06)' : C.white,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              boxShadow: selectedRole === 'landlord' ? '0 4px 16px rgba(232,115,74,0.15)' : 'none',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: selectedRole === 'landlord' ? `linear-gradient(135deg,${C.orange},${C.orangeLight})` : '#F5F5F5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
              transition: 'background 0.2s',
            }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 2 }}>Landlord</div>
              <div style={{ fontSize: '0.78rem', color: C.textMid, lineHeight: 1.4 }}>
                I'm a property manager receiving deposit payments from my tenants.
              </div>
            </div>
            {selectedRole === 'landlord' && (
              <span style={{ fontSize: '1.2rem' }}>✓</span>
            )}
          </button>
        </div>

        {error && (
          <div style={{ font, fontSize: '0.82rem', color: '#ea4335', textAlign: 'center', marginBottom: 16 }}>⚠️ {error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedRole || submitting}
          style={{
            width: '100%', font, fontWeight: 700, fontSize: '0.88rem',
            color: '#fff', border: 'none', borderRadius: 50, padding: '13px',
            background: selectedRole ? `linear-gradient(135deg,${C.orange},${C.orangeLight})` : '#CCCCCC',
            cursor: selectedRole && !submitting ? 'pointer' : 'not-allowed',
            boxShadow: selectedRole ? '0 6px 20px rgba(232,115,74,0.35)' : 'none',
            transition: 'all 0.2s',
            opacity: selectedRole ? 1 : 0.5,
          }}
        >
          {submitting ? 'Creating Account…' : 'Continue'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: C.textLight, marginTop: 16, lineHeight: 1.5 }}>
          This role can be changed later in your profile settings.
        </p>
      </div>
    </div>
  );
};

export default GoogleRoleSelect;