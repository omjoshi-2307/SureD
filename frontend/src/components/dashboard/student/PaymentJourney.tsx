import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, AlertCircle, ArrowRight, Clock, CreditCard, ArrowLeft, 
  Building2, FileText, ShieldCheck, HelpCircle, RefreshCw, Download, 
  LayoutDashboard, Coins, Lock, Unlock, Send, CheckCircle2, ChevronRight, Loader2, Shield, BadgeCheck, Globe, Network
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { STUDENT_NAV_ITEMS as NAV_ITEMS } from '@/components/dashboard/navItems';
import { getEscrowDb, fundEscrowDb, releaseEscrowDb } from '@/services/escrowService';
import { depositEscrow, releaseEscrow } from '@/services/sorobanService';

export default function PaymentJourney() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateData = location.state as { 
    depositAmount?: number; 
    propertyName?: string; 
    propertyAddress?: string; 
  } | null;

  // Active Screen ID (1 to 7)
  const [activeScreen, setActiveScreen] = useState<number>(1);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(true);

  // Escrow details
  const [escrowId, setEscrowId] = useState<string>(id || 'ESC-25');
  const [amountInr, setAmountInr] = useState<number>(stateData?.depositAmount || 20000);
  const [propertyName, setPropertyName] = useState<string>(stateData?.propertyName || 'Campus View Residence');
  const [propertyAddress, setPropertyAddress] = useState<string>(stateData?.propertyAddress || '5 University Road, Leeds');
  
  const exchangeRate = 86.40;
  const amountUsdc = (amountInr / exchangeRate).toFixed(2);
  const [loadedEscrow, setLoadedEscrow] = useState<any>(null);

  // Load live escrow details
  useEffect(() => {
    if (id) {
      setIsSandboxMode(false);
      getEscrowDb(id)
        .then((res: any) => {
          const esc = res.escrow || res;
          if (esc) {
            setLoadedEscrow(esc);
            if (esc.status === 'FUNDED' || esc.status === 'PENDING_CONFIRMATION') {
              setActiveScreen(5);
            } else if (esc.status === 'RELEASED') {
              setActiveScreen(7);
            } else {
              setActiveScreen(1);
            }
            if (esc.depositAmount) {
              setAmountInr(esc.depositAmount > 100 ? esc.depositAmount : esc.depositAmount * 80);
            }
            if (esc.propertyName) setPropertyName(esc.propertyName);
            if (esc.propertyAddress) setPropertyAddress(esc.propertyAddress);
            setEscrowId(esc.escrowId !== undefined ? `ESC-${String(esc.escrowId)}` : id);
          }
        })
        .catch((err) => {
          console.error("Failed to load live escrow details:", err);
        });
    }
  }, [id]);

  /* ────────────────────────────────────────────────────────
     SCREEN 2: Payment Processing Timeline Animation State
     ──────────────────────────────────────────────────────── */
  const [procStep, setProcStep] = useState<number>(0);
  const procTimeline = [
    { title: 'Payment Received', subtitle: 'INR Transfer confirmed via partner bank gateway' },
    { title: 'Verifying Payment', subtitle: 'Verifying lease agreement & tenant security terms' },
    { title: 'Converting INR', subtitle: 'Converting local currency to Secure USD equivalent' },
    { title: 'Secure Settlement', subtitle: 'Allocating collateral reserves with provider' },
    { title: 'Creating Blockchain Escrow', subtitle: 'Securing funds in digital escrow vault' },
    { title: 'Escrow Successfully Created', subtitle: 'Platform confirmation complete. Funds protected' },
  ];

  const startPaymentSequence = async () => {
    setActiveScreen(2);
    setProcStep(0);

    if (id && !isSandboxMode) {
      try {
        // Step 0: Payment Received
        await new Promise(r => setTimeout(r, 1200));
        setProcStep(1); // Verifying details
        
        // Step 1: Verifying Details
        await new Promise(r => setTimeout(r, 1200));
        setProcStep(2); // Converting INR
        
        // Step 2: Converting INR
        await new Promise(r => setTimeout(r, 1500));
        setProcStep(3); // Preparing secure settlement

        // Step 3: Secure Settlement
        await new Promise(r => setTimeout(r, 1200));
        setProcStep(4); // Creating blockchain escrow

        const targetNumericId = loadedEscrow?.escrowId !== undefined ? Number(loadedEscrow.escrowId) : (!isNaN(Number(id)) ? Number(id) : null);
        const targetDbId = loadedEscrow?._id || id;

        if (targetNumericId === null || isNaN(targetNumericId)) {
          throw new Error("Blockchain Escrow ID not found.");
        }

        // Step 4: Creating Blockchain Escrow (Deposit)
        const result = await depositEscrow(targetNumericId);

        // Step 5: Save database state & success
        await fundEscrowDb(targetDbId, { txHash: result.txHash });
        setProcStep(5);
        await new Promise(r => setTimeout(r, 1200));
        
        // Go to Success Screen
        setActiveScreen(3);
      } catch (err) {
        console.error("Live transaction failed:", err);
        setActiveScreen(4);
      }
    } else {
      // Simulated sequence
      const runTimeline = (step: number) => {
        if (step <= 5) {
          setProcStep(step);
          const delays = [1200, 1400, 1800, 1400, 1600, 1500];
          setTimeout(() => runTimeline(step + 1), delays[step] || 1500);
        } else {
          setActiveScreen(3);
        }
      };
      setTimeout(() => runTimeline(0), 400);
    }
  };

  // SUCCESS REDIRECT LOGIC: Screen 3 displays for 1 second and then auto redirects
  useEffect(() => {
    if (activeScreen === 3) {
      const timer = setTimeout(() => {
        if (id && !isSandboxMode) {
          // Fade-out navigate
          navigate(`/student/escrow/${id}`);
        } else {
          setActiveScreen(5); // In sandbox mode, redirect back to Escrow Details view (Screen 5)
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [activeScreen, id, isSandboxMode, navigate]);

  /* ────────────────────────────────────────────────────────
     SCREEN 6: Release Processing Timeline Animation State
     ──────────────────────────────────────────────────────── */
  const [relStep, setRelStep] = useState<number>(0);
  const releaseTimeline = [
    { title: 'Landlord Approved', subtitle: 'Signature authorization verified successfully' },
    { title: 'Releasing Funds', subtitle: 'Unlocking digital escrow reserves' },
    { title: 'Converting Secure USD to INR', subtitle: 'Exchanging settlement reserves back to local currency' },
    { title: 'Settlement Complete', subtitle: 'Authorized transfer from MoneyGram settlement accounts' },
    { title: 'Money Sent', subtitle: 'Instant bank transfer dispatched to tenant account' },
  ];

  const startReleaseSequence = async () => {
    setActiveScreen(6);
    setRelStep(0);

    if (id && !isSandboxMode) {
      try {
        await new Promise(r => setTimeout(r, 1200));
        setRelStep(1); // Releasing funds

        // Blockchain call
        const result = await releaseEscrow(Number(id));
        setRelStep(2); // Converting USDC to INR

        // Database release
        await releaseEscrowDb(Number(id), { txHash: result.txHash });
        setRelStep(3); // Settlement complete

        await new Promise(r => setTimeout(r, 1200));
        setRelStep(4); // Money sent
        
        await new Promise(r => setTimeout(r, 1200));
        setActiveScreen(7);
      } catch (err) {
        console.error("Live release failed:", err);
        setActiveScreen(4);
      }
    } else {
      const runTimeline = (step: number) => {
        if (step <= 4) {
          setRelStep(step);
          setTimeout(() => runTimeline(step + 1), 1400);
        } else {
          setActiveScreen(7);
        }
      };
      setTimeout(() => runTimeline(0), 400);
    }
  };

  const handleDownloadReceipt = () => {
    const content = `SureDeposit Payment Receipt\n\nReference: MGSIM-001248\nEscrow ID: ${escrowId}\nProperty: ${propertyName}\nAmount Paid: INR ${amountInr.toLocaleString()}\nUSD Equivalent: ${amountUsdc} USD\nSettlement: MoneyGram Simulation\nStatus: Securely Protected\nDate: ${new Date().toLocaleDateString()}\n\nThank you for using SureDeposit. Keep your funds secure.`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SureDeposit_Receipt_${escrowId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Card transition animations
  const pageVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.99 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      scale: 0.99,
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  // Progress Bar Helper
  const getProgressState = () => {
    if (activeScreen === 1) return { step: 1, label: 'Review' };
    if (activeScreen === 2 || activeScreen === 4 || activeScreen === 6) return { step: 2, label: 'Processing' };
    if (activeScreen === 3 || activeScreen === 7) return { step: 3, label: 'Success' };
    return { step: 4, label: 'Escrow Protected' };
  };
  
  const currentProgress = getProgressState();

  return (
    <DashboardLayout 
      role="student" 
      userName="Tenant" 
      navItems={NAV_ITEMS} 
      activeId="deposits"
      onNavChange={(id) => {
        if (id === 'dashboard') navigate('/student/dashboard');
        if (id === 'deposits') navigate('/student/my-deposits');
        if (id === 'escrow') navigate('/student/create-escrow');
        if (id === 'history') navigate('/student/transactions');
        if (id === 'profile') navigate('/student/profile');
        if (id === 'settings') navigate('/student/settings');
      }}
      dark
    >
      <div className="min-h-screen text-slate-100 flex flex-col items-center py-10 px-4 md:px-8 bg-[#0B1020] relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* ─── GORGEOUS RADIAL GRADIENTS & GLOWING BLUR CIRCLES ─── */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[40%] left-[60%] w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none"></div>

        {/* ─── PREMIUM HORIZONTAL PROGRESS TRACKER ─── */}
        <div className="w-full max-w-[900px] mb-8 px-6 py-4 rounded-2xl border border-white/5 bg-[#111827]/40 backdrop-blur-xl flex items-center justify-between shadow-lg shadow-black/10">
          {[
            { step: 1, label: 'Review' },
            { step: 2, label: 'Processing' },
            { step: 3, label: 'Success' },
            { step: 4, label: 'Escrow Active' },
          ].map((item, idx, arr) => {
            const isCompleted = currentProgress.step > item.step;
            const isActive = currentProgress.step === item.step;
            
            return (
              <React.Fragment key={item.step}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : isActive 
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-2 ring-blue-500/20' 
                        : 'bg-slate-800 text-slate-500 border border-white/5'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : item.step}
                  </div>
                  <span className={`text-xs font-bold hidden sm:inline transition-all duration-300 ${
                    isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}>{item.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex-1 mx-4 h-[2px] bg-slate-800 relative rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ─── MAIN STAGE CONTAINER ─── */}
        <div className="w-full max-w-[900px] flex items-center justify-center min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* SCREEN 1: PAYMENT REVIEW */}
            {activeScreen === 1 && (
              <motion.div 
                key="review"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full rounded-[24px] border border-white/8 bg-[#111827]/70 backdrop-blur-3xl shadow-2xl shadow-black/60 overflow-hidden grid grid-cols-1 md:grid-cols-2"
              >
                {/* LEFT SIDE: PRODUCT DETAILS */}
                <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between gap-8 bg-slate-900/10">
                  <div>
                    <button 
                      onClick={() => navigate('/student/dashboard')}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider mb-8 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to listings
                    </button>
                    
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1.5">SureDeposit Checkout</span>
                    <h3 className="text-xl font-black text-white tracking-tight mb-4">Secure Digital Deposit</h3>
                    
                    {/* Very Large Amount Standout */}
                    <div className="my-6">
                      <h1 className="text-6xl font-black tracking-tight text-white">₹20,000</h1>
                      <p className="text-xs font-bold text-slate-400 mt-2">
                        Settlement Value: <strong className="text-blue-400">{amountUsdc} USD</strong>
                      </p>
                    </div>
                  </div>

                  {/* Redesigned Premium Property Card */}
                  <div className="p-4.5 rounded-[20px] bg-slate-900/50 border border-white/5 flex flex-col gap-3.5 shadow-inner">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-slate-300 shadow-md">
                        <Building2 className="w-6 h-6 text-slate-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 tracking-tight">{propertyName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{propertyAddress}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1.5 border-t border-white/5">
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-blue-400" /> Verified Property
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Protected by SureDeposit
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: SUMMARY & CHECKOUT */}
                <div className="p-8 md:p-10 flex flex-col justify-between gap-8">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Method</span>
                      {/* Branded Badge with animation */}
                      <motion.div 
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        MoneyGram Simulation
                      </motion.div>
                    </div>

                    {/* Premium Summary Info Cards */}
                    <div className="space-y-3">
                      {[
                        { label: 'Rental Deposit', val: '₹20,000', sub: 'Primary local currency', icon: <Coins className="w-4 h-4 text-slate-400" /> },
                        { label: 'Exchange Rate', val: '1 USD = ₹86.40', sub: 'Guaranteed simulation rate', icon: <Globe className="w-4 h-4 text-slate-400" /> },
                        { label: 'Equivalent', val: '231.48 USD', sub: 'Digital secure value', icon: <Lock className="w-4 h-4 text-blue-400" />, highlight: true },
                        { label: 'Settlement', val: 'Secure Network', sub: 'MoneyGram simulated gateway', icon: <Network className="w-4 h-4 text-slate-400" /> },
                        { label: 'Estimated Time', val: '5 seconds', sub: 'Instant ledger processing', icon: <Clock className="w-4 h-4 text-slate-400" /> },
                      ].map((card, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3.5 rounded-[16px] border flex items-center justify-between gap-4 transition-all duration-300 ${
                            card.highlight 
                              ? 'bg-blue-600/5 border-blue-500/20' 
                              : 'bg-slate-900/40 border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-white/5 flex items-center justify-center shadow-inner">
                              {card.icon}
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block leading-none">{card.label}</span>
                              <span className="text-[9px] text-slate-400 mt-1 block">{card.sub}</span>
                            </div>
                          </div>
                          <span className={`text-xs font-bold ${card.highlight ? 'text-blue-400' : 'text-slate-200'}`}>{card.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={startPaymentSequence}
                    className="w-full h-[56px] rounded-[22px] text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.4)] border border-blue-400/20 cursor-pointer group relative overflow-hidden"
                  >
                    {/* Glow and Shimmer */}
                    <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                    <CreditCard className="w-4.5 h-4.5 text-white/95" />
                    Continue Secure Payment
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 2: PAYMENT PROCESSING */}
            {activeScreen === 2 && (
              <motion.div 
                key="processing"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-[550px] rounded-[24px] border border-white/8 shadow-2xl bg-[#111827]/70 backdrop-blur-3xl p-8 md:p-10 shadow-black/60"
              >
                <div className="flex flex-col items-center text-center mb-8">
                  {/* Processing animation */}
                  <div className="w-24 h-24 mb-4 flex items-center justify-center relative bg-slate-900/60 rounded-3xl border border-white/5 shadow-inner">
                    <div className="absolute inset-2 rounded-full border-2 border-slate-800"></div>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                      className="absolute inset-2 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
                    />
                    
                    {/* Animated Step-Specific States */}
                    <AnimatePresence mode="wait">
                      {procStep === 0 && (
                        <motion.div key="s0" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                          <Coins className="w-7 h-7 text-blue-500 animate-pulse" />
                        </motion.div>
                      )}
                      {procStep === 1 && (
                        <motion.div key="s1" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                          <FileText className="w-7 h-7 text-blue-400" />
                        </motion.div>
                      )}
                      {procStep === 2 && (
                        <motion.div key="s2" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 font-bold leading-none mb-1">INR</span>
                          <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-500 rotate-90" />
                          </motion.div>
                          <span className="text-[9px] text-blue-400 font-bold leading-none mt-1">USDC</span>
                        </motion.div>
                      )}
                      {procStep === 3 && (
                        <motion.div key="s3" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                          <Shield className="w-7 h-7 text-emerald-400 animate-pulse" />
                        </motion.div>
                      )}
                      {procStep === 4 && (
                        <motion.div key="s4" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex items-center justify-center">
                          <Lock className="w-7 h-7 text-indigo-400" />
                        </motion.div>
                      )}
                      {procStep === 5 && (
                        <motion.div key="s5" initial={{ scale: 0.8 }} animate={{ scale: 1.1 }} className="text-emerald-500">
                          <Check className="w-8 h-8" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 tracking-tight">Securing Your Deposit</h3>
                  <p className="text-xs text-slate-400 mt-1">Securing currency settlement contracts in progress...</p>
                </div>

                {/* Progress bar with soft glow */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-8 relative shadow-inner">
                  <motion.div 
                    className="bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    animate={{ width: `${((procStep + 1) / procTimeline.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>

                {/* Timed Stepper - PROGRESSIVE REVEAL */}
                <div className="space-y-4">
                  {procTimeline.map((step, idx) => {
                    const isDone = idx < procStep;
                    const isCurrent = idx === procStep;
                    const isHidden = idx > procStep;

                    // Do not render ahead steps to create a clean progressive build animation
                    if (isHidden) return null;

                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex gap-4 p-3 rounded-xl border border-white/5 bg-slate-900/30"
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                            isDone 
                              ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                              : 'bg-blue-600 text-white ring-4 ring-blue-500/10'
                          }`}>
                            {isDone ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h4 className={`text-xs font-bold tracking-tight transition-all duration-300 ${
                            isCurrent ? 'text-blue-400' : 'text-slate-300'
                          }`}>
                            {step.title}
                          </h4>
                          
                          {/* Inner conversions/specific graphics */}
                          {isCurrent && idx === 2 && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="mt-2.5 flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-white/5 w-fit"
                            >
                              <span className="text-xs text-slate-300 font-bold">₹20,000</span>
                              <ArrowRight className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-blue-400 font-bold">231.48 USD</span>
                            </motion.div>
                          )}

                          {isCurrent && idx === 3 && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1"
                            >
                              <Shield className="w-3.5 h-3.5 text-emerald-400" /> MoneyGram Simulated node collateral allocated.
                            </motion.div>
                          )}

                          {!isCurrent && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{step.subtitle}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: SUCCESS SCREEN (1-SECOND KEYNOTE SHIELD ANIMATION) */}
            {activeScreen === 3 && (
              <motion.div 
                key="success"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-[500px] rounded-[24px] border border-white/8 bg-[#111827]/85 backdrop-blur-3xl p-8 md:p-10 text-center shadow-2xl shadow-black/80 relative overflow-hidden"
              >
                <div className="absolute top-[-20%] left-[-20%] w-[140px] h-[140px] bg-emerald-500/10 rounded-full blur-[70px] pointer-events-none"></div>

                {/* Animated Shield Logo & Checkmark Burst */}
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 text-emerald-500/10 fill-emerald-500/5 animate-pulse"
                  >
                    <Shield className="w-full h-full" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1.1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
                    className="text-emerald-400 filter drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  >
                    <ShieldCheck className="w-16 h-16" />
                  </motion.div>

                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 2, 0], opacity: [1, 0.5, 0] }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                    className="absolute w-20 h-20 rounded-full border-2 border-emerald-400/50 pointer-events-none"
                  />
                </div>

                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">✔ Deposit Protected</span>
                <h2 className="text-2xl font-black text-white tracking-tight mb-6">₹20,000 Successfully Secured</h2>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 max-w-sm mx-auto space-y-3 text-xs text-slate-300 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Settlement status</span>
                    <span className="font-semibold text-emerald-400">Complete</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Reference</span>
                    <span className="font-mono text-slate-200">MGSIM-001248</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Escrow ID</span>
                    <span className="font-mono font-bold text-blue-400">{escrowId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Security Protocol</span>
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <Network className="w-3.5 h-3.5 text-blue-500" />
                      Blockchain Confirmed
                    </span>
                  </div>
                </div>

                {/* Auto Nav indicator */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  Finalizing escrow details page redirection...
                </div>
              </motion.div>
            )}

            {/* SCREEN 4: PAYMENT FAILED */}
            {activeScreen === 4 && (
              <motion.div 
                key="failed"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-[500px] rounded-[24px] border border-white/8 shadow-2xl bg-[#111827]/70 backdrop-blur-xl p-8 md:p-10 shadow-black/80"
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 tracking-tight">Payment Failed</h3>
                  <p className="text-xs text-slate-400 mt-1">We couldn't finalize your security deposit transaction</p>
                </div>

                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 mb-8">
                  <h4 className="text-xs font-bold text-red-400 mb-3 uppercase tracking-wider">Potential Causes:</h4>
                  <ul className="space-y-2.5 text-xs text-slate-400 list-disc pl-4 font-semibold">
                    <li>The payment request signature was rejected in the wallet extension.</li>
                    <li>Insufficient balance in the connected payment accounts.</li>
                    <li>Temporary timeout or network disruption with the settlement provider.</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setActiveScreen(1)}
                    className="w-full h-12 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-blue-400/20 shadow-lg shadow-blue-500/10"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Payment Review
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/student/dashboard')}
                      className="py-3 px-4 rounded-xl text-slate-400 font-semibold text-xs bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all duration-300 border border-white/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => window.open('#', '_blank')}
                      className="py-3 px-4 rounded-xl text-slate-400 font-semibold text-xs bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all duration-300 border border-white/5 cursor-pointer"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 5: ESCROW DETAILS */}
            {activeScreen === 5 && (
              <motion.div 
                key="escrow-details"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full rounded-[24px] border border-white/8 shadow-2xl bg-[#111827]/70 backdrop-blur-3xl p-8 md:p-10 shadow-black/80"
              >
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-0.5">Asset Protection Summary</span>
                    <h3 className="text-xl font-black text-white tracking-tight">Protected Deposit Escrow</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Deposit Protected
                  </span>
                </div>

                {/* Property Card */}
                <div className="p-4.5 rounded-2xl bg-slate-900/50 border border-white/5 mb-6 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-white/5">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 tracking-tight">{propertyName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{propertyAddress}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-800 px-2 py-0.5 rounded border border-white/5">{escrowId}</span>
                </div>

                {/* Info Table */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5">
                    <span className="text-[9px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wider">Deposit Amount</span>
                    <span className="text-sm font-bold text-slate-200">₹{amountInr.toLocaleString()}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5">
                    <span className="text-[9px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wider">Collateral Value</span>
                    <span className="text-sm font-bold text-blue-400">{amountUsdc} USD</span>
                  </div>
                </div>

                {/* Vertical Protection Timeline */}
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Protection Timeline</h4>
                
                <div className="space-y-6 mb-8">
                  {[
                    { title: 'Deposit Paid', desc: 'Secure local payment gateway transfer verified.', active: true },
                    { title: 'Escrow Active', desc: 'Authorized settlement assets generated & locked in vault.', active: true },
                    { title: 'Waiting for Landlord', desc: 'Pending check-in confirmation by landlord.', active: true, current: true },
                    { title: 'Awaiting Confirmation', desc: 'Final joint check-in verification pending.', active: false },
                    { title: 'Deposit Protected', desc: 'Escrow holds funds under tenant terms.', active: false },
                  ].map((s, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          s.active 
                            ? s.current 
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 animate-pulse'
                              : 'bg-emerald-500 text-white' 
                            : 'bg-slate-800 text-slate-400 border border-white/5'
                        }`}>
                          {s.active && !s.current ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        {idx < 4 && (
                          <div className={`w-0.5 h-10 my-1 ${
                            s.active && idx < 2 ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}></div>
                        )}
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold ${
                          s.current ? 'text-blue-400' : s.active ? 'text-slate-200' : 'text-slate-500'
                        }`}>
                          {s.title}
                        </h5>
                        <p className="text-[10px] text-slate-400/80 mt-0.5 font-semibold">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startReleaseSequence}
                  className="w-full h-12 rounded-xl text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/20 shadow-lg shadow-emerald-600/10"
                >
                  <Unlock className="w-4 h-4" />
                  Simulate Landlord Release Flow
                </button>
              </motion.div>
            )}

            {/* SCREEN 6: RELEASE PROCESSING */}
            {activeScreen === 6 && (
              <motion.div 
                key="releasing"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-[550px] rounded-[24px] border border-white/8 shadow-2xl bg-[#111827]/70 backdrop-blur-xl p-8 md:p-10 shadow-black/80"
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="relative w-20 h-20 mb-4 flex items-center justify-center bg-slate-900/60 rounded-3xl border border-white/5">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <Unlock className="w-6 h-6 text-emerald-500 animate-bounce" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 tracking-tight">Disbursing Security Deposit</h3>
                  <p className="text-xs text-slate-400 mt-1">Refunding INR settlement to your registered bank account</p>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-8">
                  <motion.div 
                    className="bg-emerald-500 h-full rounded-full"
                    animate={{ width: `${((relStep + 1) / releaseTimeline.length) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                <div className="space-y-6">
                  {releaseTimeline.map((step, idx) => {
                    const isDone = idx < relStep;
                    const isCurrent = idx === relStep;
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-4 transition-all duration-500 ${
                          isDone || isCurrent ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                            isDone 
                              ? 'bg-emerald-500 text-white' 
                              : isCurrent 
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' 
                                : 'bg-slate-800 text-slate-400 border border-white/5'
                          }`}>
                            {isDone ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : isCurrent ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          {idx < releaseTimeline.length - 1 && (
                            <div className={`w-0.5 h-8 my-1 transition-all duration-500 ${
                              isDone ? 'bg-emerald-500/50' : 'bg-slate-800'
                            }`}></div>
                          )}
                        </div>
                        
                        <div className="pb-2">
                          <h4 className={`text-xs font-bold transition-all duration-300 ${
                            isCurrent ? 'text-emerald-400' : isDone ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            {step.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{step.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SCREEN 7: RELEASE SUCCESSFUL */}
            {activeScreen === 7 && (
              <motion.div 
                key="release-success"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-[500px] rounded-[24px] border border-white/8 shadow-2xl bg-[#111827]/70 backdrop-blur-3xl p-8 md:p-10 relative overflow-hidden shadow-black/80"
              >
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-4 shadow-lg shadow-blue-500/5">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-100">₹{amountInr.toLocaleString()}</h3>
                  <h4 className="text-sm font-semibold text-emerald-400 mt-1">Successfully Returned</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Vault settled. Funds returned to your source bank account.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-3.5 mb-8">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Settlement Status</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Authorized Complete
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Estimated Bank Arrival</span>
                    <span className="font-bold text-slate-200">Instant</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Reference Number</span>
                    <span className="font-mono text-slate-300">MGSIM-RELEASE-9876</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDownloadReceipt}
                    className="w-full py-3.5 px-6 rounded-2xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 border border-blue-400/20 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <FileText className="w-4 h-4" />
                    View Release Receipt
                  </button>
                  
                  <button
                    onClick={() => navigate('/student/dashboard')}
                    className="w-full py-3.5 px-6 rounded-2xl text-slate-300 font-bold text-xs bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 border border-white/5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Go to Dashboard
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ─── MINI PRESENTATION SANDBOX TOGGLE CONTROLS (BOTTOM) ─── */}
        <div className="mt-8 text-[11px] text-slate-500 flex items-center gap-1.5 select-none bg-slate-900/30 px-3 py-1.5 rounded-full border border-white/5">
          <span>Simulation Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

      </div>
    </DashboardLayout>
  );
}
