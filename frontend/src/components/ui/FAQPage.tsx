import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, ChevronDown, Mail, BookOpen } from 'lucide-react';

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

const FAQ_DATA = [
  {
    category: "General",
    questions: [
      {
        q: "What is DepositSafe?",
        a: "DepositSafe is a blockchain-powered rental security deposit platform that securely holds deposits in escrow until both parties agree on the release."
      },
      {
        q: "Who can use DepositSafe?",
        a: "Students, landlords, property managers, and rental providers can use DepositSafe."
      },
      {
        q: "Why use DepositSafe instead of traditional deposits?",
        a: "Deposits remain transparent, secure, and protected by smart contracts instead of relying on manual trust."
      }
    ]
  },
  {
    category: "Security",
    questions: [
      {
        q: "Is my deposit secure?",
        a: "Yes. Deposits are secured using Stellar smart contracts and remain locked until release conditions are met."
      },
      {
        q: "Can anyone access my funds?",
        a: "No. Funds can only be released according to the agreed escrow conditions."
      },
      {
        q: "Are transactions transparent?",
        a: "Yes. Every blockchain transaction can be verified publicly."
      }
    ]
  },
  {
    category: "Payments & Deposits",
    questions: [
      {
        q: "When is the deposit released?",
        a: "Once both parties approve the release or the predefined contract conditions are satisfied."
      },
      {
        q: "Can I track my deposit?",
        a: "Yes. Every transaction can be viewed on the Stellar blockchain."
      },
      {
        q: "Are there any platform fees?",
        a: "There are currently no platform fees. However, standard low-cost Stellar network transaction fees may apply."
      }
    ]
  },
  {
    category: "Landlords",
    questions: [
      {
        q: "How do landlords confirm deposits?",
        a: "Landlords receive requests inside their dashboard where they can review and approve escrow transactions."
      },
      {
        q: "What happens if there's a dispute?",
        a: "The deposit remains safely locked until the dispute resolution process is completed."
      }
    ]
  },
  {
    category: "Students",
    questions: [
      {
        q: "How do I create a deposit?",
        a: "After signing in, students can create a secure escrow deposit through their dashboard."
      },
      {
        q: "Can I request a refund?",
        a: "Yes, according to the rental agreement and escrow release process."
      }
    ]
  },
  {
    category: "Blockchain & Stellar",
    questions: [
      {
        q: "Why is Stellar used?",
        a: "Stellar provides fast, secure, and low-cost blockchain transactions."
      },
      {
        q: "Are smart contracts open source?",
        a: "Yes, users can review our smart contract source code on our GitHub repository."
      }
    ]
  }
];

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

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

  const filteredData = FAQ_DATA.map(category => {
    const filteredQuestions = category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, questions: filteredQuestions };
  }).filter(category => category.questions.length > 0);

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

      {/* Navigation */}
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

      <main style={{ flex: 1, padding: '40px 24px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: 800, marginBottom: 48 }}>
          <h1 className="text-hero-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 16 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
            Everything you need to know about DepositSafe, blockchain escrow, payments, refunds, and security.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ width: '100%', maxWidth: 700, marginBottom: 64, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 20, transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search frequently asked questions..." 
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

        {/* FAQs */}
        <div style={{ width: '100%', maxWidth: 840 }}>
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}>
              No results found for "{searchQuery}". Please try another search term.
            </div>
          ) : (
            filteredData.map((category, catIndex) => (
              <div key={category.category} style={{ marginBottom: 48 }}>
                <h2 style={{ 
                  fontFamily: "'Space Grotesk', sans-serif", 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: '#fff', 
                  marginBottom: 24,
                  paddingBottom: 12,
                  borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {category.category}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {category.questions.map((q, qIndex) => {
                    const id = `${catIndex}-${qIndex}`;
                    const isOpen = openId === id;
                    return (
                      <div 
                        key={id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 16,
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          borderColor: isOpen ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.06)'
                        }}
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '1.05rem',
                            fontWeight: 500,
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          {q.q}
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}
                          >
                            <ChevronDown size={20} />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                              <div style={{ 
                                padding: '0 24px 24px', 
                                color: 'rgba(255,255,255,0.65)', 
                                fontFamily: "'Inter', sans-serif", 
                                lineHeight: 1.6,
                                fontSize: '0.95rem'
                              }}>
                                {q.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div style={{ 
          marginTop: 80, 
          width: '100%', 
          maxWidth: 700, 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: 24, 
          padding: '48px 32px', 
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: 12 }}>
            Still have questions?
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)', marginBottom: 32 }}>
            Can't find the answer you're looking for? Reach out to our team.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="mailto:support@depositsafe.com" className="btn-glow" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
              <Mail size={18} />
              Contact Support
            </a>
            <Link to="/docs" className="btn-glass" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
              <BookOpen size={18} />
              View Documentation
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
};

export default FAQPage;
