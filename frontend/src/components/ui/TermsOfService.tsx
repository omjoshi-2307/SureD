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

const TermsOfService: React.FC = () => {
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
            Terms of Service
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
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 40, fontFamily: "'Inter', sans-serif" }}>
              These Terms of Service govern the use of DepositSafe and constitute a legally binding agreement between the user and the platform. By accessing or using DepositSafe, you agree to be bound by these terms.
            </p>

            <Section title="1. Acceptance of Terms">
              <p>By accessing and using DepositSafe, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </Section>

            <Divider />

            <Section title="2. Eligibility">
              <p>You must be of legal age in your jurisdiction to use DepositSafe. By using the platform, you represent and warrant that you have the right, authority, and capacity to enter into this agreement.</p>
            </Section>

            <Divider />

            <Section title="3. User Accounts">
              <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.</p>
            </Section>

            <Divider />

            <Section title="4. Platform Overview">
              <p>DepositSafe provides a blockchain-powered escrow platform for rental security deposits. We facilitate secure transactions between tenants and landlords using smart contracts on the Stellar network.</p>
            </Section>

            <Divider />

            <Section title="5. Rental Deposit Escrow">
              <p>Deposits are locked, managed, and released through smart contracts after user confirmation. The platform acts as a technological intermediary and does not hold funds directly; funds are secured on the blockchain until the predefined conditions of the escrow are met.</p>
            </Section>

            <Divider />

            <Section title="6. Blockchain Transactions">
              <p>Blockchain transactions are generally irreversible once confirmed. Please ensure all details are correct before confirming any transaction. Mention that transaction fees (network fees) may apply for processing on the blockchain.</p>
            </Section>

            <Divider />

            <Section title="7. User Responsibilities">
              <p>Users must:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Provide accurate and truthful information at all times.</li>
                <li>Comply with all applicable local, state, and national laws.</li>
                <li>Protect their account credentials and private keys.</li>
                <li>Not misuse the platform or interfere with its normal operation.</li>
              </ul>
            </Section>

            <Divider />

            <Section title="8. Prohibited Activities">
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Fraud or misrepresentation.</li>
                <li>Creating fake rental listings.</li>
                <li>Unauthorized access to other users' accounts or platform systems.</li>
                <li>Hacking or attempting to exploit vulnerabilities in the smart contracts.</li>
                <li>Money laundering or financing illicit activities.</li>
                <li>Spam or any form of unsolicited communications.</li>
                <li>Abuse, harassment, or threats against other users.</li>
                <li>Any other illegal activity.</li>
              </ul>
            </Section>

            <Divider />

            <Section title="9. Fees">
              <p>Applicable platform or blockchain transaction fees may apply and are displayed where relevant before a transaction is executed. You are responsible for all fees associated with your use of the platform.</p>
            </Section>

            <Divider />

            <Section title="10. Intellectual Property">
              <p>The DepositSafe name, branding, logos, website design, and content are protected intellectual property. You may not use, copy, reproduce, or distribute any of our intellectual property without prior written consent.</p>
            </Section>

            <Divider />

            <Section title="11. Disclaimer">
              <p>DepositSafe provides technology infrastructure only and does not act as a landlord, tenant, legal advisor, financial institution, or escrow agent beyond the functionality provided by the platform. We do not guarantee the condition of rental properties or the behavior of users.</p>
            </Section>

            <Divider />

            <Section title="12. Limitation of Liability">
              <p>To the maximum extent permitted by applicable law, DepositSafe and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.</p>
            </Section>

            <Divider />

            <Section title="13. Account Suspension">
              <p>Accounts violating these Terms may be suspended or terminated at our sole discretion, without prior notice or liability, for any reason, including without limitation if you breach the Terms.</p>
            </Section>

            <Divider />

            <Section title="14. Governing Law">
              <p>These Terms are governed by the applicable laws of the jurisdiction in which the platform operates, without regard to its conflict of law provisions. Any legal action or proceeding related to the platform shall be brought exclusively in the competent courts of that jurisdiction.</p>
            </Section>

            <Divider />

            <Section title="15. Changes to Terms">
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of significant changes. Your continued use of the platform after any such changes constitutes your acceptance of the new Terms.</p>
            </Section>

            <Divider />

            <Section title="16. Contact Information">
              <p>If you have any questions about these Terms, please contact us at:</p>
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

export default TermsOfService;
