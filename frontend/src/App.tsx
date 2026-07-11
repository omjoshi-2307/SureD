import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import WelcomePage from '@/components/ui/WelcomePage';
import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/ui/Hero';
import TrustBanner from '@/components/ui/TrustBanner';
import HowItWorks from '@/components/ui/HowItWorks';
import PlansCarousel from '@/components/ui/PlansCarousel';
import Login from '@/components/ui/Login';
import Register from '@/components/ui/Register';
import Footer from '@/components/ui/Footer';
import StudentDashboard from '@/components/dashboard/student/StudentDashboard';
import LandlordDashboard from '@/components/dashboard/landlord/LandlordDashboard';
import CreateEscrow from '@/components/dashboard/student/CreateEscrow';
import EscrowDetails from '@/components/dashboard/student/EscrowDetails';
import EscrowDetailsPage from '@/components/dashboard/student/EscrowDetailsPage';
import MyDeposits from '@/components/dashboard/student/MyDeposits';
import IncomingEscrows from '@/components/dashboard/landlord/IncomingEscrows';
import LandlordEscrowDetails from '@/components/dashboard/landlord/LandlordEscrowDetails';
import GoogleRoleSelect from '@/components/ui/GoogleRoleSelect';

/**
 * LandingFlow — preserves the existing state-machine welcome → landing → login → register
 * navigation while the rest of the app uses React Router for dashboard routes.
 */
function LandingFlow() {
  const navigate = useNavigate();
  const [view, setView] = useState<'welcome' | 'landing' | 'login' | 'register'>('welcome');

  const go = (v: typeof view) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route to appropriate dashboard based on authenticated role
  const handleLogin = (role: 'student' | 'landlord') => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      navigate(user.role === 'student' ? '/student/dashboard' : '/landlord/dashboard');
    } else {
      navigate(role === 'student' ? '/student/dashboard' : '/landlord/dashboard');
    }
  };

  if (view === 'welcome') {
    return <WelcomePage onEnterLanding={() => go('landing')} />;
  }

  if (view === 'login') {
    return (
      <Login
        onBack={() => go('landing')}
        onRegister={() => go('register')}
        onLogin={handleLogin}
      />
    );
  }

  if (view === 'register') {
    return (
      <Register
        onBack={() => go('landing')}
        onSignIn={() => go('login')}
        onRegister={handleLogin}
      />
    );
  }

  // Landing page
  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <Navbar onSignIn={() => go('login')} />
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

/**
 * App — top-level router.
 * Adding a new protected route is as simple as adding a <Route> here.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingFlow />} />
      <Route path="/auth/google-role-select" element={<GoogleRoleSelect />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/create-escrow" element={<CreateEscrow />} />
      <Route path="/student/escrow-details" element={<EscrowDetails />} />
      <Route path="/student/escrow/:id" element={<EscrowDetailsPage />} />
      <Route path="/student/my-deposits" element={<MyDeposits />} />
      <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
      <Route path="/landlord/incoming-escrows" element={<IncomingEscrows />} />
      <Route path="/landlord/escrow/:id" element={<LandlordEscrowDetails />} />
      {/* Catch-all — redirect unknown paths to root */}
      <Route path="*" element={<LandingFlow />} />
    </Routes>
  );
}

export default App;
