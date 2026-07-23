import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/* Deterministic star field — fixed positions so render is stable */
const STARS: Array<{ top: string; left: string; size: number; delay: number }> = [
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

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="dl-canvas" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Atmosphere: glow, horizon streaks, vignette, stars */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(900px, 120vw)',
          height: 'min(900px, 120vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 65%)',
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

      {/* Navigation - Just a back button */}
      <header style={{ position: 'relative', zIndex: 10, padding: '24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <button
            onClick={handleGoBack}
            className="btn-glass"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            aria-label="Go Back"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 24px 120px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 840, width: '100%' }}>
          <h1 className="text-hero-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 8 }}>
            Privacy Policy
          </h1>

          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: 24, 
            padding: 'clamp(24px, 5vw, 48px)', 
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <Section title="1. Introduction">
              <p>DepositSafe values your privacy. This Privacy Policy describes how your information is collected, used, stored, and protected when you use our platform.</p>
            </Section>

            <Divider />

            <Section title="2. Information We Collect">
              <p>We collect the following types of information:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Name</li>
                <li>Email address</li>
                <li>Google authentication information</li>
                <li>Wallet address</li>
                <li>Rental transaction information</li>
                <li>Device/browser information</li>
                <li>IP address</li>
                <li>Usage analytics</li>
              </ul>
            </Section>

            <Divider />

            <Section title="3. How We Use Your Information">
              <p>Your information is used to:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Provide platform services</li>
                <li>Authenticate users</li>
                <li>Manage escrow transactions</li>
                <li>Improve user experience</li>
                <li>Prevent fraud</li>
                <li>Enhance platform security</li>
                <li>Communicate important updates</li>
              </ul>
            </Section>

            <Divider />

            <Section title="4. Blockchain Information">
              <p>Blockchain transactions are public by nature. Please be aware that wallet addresses and on-chain transaction records may be publicly visible on the Stellar blockchain. This is an inherent characteristic of blockchain technology.</p>
            </Section>

            <Divider />

            <Section title="5. Cookies &amp; Analytics">
              <p>We use cookies and similar tracking technologies to enhance your experience, including:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Essential cookies</li>
                <li>Authentication cookies</li>
                <li>Analytics cookies</li>
                <li>Performance cookies</li>
              </ul>
            </Section>

            <Divider />

            <Section title="6. Third-Party Services">
              <p>We may integrate with third-party services, such as:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Google Sign-In</li>
                <li>Stellar blockchain</li>
                <li>Analytics providers</li>
              </ul>
              <p style={{ marginTop: 12 }}>Please note that these third-party services have their own privacy policies.</p>
            </Section>

            <Divider />

            <Section title="7. Data Sharing">
              <p>DepositSafe does not sell personal information. Information may only be shared when:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Required by law</li>
                <li>Necessary for security</li>
                <li>Required for platform functionality</li>
              </ul>
            </Section>

            <Divider />

            <Section title="8. Data Retention">
              <p>User information is retained only as long as necessary for legal, operational, and security purposes.</p>
            </Section>

            <Divider />

            <Section title="9. Data Security">
              <p>We implement security practices including:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Encryption</li>
                <li>Secure authentication</li>
                <li>Access controls</li>
                <li>Monitoring</li>
                <li>Industry best practices</li>
              </ul>
            </Section>

            <Divider />

            <Section title="10. User Rights">
              <p>Users may request to:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Access their information</li>
                <li>Correct inaccurate information</li>
                <li>Delete eligible personal information</li>
                <li>Contact support regarding privacy concerns</li>
              </ul>
            </Section>

            <Divider />

            <Section title="11. Children's Privacy">
              <p>The platform is not intended for children under the applicable legal age.</p>
            </Section>

            <Divider />

            <Section title="12. International Data Transfers">
              <p>Information may be processed in different jurisdictions depending on infrastructure providers.</p>
            </Section>

            <Divider />

            <Section title="13. Changes to this Privacy Policy">
              <p>Updates to this Privacy Policy may occur periodically. The "Last Updated" date at the top of this policy will reflect any revisions.</p>
            </Section>

            <Divider />

            <Section title="14. Contact Information">
              <p>If you have any questions or concerns about this Privacy Policy, please contact our Legal Contact at:</p>
              <a href="mailto:khushallinkedin11@gmail.com" style={{ color: '#A78BFA', fontWeight: 500, display: 'inline-block', marginTop: 8, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#A78BFA'}>
                legal@depositsafe.com
              </a>
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.35rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>
      {title}
    </h2>
    <div style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.7 }}>
      {children}
    </div>
  </div>
);

const Divider: React.FC = () => (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', width: '100%', marginBottom: 32 }} />
);

export default PrivacyPolicy;
