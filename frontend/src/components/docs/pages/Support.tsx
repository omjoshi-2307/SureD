import React from 'react';
import DocsLayout from '../DocsLayout';

const Support: React.FC = () => {
  const relatedLinks = [
    { title: "Troubleshooting", href: "/docs/troubleshooting", description: "See if your issue has a known fix." },
    { title: "FAQs", href: "/faq", description: "Read frequently asked questions." }
  ];

  return (
    <DocsLayout 
      title="Contact & Support" 
      description="Need help? Reach out to our technical support team or join our community."
      relatedLinks={relatedLinks}
    >
      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Get in Touch</h2>
        <p>If you have any questions, encounter bugs, or need assistance with an ongoing escrow, our support team is here to help.</p>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: 24, borderRadius: 16, marginTop: 24 }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>Email Support</h3>
          <p style={{ marginBottom: 16 }}>Average response time: 24 hours.</p>
          <a href="mailto:support@depositsafe.com" style={{ color: '#A78BFA', textDecoration: 'underline', fontWeight: 500 }}>support@depositsafe.com</a>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 16 }}>Community</h2>
        <p>Join our developer community to discuss Stellar integration, suggest features, or contribute to the DepositSafe open-source repository.</p>
        <ul style={{ paddingLeft: 24, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li><a href="https://github.com/Khushal-93/SureD" style={{ color: '#A78BFA', textDecoration: 'underline' }}>GitHub Repository</a></li>
          <li><a href="#" style={{ color: '#A78BFA', textDecoration: 'underline' }}>Discord Server (Coming Soon)</a></li>
        </ul>
      </section>
    </DocsLayout>
  );
};

export default Support;
