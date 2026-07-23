import React from 'react';
import DocsLayout from '../DocsLayout';

const Troubleshooting: React.FC = () => {
  const relatedLinks = [
    { title: "Contact & Support", href: "/docs/support", description: "Reach out if you can't resolve your issue." }
  ];

  return (
    <DocsLayout 
      title="Troubleshooting" 
      description="Common issues, error codes, and how to resolve them quickly."
      relatedLinks={relatedLinks}
    >
      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Wallet Connection Issues</h2>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>Freighter is not detected</h3>
        <p>If you see a "Wallet not found" error, ensure that the Freighter extension is installed and enabled in your browser. Sometimes, refreshing the page after unlocking the extension helps.</p>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Transaction Failures</h2>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>Insufficient XLM for Fees</h3>
        <p>Even if you are depositing 100 XLM, you need slightly more in your wallet to cover the Stellar network transaction fee. Ensure you have at least 1-2 extra XLM available.</p>
        
        <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '24px 0 8px' }}>Transaction Timeout</h3>
        <p>If the network is congested, your transaction may time out. Check your wallet history on stellar.expert before attempting to send the transaction again.</p>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Authentication Errors</h2>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>Invalid Token</h3>
        <p>If you are abruptly logged out or see an "Invalid Token" error, your session has expired. Please log in again to receive a fresh JWT.</p>
      </section>
    </DocsLayout>
  );
};

export default Troubleshooting;
