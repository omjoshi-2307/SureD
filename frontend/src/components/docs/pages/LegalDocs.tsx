import React from 'react';
import DocsLayout from '../DocsLayout';

const LegalDocs: React.FC = () => {
  const relatedLinks = [
    { title: "User Guide", href: "/docs/user-guide", description: "Understand how the escrow process works." }
  ];

  return (
    <DocsLayout 
      title="Legal Documents" 
      description="Read our Terms of Service, Privacy Policy, and Escrow Agreements."
      relatedLinks={relatedLinks}
    >
      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Terms of Service</h2>
        <p>Our Terms of Service outline the rules and guidelines for using the DepositSafe platform. By creating an account, you agree to these terms.</p>
        <p style={{ marginTop: 16 }}><a href="/terms" style={{ color: '#A78BFA', textDecoration: 'underline' }}>View Full Terms of Service</a></p>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Privacy Policy</h2>
        <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information.</p>
        <p style={{ marginTop: 16 }}><a href="/privacy" style={{ color: '#A78BFA', textDecoration: 'underline' }}>View Full Privacy Policy</a></p>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Smart Contract Disclaimer</h2>
        <p>While our Soroban smart contracts undergo auditing, the use of blockchain technology carries inherent risks. DepositSafe provides the software infrastructure but does not act as a legal mediator in disputes beyond the provided smart contract mechanisms.</p>
      </section>
    </DocsLayout>
  );
};

export default LegalDocs;
