import React from 'react';
import DocsLayout from '../DocsLayout';

const GettingStarted: React.FC = () => {
  const relatedLinks = [
    { title: "User Guide", href: "/docs/user-guide", description: "Learn how to create and manage your first escrow." },
    { title: "Stellar Integration", href: "/docs/stellar", description: "Understand how we use Stellar for fast payments." }
  ];

  return (
    <DocsLayout 
      title="Getting Started" 
      description="Learn the basics of DepositSafe, how to create an account, and verify your identity."
      relatedLinks={relatedLinks}
    >
      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Overview</h2>
        <p>DepositSafe is a decentralized escrow platform designed specifically for rental security deposits. By utilizing Stellar's fast and low-cost network alongside Soroban smart contracts, we eliminate the need for traditional bank escrows.</p>
        <p style={{ marginTop: 16 }}>Whether you are a student looking to secure a rental or a landlord wanting to ensure funds are available, DepositSafe provides a transparent, immutable, and programmable way to hold funds.</p>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Creating an Account</h2>
        <p>To start using DepositSafe, you need to sign up. We support standard email/password authentication as well as Google OAuth.</p>
        <ol style={{ paddingLeft: 24, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li>Click the <strong>Sign In</strong> button on the top right of the navigation bar.</li>
          <li>Choose whether you are a <strong>Student</strong> or a <strong>Landlord</strong>. This role determines your dashboard experience.</li>
          <li>Complete the registration form or authenticate via Google.</li>
        </ol>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Wallet Connection</h2>
        <p>Because DepositSafe interacts with the Stellar blockchain, you will need a compatible Stellar wallet (like Freighter) to sign transactions.</p>
        <ul style={{ paddingLeft: 24, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li>Install the <strong>Freighter</strong> browser extension.</li>
          <li>Create a new wallet or import an existing one.</li>
          <li>Ensure you are on the <strong>Testnet</strong> if you are exploring the application in demo mode.</li>
        </ul>
      </section>
    </DocsLayout>
  );
};

export default GettingStarted;
