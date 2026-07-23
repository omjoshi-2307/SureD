import React from 'react';
import DocsLayout from '../DocsLayout';

const StellarIntegration: React.FC = () => {
  const relatedLinks = [
    { title: "Smart Contract Documentation", href: "/docs/smart-contracts", description: "Read about our Soroban contracts." },
    { title: "Getting Started", href: "/docs/getting-started", description: "Learn how to connect your wallet." }
  ];

  return (
    <DocsLayout 
      title="Stellar Integration" 
      description="Understand how DepositSafe leverages the Stellar network for fast, low-cost transactions."
      relatedLinks={relatedLinks}
    >
      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Why Stellar?</h2>
        <p>DepositSafe is built on the Stellar network to ensure that security deposits can be held globally, securely, and with near-zero transaction fees.</p>
        <p style={{ marginTop: 16 }}>Stellar's consensus protocol allows for transaction finality in seconds, meaning escrows are funded and released almost instantly compared to traditional banking ACH transfers which can take days.</p>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Supported Assets</h2>
        <p>Currently, the platform operates using <strong>XLM (Stellar Lumens)</strong> for both transaction fees and the underlying escrow deposits on the Testnet.</p>
        <p style={{ marginTop: 16 }}>For the mainnet launch, we plan to integrate USDC via the Stellar network, allowing users to hold deposits in a stable, fiat-pegged currency to avoid crypto volatility.</p>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Transaction Signing</h2>
        <p>The DepositSafe frontend utilizes the <code>@stellar/freighter-api</code> to prompt users for transaction signatures. We construct the XDR transaction envelopes on the client side, ensuring your private key never leaves your device.</p>
      </section>
    </DocsLayout>
  );
};

export default StellarIntegration;
