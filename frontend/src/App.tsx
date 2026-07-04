import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/ui/Hero';
import TrustBanner from '@/components/ui/TrustBanner';
import HowItWorks from '@/components/ui/HowItWorks';
import PlansCarousel from '@/components/ui/PlansCarousel';
import Footer from '@/components/ui/Footer';

/**
 * Suredeposit — single-page responsive website
 * Layout: Navbar → Hero → TrustBanner → HowItWorks → PlansCarousel → Footer
 */
function App() {
  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Hero />
        <TrustBanner />
        <HowItWorks />
        <PlansCarousel />
      </main>
      <Footer />
    </div>
  );
}

export default App;
