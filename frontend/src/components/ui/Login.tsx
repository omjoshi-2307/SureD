import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, googleLogin } from '../../services/authService';
import { initGoogleSignIn, setGoogleCallback, renderHiddenGoogleButton, clickGoogleSignIn, destroyHiddenGoogleButton } from '../../services/googleSignInService';
import Sparkle from './Sparkle';

interface LoginProps {
  onBack: () => void;
  onRegister: () => void;
  /** Demo only: called with selected role on submit. Replace with real auth later. */
  onLogin?: (role: 'student' | 'landlord') => void;
}

const Login: React.FC<LoginProps> = ({ onBack, onRegister, onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'landlord'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  /* ── Google Sign-In ── */
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    initGoogleSignIn(GOOGLE_CLIENT_ID);
    renderHiddenGoogleButton();
    setGoogleCallback(handleGoogleResponse);
    return () => {
      setGoogleCallback(null);
      destroyHiddenGoogleButton();
      if (googleTimeoutRef.current !== null) {
        window.clearTimeout(googleTimeoutRef.current);
        googleTimeoutRef.current = null;
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = async (response: any) => {
    if (googleTimeoutRef.current !== null) {
      window.clearTimeout(googleTimeoutRef.current);
      googleTimeoutRef.current = null;
    }
    if (!response?.credential) {
      setError('Google authentication failed. No credential received.');
      setGoogleLoading(false);
      return;
    }

    try {
      setGoogleLoading(true);
      setError('');

      const result = await googleLogin({ credential: response.credential });

      if (result.needsRole) {
        navigate('/auth/google-role-select', {
          state: {
            credential: response.credential,
            email: result.email,
            name: result.name,
            picture: result.picture,
          },
        });
        return;
      }

      if (result.token && result.user) {
        const userRole = result.user.role;
        if (userRole === 'student') navigate('/student/dashboard');
        else if (userRole === 'landlord') navigate('/landlord/dashboard');
        else setError('Unexpected user role returned.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Google login failed.';
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }
    if (!window.google?.accounts?.id) {
      setError('Google Sign-In is loading. Please try again in a moment.');
      return;
    }
    setGoogleLoading(true);
    setError('');

    if (!clickGoogleSignIn()) {
      setError('Google Sign-In is not available. Please try again.');
      setGoogleLoading(false);
      return;
    }

    if (googleTimeoutRef.current !== null) {
      window.clearTimeout(googleTimeoutRef.current);
    }
    googleTimeoutRef.current = window.setTimeout(() => {
      setGoogleLoading(false);
      setError('Google Sign-In did not complete. Please try again.');
    }, 30000);
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      const response = await loginUser({ email: email.trim(), password });
      const userRole: string = response?.user?.role ?? '';
      if (userRole === 'student') {
        navigate('/student/dashboard');
      } else if (userRole === 'landlord') {
        navigate('/landlord/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Unknown role. Please contact support.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const upfrontSaved = Math.round(((1500 * 12) / 52) * 4);

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
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(232,115,74,0.038) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(232,115,74,0.038) 1.5px, transparent 1.5px)',
        backgroundSize: '56px 56px',
        backgroundPosition: 'center',
        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 80%)',
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 80%)',
        pointerEvents: 'none',
        zIndex: 0,
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
      <span style={{ position: 'absolute', top: '12%', left: '10%', zIndex: 2 }}>
        <Sparkle size={22} color="#E8734A" />
      </span>
      <span style={{ position: 'absolute', bottom: '14%', right: '9%', zIndex: 2 }}>
        <Sparkle size={16} color="#F0956B" />
      </span>
      <span style={{ position: 'absolute', top: '18%', right: '16%', zIndex: 2 }}>
        <Sparkle size={13} color="#E8734A" />
      </span>

      {/* ── Top-Left Back Button ── */}
      <div style={{
        position: 'absolute', top: 24, left: 32,
        display: 'flex', alignItems: 'center', gap: 16, zIndex: 20,
      }}>
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
          LOGIN CARD
      ══════════════════════════════════════════ */}
      <div
        style={{
          width: '100%', maxWidth: 460,
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.05)',
          borderRadius: 28,
          padding: '44px 40px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', gap: 24,
          position: 'relative', zIndex: 10,
        }}
      >
        {/* ── Brand ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
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
              Welcome Back
            </h1>
            <p style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 400,
              fontSize: '0.88rem', color: '#6B6B6B', lineHeight: 1.5,
            }}>
              Sign in to your DepositSafe account
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '1px solid #F0F0F0' }} />

        {/* ── Role Selector ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700,
            fontSize: '0.82rem', color: '#333',
          }}>
            I am a
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['student', 'landlord'] as const).map((r) => (
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
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
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

        {/* ── Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="login-email"
              style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                fontSize: '0.82rem', color: '#333',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              {/* Mail icon */}
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
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
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
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#E8734A';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,115,74,0.14)';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#EAEAEA';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = '#FAFAFA';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="login-password"
              style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                fontSize: '0.82rem', color: '#333',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              {/* Lock icon */}
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
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 44px 13px 40px',
                  borderRadius: 12,
                  border: '1.5px solid #EAEAEA',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  background: '#FAFAFA',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#E8734A';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,115,74,0.14)';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#EAEAEA';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = '#FAFAFA';
                }}
              />
              {/* Show / hide toggle */}
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
                  /* Eye-off */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Remember Me + Forgot Password ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <label
            htmlFor="remember-me"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif", fontSize: '0.82rem',
              color: '#5A5A5A', fontWeight: 500, userSelect: 'none',
            }}
          >
            <div
              onClick={() => setRemember(v => !v)}
              style={{
                width: 18, height: 18, borderRadius: 5,
                border: `2px solid ${remember ? '#E8734A' : '#D0D0D0'}`,
                background: remember ? '#E8734A' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease', flexShrink: 0,
              }}
            >
              {remember && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            Remember me
          </label>

          <a
            href="#"
            onClick={e => e.preventDefault()}
            style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 600,
              fontSize: '0.82rem', color: '#E8734A', textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Forgot password?
          </a>
        </div>

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

        {/* ── Primary Login Button ── */}
        <button
          type="button"
          className="btn-shimmer"
          onClick={handleLogin}
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
          {loading ? 'SIGNING IN…' : 'SIGN IN'}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>

        {/* ── Divider ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, margin: '0 0',
        }}>
          <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.75rem', color: '#AAAAAA', fontWeight: 500,
          }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
        </div>

        {/* ── Google SSO ── */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={googleLoading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '13px',
            border: '1.5px solid #EAEAEA', borderRadius: 50,
            background: googleLoading ? '#F5F5F5' : '#FFFFFF',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
            fontSize: '0.85rem', color: googleLoading ? '#999' : '#333',
            transition: 'all 0.25s ease',
            opacity: googleLoading ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (googleLoading) return;
            e.currentTarget.style.borderColor = '#E8734A';
            e.currentTarget.style.color = '#E8734A';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,115,74,0.12)';
          }}
          onMouseLeave={e => {
            if (googleLoading) return;
            e.currentTarget.style.borderColor = '#EAEAEA';
            e.currentTarget.style.color = '#333';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Google icon or spinner */}
          {googleLoading ? (
            <span style={{ display: 'inline-block', width: 17, height: 17 }}>⏳</span>
          ) : (
            <svg width="17" height="17" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4"/>
              <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853"/>
              <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04"/>
              <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335"/>
            </svg>
          )}
          {googleLoading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* ── Register Link ── */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '0.85rem', color: '#6B6B6B', fontWeight: 400,
        }}>
          Don&apos;t have an account?{' '}
          <a
            href="#"
            onClick={e => { e.preventDefault(); onRegister(); }}
            style={{
              color: '#E8734A', fontWeight: 700, textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Register
          </a>
        </p>

        {/* Trust badges at the bottom of the card */}
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

export default Login;
