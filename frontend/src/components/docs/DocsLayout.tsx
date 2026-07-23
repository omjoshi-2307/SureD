import React, { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react';

const STARS = [
  { top: '14%', left: '12%', size: 2, delay: 0 },
  { top: '22%', left: '82%', size: 1, delay: 0.7 },
  { top: '9%', left: '55%', size: 1, delay: 1.4 },
  { top: '30%', left: '25%', size: 1, delay: 2.1 },
  { top: '18%', left: '68%', size: 2, delay: 0.4 },
  { top: '38%', left: '90%', size: 1, delay: 1.8 },
  { top: '42%', left: '8%', size: 2, delay: 1.1 },
  { top: '6%', left: '30%', size: 1, delay: 2.5 },
  { top: '26%', left: '45%', size: 1, delay: 3.0 },
  { top: '48%', left: '78%', size: 1, delay: 0.2 },
];

export interface RelatedLink {
  title: string;
  href: string;
  description: string;
}

interface DocsLayoutProps {
  title: string;
  description: string;
  relatedLinks: RelatedLink[];
  children: React.ReactNode;
}

const DocsLayout: React.FC<DocsLayoutProps> = ({ title, description, relatedLinks, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate('/docs');
  };

  return (
    <div className="dl-canvas" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Atmosphere */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(900px, 120vw)',
          height: 'min(900px, 120vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div className="dl-horizon dl-horizon-left" aria-hidden="true" />
      <div className="dl-horizon dl-horizon-right" aria-hidden="true" />
      {STARS.map((s, i) => (
        <span
          key={i}
          className="dl-star"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          aria-hidden="true"
        />
      ))}
      <div className="dl-vignette" aria-hidden="true" />

      {/* Navigation / Breadcrumbs */}
      <header style={{ position: 'relative', zIndex: 10, padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/docs" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Documentation</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#fff', fontWeight: 500 }}>{title}</span>
          </div>
          <button
            onClick={handleGoBack}
            className="btn-glass"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
            aria-label="Back to Docs"
          >
            <ArrowLeft size={16} />
            Back to Docs
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '56px 24px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        
        {/* Header Section */}
        <div style={{ width: '100%', maxWidth: 840, marginBottom: 48 }}>
          <h1 className="text-hero-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 16 }}>
            {title}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
            {description}
          </p>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', width: '100%', marginTop: 32 }} />
        </div>

        {/* Dynamic Content */}
        <div className="docs-content" style={{ 
          width: '100%', 
          maxWidth: 840, 
          fontFamily: "'Inter', sans-serif", 
          color: 'rgba(255,255,255,0.85)', 
          lineHeight: 1.7,
          fontSize: '1.05rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 32
        }}>
          {children}
        </div>

        {/* Related Articles Footer */}
        {relatedLinks && relatedLinks.length > 0 && (
          <div style={{ width: '100%', maxWidth: 840, marginTop: 80, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 48 }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: 24 }}>
              Related Articles
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {relatedLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.href}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16,
                    padding: 24,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <FileText size={18} color="#A78BFA" />
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                      {link.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    {link.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DocsLayout;
