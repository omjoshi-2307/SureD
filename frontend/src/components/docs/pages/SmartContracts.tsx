import React from 'react';
import DocsLayout from '../DocsLayout';

const SmartContracts: React.FC = () => {
  const relatedLinks = [
    { title: "Stellar Integration", href: "/docs/stellar", description: "Read about the Stellar network." },
    { title: "API Reference", href: "/docs/api", description: "View backend API endpoints." }
  ];

  return (
    <DocsLayout 
      title="Smart Contract Documentation" 
      description="Deep dive into our Stellar-based smart contracts, security models, and audit reports."
      relatedLinks={relatedLinks}
    >
      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Soroban Architecture</h2>
        <p>Our smart contracts are written in Rust and deployed on Soroban, Stellar's native smart contract platform. Soroban provides a fast, secure, and developer-friendly environment optimized for financial applications.</p>
        <p style={{ marginTop: 16 }}>The primary contract is the <code>EscrowContract</code>, which handles the locking, state management, and releasing of XLM tokens.</p>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Contract State Machine</h2>
        <p>An escrow agreement goes through several states during its lifecycle:</p>
        <ul style={{ paddingLeft: 24, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li><code>INITIALIZED</code>: The student has created the escrow, but funds have not been deposited yet.</li>
          <li><code>FUNDED</code>: The student has successfully transferred funds to the contract address.</li>
          <li><code>ACTIVE</code>: The landlord has accepted the terms. The escrow is now locked.</li>
          <li><code>RELEASED</code>: Mutual agreement was reached, and funds were disbursed.</li>
          <li><code>DISPUTED</code>: A disagreement occurred, halting the standard release flow until arbitration is resolved.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Security Model</h2>
        <p>DepositSafe ensures that neither the platform nor the landlord has unilateral access to the funds.</p>
        <ul style={{ paddingLeft: 24, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li><strong>Non-Custodial:</strong> DepositSafe backend never holds your private keys.</li>
          <li><strong>Multi-Signature Validation:</strong> Releasing funds requires authorization signatures from both the student and the landlord endpoints.</li>
        </ul>
      </section>
    </DocsLayout>
  );
};

export default SmartContracts;
