import React, { useEffect, useState } from 'react';
import Sparkle from './Sparkle';

interface WelcomePageProps {
  onEnterLanding: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onEnterLanding }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
        textAlign: 'center',
      }}
    >
      {/* Premium Subtle Grid Background (fades out at edges) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(232, 115, 74, 0.035) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(232, 115, 74, 0.035) 1.5px, transparent 1.5px)',
        backgroundSize: '56px 56px',
        backgroundPosition: 'center',
        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 80%)',
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 80%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Background glow blobs */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '20%',
        width: 450,
        height: 450,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,115,74,0.18) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: 350,
        height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,149,107,0.14) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Floating Sparkles around the center content */}
      <span style={{
        position: 'absolute',
        top: '32%',
        left: '25%',
        zIndex: 2,
        opacity: animate ? 1 : 0,
        transition: 'opacity 1s ease',
      }}>
        <Sparkle size={26} color="#E8734A" />
      </span>
      <span style={{
        position: 'absolute',
        bottom: '30%',
        right: '24%',
        zIndex: 2,
        opacity: animate ? 1 : 0,
        transition: 'opacity 1s ease 0.3s',
      }}>
        <Sparkle size={18} color="#F0956B" />
      </span>
      <span style={{
        position: 'absolute',
        top: '22%',
        right: '30%',
        zIndex: 2,
        opacity: animate ? 1 : 0,
        transition: 'opacity 1s ease 0.5s',
      }}>
        <Sparkle size={15} color="#E8734A" />
      </span>

      {/* Main Centered Container */}
      <div
        style={{
          maxWidth: 680,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          zIndex: 10,
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Big SureDeposit Header */}
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(3rem, 8vw, 5.2rem)',
            lineHeight: 1.05,
            color: '#1A1A1A',
            letterSpacing: '-2.5px',
          }}
        >
          Sure<span className="gradient-text">deposit</span>
        </h1>

        {/* Classic Line regarding Student Rentals */}
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
            color: '#5A5A5A',
            lineHeight: 1.65,
            maxWidth: 580,
            letterSpacing: '-0.3px',
          }}
        >
          Simplifying student rentals. Lock in your university home without locking up your hard-earned cash — fully secure, transparent, and hassle-free.
        </p>

        {/* Action Button */}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={onEnterLanding}
            className="btn-shimmer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              color: '#fff',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.4px',
              padding: '16px 20px 16px 32px',
              borderRadius: 50,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(232,115,74,0.45)',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(232,115,74,0.55)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,115,74,0.45)';
            }}
          >
            GET STARTED
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
