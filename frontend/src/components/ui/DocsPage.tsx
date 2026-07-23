import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Rocket, 
  BookOpen, 
  FileCode2, 
  Network, 
  Terminal, 
  Wrench, 
  Scale, 
  LifeBuoy,
  Search,
  Code,
  Globe,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';

const STARS = [
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

const DOCS_SECTIONS = [
  {
    title: "Getting Started",
    description: "Learn the basics of DepositSafe, how to create an account, and verify your identity.",
    icon: <Rocket size={24} />,
    href: "/docs/getting-started"
  },
  {
    title: "User Guide",
    description: "Step-by-step tutorials on creating escrows, managing deposits, and approving refunds.",
    icon: <BookOpen size={24} />,
    href: "/docs/user-guide"
  },
  {
    title: "Smart Contract Documentation",
    description: "Deep dive into our Stellar-based smart contracts, security models, and audit reports.",
    icon: <FileCode2 size={24} />,
    href: "/docs/smart-contracts"
  },
  {
    title: "Stellar Integration",
    description: "Understand how DepositSafe leverages the Stellar network for fast, low-cost transactions.",
    icon: <Network size={24} />,
    href: "/docs/stellar"
  },
  {
    title: "API Documentation",
    description: "Integrate DepositSafe functionality directly into your own applications using our REST API.",
    icon: <Terminal size={24} />,
    href: "/docs/api"
  },
  {
    title: "Troubleshooting",
    description: "Common issues, error codes, and how to resolve them quickly.",
    icon: <Wrench size={24} />,
    href: "/docs/troubleshooting"
  },
  {
    title: "Legal Documents",
    description: "Read our Terms of Service, Privacy Policy, and Escrow Agreements.",
    icon: <Scale size={24} />,
    href: "/docs/legal"
  },
  {
    title: "Contact & Support",
    description: "Need help? Reach out to our technical support team or join our community.",
    icon: <LifeBuoy size={24} />,
    href: "/docs/support"
  }
];

const TECH_STACK = [
  "React", "TypeScript", "Node.js", "Express", "MongoDB", "Stellar", "Soroban", "Tailwind CSS"
];

const QUICK_LINKS = [
  { label: "Smart Contract on GitHub", icon: <Code size={16} />, href: "https://github.com/Khushal-93/SureD" },
  { label: "Stellar Explorer", icon: <Globe size={16} />, href: "https://stellar.expert" },
  { label: "Whitepaper", icon: <FileText size={16} />, href: "#" },
  { label: "API Reference", icon: <Terminal size={16} />, href: "/docs/api" },
  { label: "Project GitHub", icon: <Code size={16} />, href: "https://github.com/Khushal-93/SureD" }
];

const DocsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredSections = DOCS_SECTIONS.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dl-canvas" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Atmosphere */}
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

      {/* Navigation */}
      <header style={{ position: 'relative', zIndex: 10, padding: '24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            Home
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 24px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: 800, marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: 999, fontSize: '0.85rem', fontWeight: 500, marginBottom: 24, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <ShieldCheck size={16} /> Version 1.0.0
          </div>
          <h1 className="text-hero-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 16 }}>
            Documentation Portal
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
            Explore guides, tutorials, and API references to master DepositSafe and build secure rental escrow workflows.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ width: '100%', maxWidth: 700, marginBottom: 48, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 20, transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search documentation..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 24px 16px 56px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: "'Inter', sans-serif",
              outline: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'border-color 0.2s ease, background 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
          />
        </div>

        {/* Quick Links */}
        <div style={{ width: '100%', maxWidth: 1080, marginBottom: 64, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {QUICK_LINKS.map((link, idx) => (
             <a 
              key={idx}
              href={link.href} 
              target={link.href.startsWith('http') ? '_blank' : '_self'} 
              rel="noopener noreferrer"
              className="btn-glass" 
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}
             >
              {link.icon}
              {link.label}
             </a>
          ))}
        </div>

        {/* Documentation Sections Grid */}
        <div style={{ 
          width: '100%', 
          maxWidth: 1080, 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 24,
          marginBottom: 80 
        }}>
          {filteredSections.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}>
              No documentation found for "{searchQuery}". Please try another search term.
            </div>
          ) : (
            filteredSections.map((section, index) => (
              <Link
                to={section.href}
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 24,
                  padding: 32,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: 'rgba(167,139,250,0.15)',
                  color: '#A78BFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20
                }}>
                  {section.icon}
                </div>
                
                <h3 style={{ 
                  fontFamily: "'Space Grotesk', sans-serif", 
                  fontSize: '1.25rem', 
                  fontWeight: 600, 
                  color: '#fff', 
                  marginBottom: 12 
                }}>
                  {section.title}
                </h3>
                
                <p style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontSize: '0.95rem', 
                  color: 'rgba(255,255,255,0.65)', 
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {section.description}
                </p>
              </Link>
            ))
          )}
        </div>

        {/* Metadata & Tech Stack */}
        <div style={{ width: '100%', maxWidth: 1080, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', marginBottom: 32 }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
             <span>•</span>
             <span>Built on Stellar Soroban</span>
           </div>

           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
             {TECH_STACK.map(tech => (
               <span key={tech} style={{
                 padding: '6px 14px',
                 borderRadius: 8,
                 background: 'rgba(255,255,255,0.03)',
                 border: '1px solid rgba(255,255,255,0.08)',
                 color: 'rgba(255,255,255,0.6)',
                 fontSize: '0.85rem',
                 fontFamily: "'Inter', sans-serif"
               }}>
                 {tech}
               </span>
             ))}
           </div>
        </div>

      </main>
    </div>
  );
};

export default DocsPage;
