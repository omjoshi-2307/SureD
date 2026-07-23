import React from 'react';
import DocsLayout from '../DocsLayout';

const ApiReference: React.FC = () => {
  const relatedLinks = [
    { title: "Troubleshooting", href: "/docs/troubleshooting", description: "Fix common API errors." }
  ];

  return (
    <DocsLayout 
      title="API Reference" 
      description="Integrate DepositSafe functionality directly into your own applications using our REST API."
      relatedLinks={relatedLinks}
    >
      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Authentication</h2>
        <p>All private API endpoints require a JWT token passed in the Authorization header as a Bearer token.</p>
        <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 8, marginTop: 16, color: '#A78BFA', overflowX: 'auto' }}>
          <code>Authorization: Bearer {'<your_jwt_token>'}</code>
        </pre>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Core Endpoints</h2>
        
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}><span style={{ color: '#10B981', marginRight: 8 }}>GET</span> /api/escrows</h3>
          <p>Retrieves a list of all escrows associated with the authenticated user.</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}><span style={{ color: '#3B82F6', marginRight: 8 }}>POST</span> /api/escrows</h3>
          <p>Creates a new escrow agreement in the database. Requires landlord email, amount, and property details in the request body.</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}><span style={{ color: '#F59E0B', marginRight: 8 }}>PUT</span> /api/escrows/:id</h3>
          <p>Updates the status of an escrow (e.g., from INITIALIZED to FUNDED once the blockchain transaction is verified).</p>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Rate Limiting</h2>
        <p>To ensure platform stability, the API is rate-limited to 100 requests per minute per IP address.</p>
      </section>
    </DocsLayout>
  );
};

export default ApiReference;
