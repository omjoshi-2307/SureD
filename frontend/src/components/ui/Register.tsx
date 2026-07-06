import React, { useState } from 'react';
import Sparkle from './Sparkle';
import { registerUser } from "../../services/authService";

interface RegisterProps {
  onBack: () => void;
  onSignIn: () => void;
  /** Demo only: called with selected role on submit. Replace with real auth later. */
  onRegister?: (role: 'student' | 'landlord') => void;
}

const Register: React.FC<RegisterProps> = ({ onBack, onSignIn, onRegister }) => {
  const [role, setRole] = useState<'student' | 'landlord'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── Real registration handler ── */
  const handleRegister = async () => {
    setError('');
    if (!firstName.trim()) { setError('Please enter your first name.'); return; }
    if (!lastName.trim()) { setError('Please enter your last name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service and Privacy Policy.'); return; }

    setLoading(true);
    try {
      await registerUser({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
        role,
      });
      // On success: switch to the Login screen
      onSignIn();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Password strength ── */
  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-4
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['#E0E0E0', '#E85454', '#F0A34A', '#4ACFE8', '#4ACF7A'][strength];

  /* ── Input focus helpers ── */
  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#E8734A';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,115,74,0.14)';
    e.currentTarget.style.background = '#FFFFFF';
  };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#EAEAEA';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = '#FAFAFA';
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px 13px 40px',
    borderRadius: 12,
    border: '1.5px solid #EAEAEA',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    background: '#FAFAFA',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: '0.82rem',
    color: '#333',
  };

  return (
    <div
      style={{
        background: '#FAFAFA',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
      }}
    >
      {/* ── Grid Background ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage:
          'linear-gradient(rgba(232,115,74,0.038) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(232,115,74,0.038) 1.5px, transparent 1.5px)',
        backgroundSize: '56px 56px',
        backgroundPosition: 'center',
        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 80%)',
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 80%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Glow Blobs ── */}
      <div style={{
        position: 'absolute', top: '-5%', right: '-5%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,115,74,0.14) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '-5%', left: '-5%',
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,149,107,0.11) 0%, transparent 70%)',
        filter: 'blur(55px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Sparkles ── */}
      <span style={{ position: 'absolute', top: '10%', left: '8%', zIndex: 2 }}>
        <Sparkle size={22} color="#E8734A" />
      </span>
      <span style={{ position: 'absolute', bottom: '12%', right: '7%', zIndex: 2 }}>
        <Sparkle size={16} color="#F0956B" />
      </span>
      <span style={{ position: 'absolute', top: '20%', right: '12%', zIndex: 2 }}>
        <Sparkle size={13} color="#E8734A" />
      </span>

      {/* ── Back Button ── */}
      <div style={{ position: 'absolute', top: 24, left: 32, zIndex: 20 }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #EAEAEA', background: '#FFFFFF',
            borderRadius: 50, padding: '8px 18px',
            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
            fontSize: '0.82rem', color: '#333333',
            cursor: 'pointer', transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#E8734A';
            e.currentTarget.style.color = '#E8734A';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(232,115,74,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#EAEAEA';
            e.currentTarget.style.color = '#333333';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Home
        </button>
      </div>

      {/* ══════════════════════════════════════════
          REGISTER CARD
      ══════════════════════════════════════════ */}
      <div
        style={{
          width: '100%', maxWidth: 500,
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.05)',
          borderRadius: 28,
          padding: '44px 40px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', gap: 22,
          position: 'relative', zIndex: 10,
        }}
      >
        {/* ── Brand ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 800,
              fontSize: '1.4rem', color: '#1A1A1A', letterSpacing: '-0.5px',
            }}>Sure</span>
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.4rem',
              background: 'linear-gradient(135deg, #E8734A 0%, #F0956B 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.5px',
            }}>deposit</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 800,
              fontSize: '1.75rem', color: '#1A1A1A',
              letterSpacing: '-0.8px', marginBottom: 4, lineHeight: 1.15,
            }}>
              Create Account
            </h1>
            <p style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 400,
              fontSize: '0.88rem', color: '#6B6B6B', lineHeight: 1.5,
            }}>
              Join thousands protecting their rental deposits
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '1px solid #F0F0F0' }} />

        {/* ── Role Selector ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={labelStyle}>I am registering as a</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['student', 'landlord'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 50,
                  border: role === r ? '1.5px solid transparent' : '1.5px solid #EAEAEA',
                  background: role === r
                    ? 'linear-gradient(135deg, #E8734A 0%, #F0956B 100%)'
                    : '#FFFFFF',
                  color: role === r ? '#FFFFFF' : '#1A1A1A',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: role === r ? '0 6px 18px rgba(232,115,74,0.3)' : 'none',
                  textTransform: 'capitalize',
                }}
                onMouseEnter={e => {
                  if (role !== r) {
                    e.currentTarget.style.borderColor = '#E8734A';
                    e.currentTarget.style.color = '#E8734A';
                  }
                }}
                onMouseLeave={e => {
                  if (role !== r) {
                    e.currentTarget.style.borderColor = '#EAEAEA';
                    e.currentTarget.style.color = '#1A1A1A';
                  }
                }}
              >
                {r === 'student' ? '🎓 Student' : '🏢 Landlord'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Name Row ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          {/* First Name */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="reg-firstname" style={labelStyle}>First Name</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: '#8A8A8A', display: 'flex', alignItems: 'center', pointerEvents: 'none',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="reg-firstname"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
          </div>

          {/* Last Name */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="reg-lastname" style={labelStyle}>Last Name</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: '#8A8A8A', display: 'flex', alignItems: 'center', pointerEvents: 'none',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="reg-lastname"
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
          </div>
        </div>

        {/* ── Email ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="reg-email" style={labelStyle}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: '#8A8A8A', display: 'flex', alignItems: 'center', pointerEvents: 'none',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@university.ac.uk"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>
        </div>

        {/* ── Password ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="reg-password" style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: '#8A8A8A', display: 'flex', alignItems: 'center', pointerEvents: 'none',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8A8A8A', display: 'flex', alignItems: 'center',
                padding: 0, transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E8734A')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8A')}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Password strength bar */}
          {password.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 99,
                    background: i <= strength ? strengthColor : '#EEEEEE',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
              <span style={{
                fontFamily: "'Poppins', sans-serif", fontSize: '0.72rem',
                fontWeight: 600, color: strengthColor,
              }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* ── Confirm Password ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="reg-confirm" style={labelStyle}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: '#8A8A8A', display: 'flex', alignItems: 'center', pointerEvents: 'none',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                ...inputStyle,
                paddingRight: 44,
                borderColor: confirm.length > 0
                  ? confirm === password ? '#4ACF7A' : '#E85454'
                  : '#EAEAEA',
              }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              tabIndex={-1}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8A8A8A', display: 'flex', alignItems: 'center',
                padding: 0, transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E8734A')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8A')}
            >
              {showConfirm ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {confirm.length > 0 && confirm !== password && (
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '0.72rem',
              fontWeight: 600, color: '#E85454',
            }}>
              Passwords don't match
            </span>
          )}
        </div>

        {/* ── Terms checkbox ── */}
        <label
          htmlFor="terms"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
            fontFamily: "'Poppins', sans-serif", fontSize: '0.82rem',
            color: '#5A5A5A', fontWeight: 400, userSelect: 'none', lineHeight: 1.5,
          }}
        >
          <div
            onClick={() => setAgreed(v => !v)}
            style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
              border: `2px solid ${agreed ? '#E8734A' : '#D0D0D0'}`,
              background: agreed ? '#E8734A' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {agreed && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          I agree to the{' '}
          <a href="#" onClick={e => e.preventDefault()}
            style={{ color: '#E8734A', fontWeight: 600, textDecoration: 'none' }}>
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" onClick={e => e.preventDefault()}
            style={{ color: '#E8734A', fontWeight: 600, textDecoration: 'none' }}>
            Privacy Policy
          </a>
        </label>

        {/* ── Inline Error Message ── */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(232,84,84,0.08)',
            border: '1px solid rgba(232,84,84,0.22)',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.8rem',
            color: '#C0392B',
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* ── Primary Register Button ── */}
        <button
          type="button"
          className="btn-shimmer"
          onClick={handleRegister}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, width: '100%',
            color: '#fff',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.4px',
            padding: '15px', borderRadius: 50, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.75 : 1,
            boxShadow: '0 8px 28px rgba(232,115,74,0.4)',
            transition: 'transform 0.25s, box-shadow 0.25s',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 36px rgba(232,115,74,0.5)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,115,74,0.4)';
          }}
        >
          {loading ? 'CREATING ACCOUNT…' : 'CREATE MY ACCOUNT'}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>

        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.75rem', color: '#AAAAAA', fontWeight: 500,
          }}>or sign up with</span>
          <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
        </div>

        {/* ── Google SSO ── */}
        <button
          type="button"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '13px',
            border: '1.5px solid #EAEAEA', borderRadius: 50,
            background: '#FFFFFF', cursor: 'pointer',
            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
            fontSize: '0.85rem', color: '#333',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#E8734A';
            e.currentTarget.style.color = '#E8734A';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,115,74,0.12)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#EAEAEA';
            e.currentTarget.style.color = '#333';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg width="17" height="17" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
            <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4"/>
            <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853"/>
            <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04"/>
            <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335"/>
          </svg>
          Continue with Google
        </button>

        {/* ── Sign In Link ── */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '0.85rem', color: '#6B6B6B', fontWeight: 400,
        }}>
          Already have an account?{' '}
          <a
            href="#"
            onClick={e => { e.preventDefault(); onSignIn(); }}
            style={{
              color: '#E8734A', fontWeight: 700, textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Sign In
          </a>
        </p>

        {/* ── Trust Badges ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, flexWrap: 'wrap',
        }}>
          {['🔒 SSL Secured', '🏦 FCA Authorised', '⭐ 4.9/5 Rated'].map(badge => (
            <span key={badge} style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 500,
              fontSize: '0.68rem', color: '#AAAAAA',
              background: '#F9F9F9', border: '1px solid #EEEEEE',
              borderRadius: 50, padding: '4px 10px', whiteSpace: 'nowrap',
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Register;
