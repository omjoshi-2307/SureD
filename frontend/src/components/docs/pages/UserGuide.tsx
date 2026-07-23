import React from 'react';
import DocsLayout from '../DocsLayout';

const UserGuide: React.FC = () => {
  const relatedLinks = [
    { title: "Smart Contract Documentation", href: "/docs/smart-contracts", description: "Learn how the escrow is locked on-chain." },
    { title: "Troubleshooting", href: "/docs/troubleshooting", description: "Having issues? Find solutions here." }
  ];

  return (
    <DocsLayout 
      title="User Guide" 
      description="Step-by-step tutorials on creating escrows, managing deposits, and approving refunds."
      relatedLinks={relatedLinks}
    >
      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>For Students: Creating an Escrow</h2>
        <p>Creating an escrow deposit protects your funds until you and the landlord agree the terms have been met (or the lease concludes).</p>
        <ol style={{ paddingLeft: 24, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li>Navigate to your dashboard and click <strong>Create Escrow</strong>.</li>
          <li>Enter the Landlord's Stellar public key or their registered DepositSafe email.</li>
          <li>Enter the deposit amount in XLM (or supported stablecoins).</li>
          <li>Set the unlock conditions (e.g., duration, or mutual agreement).</li>
          <li>Confirm the transaction via your Freighter wallet. The funds will be deducted and locked in the smart contract.</li>
        </ol>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>For Landlords: Approving and Releasing</h2>
        <p>Landlords can view all incoming and active escrows from their dashboard.</p>
        <ul style={{ paddingLeft: 24, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li><strong>Incoming Escrows:</strong> Review requests sent by students. You can verify the amount and conditions before accepting the agreement.</li>
          <li><strong>Releasing Funds:</strong> At the end of the tenancy, if there are no disputes, navigate to the escrow details page and click <strong>Approve Release</strong>. This will sign a transaction allowing the smart contract to return the funds to the student.</li>
          <li><strong>Claiming Deductions:</strong> If damages occurred, you can initiate a partial claim. The student will be notified and must approve the partial release.</li>
        </ul>
      </section>
    </DocsLayout>
  );
};

export default UserGuide;
