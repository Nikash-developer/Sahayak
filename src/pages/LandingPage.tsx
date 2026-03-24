import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Play, Eye, Ear, Accessibility, Brain, User, Info, Map, 
  ShieldAlert, Radio, Users, History, WifiOff, MessageSquare, 
  Bell, Globe, ChevronDown, Type, Volume2, TriangleAlert, 
  Download, HelpCircle, Share2, Building2, UserRound, Search,
  Smartphone, CreditCard, BellRing, LogOut, ShieldAlert as ShieldAlertIcon,
  Trash2, Lock, Smartphone as SmartphoneIcon, ChevronRight, Camera,
  HeartPulse, Shield, User as UserIcon, Check, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [activeSection, setActiveSection] = useState('home');
  const [selectedFeature, setSelectedFeature] = useState<{ title: string; desc: string; icon: any; detail: string } | null>(null);

  const indianLanguages = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 
    'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
  ];

  const notifications = [
    { id: 1, title: 'New Route Feature', desc: 'Try our new optimized wheelchair routes.', time: '2h ago' },
    { id: 2, title: 'Hazard Alert', desc: 'Construction reported near Central Park.', time: '5h ago' },
    { id: 3, title: 'Community Update', desc: '500+ new accessibility reports this week.', time: '1d ago' },
  ];

  const features = [
    { icon: Map, title: 'Smart Routes', desc: 'Routes optimized for wheelchairs, canes, or strollers.', detail: 'Our advanced routing engine analyzes pavement quality, curb cuts, and slope gradients to provide the smoothest possible path for your specific mobility aid.' },
    { icon: TriangleAlert, title: 'Hazard Detection', desc: 'Real-time alerts for construction and broken elevators.', detail: 'Crowdsourced and sensor-based data provides instant notifications about temporary obstacles, ensuring you never get stuck at a broken elevator or blocked sidewalk.' },
    { icon: UserRound, title: 'Audio Wayfinding', desc: '3D spatial instructions for complex transit hubs.', detail: 'Using high-precision indoor positioning, we provide binaural audio cues that guide you through complex stations and buildings with pinpoint accuracy.' },
    { icon: Users, title: 'Community Data', desc: 'Verified reports from fellow users on actual accessibility.', detail: 'Trust the lived experience of thousands. Our community verifies accessibility features in real-time, providing photos and detailed notes on every location.' },
    { icon: Accessibility, title: 'Live Hub Status', desc: 'Monitoring elevators and ramps at every station.', detail: 'Direct integration with transit authority APIs gives you live status updates on elevators, escalators, and accessible gates before you even arrive.' },
    { icon: History, title: 'Safe History', desc: 'Recall your most trusted routes with privacy-first data.', detail: 'Your data stays on your device. Easily access your most frequent and trusted routes without compromising your location privacy.' },
    { icon: Download, title: 'Offline Mode', desc: 'Navigate confidently even with zero network connectivity.', detail: 'Download entire city maps and accessibility databases to your device, ensuring full navigation capabilities even in underground stations or dead zones.' },
    { icon: HelpCircle, title: 'AI Assistant', desc: 'Voice-activated help for complex spatial queries.', detail: 'Our natural language AI understands complex requests like "Find me a route with no stairs and a quiet waiting area," providing instant, tailored guidance.' },
  ];

  const emergencyFeature = {
    icon: ShieldAlert,
    title: 'Emergency Assist',
    desc: 'Instant SOS connection and location broadcast.',
    detail: 'In critical situations, one tap alerts your emergency contacts and local authorities with your precise location, medical ID, and a live audio stream of your surroundings.'
  };

  const interfaceFeature = {
    icon: Accessibility,
    title: 'Interface Control',
    desc: 'Adapt the experience to your specific needs.',
    detail: 'Customize every aspect of the app—from high-contrast themes and screen reader optimization to gesture-based navigation and simplified layouts for cognitive ease.'
  };

  useEffect(() => {
    const sections = ['home', 'features', 'community', 'about'];
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-12 py-4 border-b border-on-surface/5 sticky top-0 bg-[#FDFCFB]/85 backdrop-blur-xl z-50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => scrollToSection('home')}>
            <span className="text-3xl font-extrabold text-[#006D6D] group-hover:scale-105 transition-transform tracking-tighter">Sahayak</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button 
              onClick={() => scrollToSection('home')} 
              className={cn(
                "hover:opacity-80 transition-all relative group",
                activeSection === 'home' ? "text-[#006D6D]" : "text-gray-500"
              )}
            >
              Home
              {activeSection === 'home' && (
                <motion.span 
                  layoutId="navUnderline"
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#006D6D]" 
                />
              )}
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className={cn(
                "hover:text-[#006D6D] transition-all relative group",
                activeSection === 'features' ? "text-[#006D6D]" : "text-gray-500"
              )}
            >
              Features
              {activeSection === 'features' && (
                <motion.span 
                  layoutId="navUnderline"
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#006D6D]" 
                />
              )}
            </button>
            <button 
              onClick={() => scrollToSection('community')} 
              className={cn(
                "hover:text-[#006D6D] transition-all relative group",
                activeSection === 'community' ? "text-[#006D6D]" : "text-gray-500"
              )}
            >
              Community
              {activeSection === 'community' && (
                <motion.span 
                  layoutId="navUnderline"
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#006D6D]" 
                />
              )}
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className={cn(
                "hover:text-[#006D6D] transition-all relative group",
                activeSection === 'about' ? "text-[#006D6D]" : "text-gray-500"
              )}
            >
              About
              {activeSection === 'about' && (
                <motion.span 
                  layoutId="navUnderline"
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#006D6D]" 
                />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-on-surface hover:bg-on-surface/10 transition-all text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>{selectedLang}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", isLanguageOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {isLanguageOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                  <div className="py-2 max-h-64 overflow-y-auto">
                    {indianLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLang(lang);
                          setIsLanguageOpen(false);
                          toast.success(`Language changed to ${lang}`);
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-teal-50 hover:text-[#006D6D] flex items-center justify-between transition-colors"
                      >
                        {lang}
                        {selectedLang === lang && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all relative group"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF8C42] rounded-full border-2 border-white" />
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                      <span className="font-bold text-sm">Notifications</span>
                      <button className="text-[10px] uppercase font-bold text-[#006D6D] hover:underline">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-xs">{n.title}</span>
                            <span className="text-[10px] text-gray-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 text-xs font-bold text-gray-400 hover:text-[#006D6D] hover:bg-gray-50 transition-all">View all notifications</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#006D6D]/20 hover:border-[#006D6D] transition-all hover:scale-110 bg-gray-100 flex items-center justify-center"
            >
              <UserIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[850px] flex items-center bg-gradient-to-br from-[#006D6D] to-[#004D4D] px-12 pt-20 pb-48 lg:pt-32 lg:pb-64 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0% 100%)' }}>
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#FF8C42]/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] left-[-5%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold mb-8 backdrop-blur-md border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#FF8C42] animate-pulse" />
              AI Smart Guide for Everyone
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
              <motion.span 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                Navigate Your City.
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="block text-[#FF8C42] drop-shadow-[0_10px_10px_rgba(255,140,66,0.3)]"
              >
                Independently.
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                Safely.
              </motion.span>
            </h1>
            <p className="text-white/70 text-xl max-w-lg mb-12 leading-relaxed font-medium">
              Sahayak is your invisible guide, built to make urban mobility inclusive. Whether you're navigating visual impairments, mobility challenges, or simply want a safer route—we've got you.
            </p>
            <div className="flex flex-wrap gap-6">
              <button
                onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                className="px-10 py-5 rounded-2xl bg-[#FF8C42] text-white font-bold text-xl flex items-center gap-3 hover:bg-[#e67e3b] transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,140,66,0.4)]"
              >
                Start Your Journey
              </button>
              <button 
                onClick={() => toast.info('Video demo coming soon')}
                className="px-10 py-5 rounded-2xl bg-[#004D4D] text-white font-bold text-xl flex items-center gap-3 hover:bg-[#003D3D] transition-all border border-white/10 shadow-lg"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-6 h-6 fill-white text-white" />
                </div>
                How it works
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block z-10"
          >
            <div className="aspect-square max-w-[540px] ml-auto rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl transform rotate-1">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwF5QPCxz0IMke6O4z75Cg1GAafu2yzl5xin-LA195QyYGmRxmwmNsk6LYUcTNDNY4_nc7303f8wrfUm0dL5Mm9KA4FvK6_7gkdpiBmFTsODGzMic8nL00M7Z5tpVAr1iWGpW_5gOAOrKPb1yEPMM-klxPmLohn2pOI-icP8QwH_pbQs5u5F0iksMcpaTGbaF7D1oIjMxbG7ILj5mCiZ96oz_bYh9FL4zY82j_nK9Yidq_kmBF84vYUclWrknIj2Y8OY0owA1ptiM"
                alt="Diverse group navigating"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating Info Card */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl w-80 transform -rotate-2 z-30 border border-black/5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#006D6D]/10 flex items-center justify-center text-[#006D6D]">
                  <Accessibility className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-bold text-on-surface block">Clear Path Ahead</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Live Accessibility Updates</span>
                </div>
              </div>
              <div className="h-2.5 bg-[#F4F2F0] rounded-full w-full mb-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="h-full bg-[#006D6D] rounded-full" 
                />
              </div>
              <p className="text-sm text-gray-500 font-medium">92% Accessible route via Main St.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

        {/* Hero Feature Cards - Overlapping */}
        <div className="max-w-7xl mx-auto -mt-32 grid md:grid-cols-2 gap-8 relative z-30 px-8">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => setSelectedFeature(emergencyFeature)}
            className="bg-white p-8 rounded-[40px] shadow-2xl flex items-center justify-between group cursor-pointer border-b-8 border-red-500/20"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-1">Emergency Assist</h3>
                <p className="text-gray-500 font-medium">Instant SOS connection and location broadcast.</p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-200 group-hover:rotate-12 transition-transform">
              <span className="text-3xl font-bold">*</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => setSelectedFeature(interfaceFeature)}
            className="bg-white p-8 rounded-[40px] shadow-2xl flex items-center justify-between group cursor-pointer border-b-8 border-[#006D6D]/20"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center text-[#006D6D] group-hover:bg-[#006D6D] group-hover:text-white transition-all duration-300">
                <Accessibility className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-1">Interface Control</h3>
                <p className="text-gray-500 font-medium">Adapt the experience to your specific needs.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#006D6D] transition-colors"><Type className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#006D6D] transition-colors"><Eye className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#006D6D] transition-colors"><Volume2 className="w-5 h-5" /></div>
            </div>
          </motion.div>
        </div>


      {/* Features Section */}
      <section id="features" className="py-32 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl lg:text-7xl font-bold mb-8 text-[#006D6D]"
          >
            Empowering Independence
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-xl max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Our AI-powered tools are designed to bridge the gap between navigation and accessibility, providing real-time data for a smoother journey.
          </motion.p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -15, scale: 1.02 }}
              onClick={() => setSelectedFeature(f)}
              className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-2xl transition-all text-center group border border-gray-100 cursor-pointer"
            >
              <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-[#006D6D] mx-auto mb-8 group-hover:bg-[#006D6D] group-hover:text-white transition-all duration-300 group-hover:rotate-6">
                <f.icon className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-2xl mb-4">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Detail Popup */}
      <AnimatePresence>
        {selectedFeature && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="p-8 lg:p-12">
                <button 
                  onClick={() => setSelectedFeature(null)}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center text-[#006D6D] mb-8">
                  <selectedFeature.icon className="w-10 h-10" />
                </div>
                
                <h3 className="text-3xl font-bold mb-4 text-[#006D6D]">{selectedFeature.title}</h3>
                <p className="text-gray-500 text-lg font-medium leading-relaxed mb-8">
                  {selectedFeature.detail}
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setSelectedFeature(null);
                      navigate('/login', { state: { mode: 'signup' } });
                    }}
                    className="flex-1 py-4 rounded-2xl bg-[#006D6D] text-white font-bold text-lg hover:bg-[#004D4D] transition-all"
                  >
                    Try Now
                  </button>
                  <button 
                    onClick={() => setSelectedFeature(null)}
                    className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 flex items-center justify-between border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sahayak AI Smart Guide</span>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF8C42]" />
                  <div className="w-2 h-2 rounded-full bg-[#006D6D]" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Community Section */}
      <section id="community" className="py-32 bg-[#F4F2F0] overflow-hidden px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#006D6D]/10 rounded-full blur-[100px]"></div>
            <div className="relative z-10 p-4 bg-white rounded-[2.5rem] shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbU4ZYId0vj1kC05kufQ50tpKSsQ1lcU1wIK-COo3AoyI5J0RDZnRGUyrIMfOXq2UBWtryASYgOfxz9u6b5R9gHqJefTP850wp39rAfMicEAt9Kf269gtBpG4FuhnoyKpggg8kc_mEExYq8PSVobTYqKduE5wQ2DWsuqKfNjbR8R0E77X0GelF7YEtxTlx0eKGujQiEifU-gpixqLR_aMvSRIIjvytOL-8KDSE2-3upUiUM681Hd0YoVgmV8WydRHkc7lhT11qgPY"
                alt="Digital representation of accessibility"
                className="rounded-[2rem] w-full aspect-[4/3] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-extrabold mb-8 leading-tight tracking-tight text-on-surface">
              Built by the community, <br />
              <span className="text-[#006D6D]">for the community.</span>
            </h2>
            <p className="text-gray-500 text-xl mb-12 leading-relaxed font-medium">
              Our mission is to map every corner of the urban landscape with empathy and precision. Join thousands of users making the world more navigable.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <button 
                onClick={() => toast.info('App Store download coming soon')}
                className="hover:scale-105 transition-transform active:scale-95"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on App Store" 
                  className="h-12 lg:h-14"
                  referrerPolicy="no-referrer"
                />
              </button>
              <button 
                onClick={() => toast.info('Google Play download coming soon')}
                className="hover:scale-105 transition-transform active:scale-95"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  className="h-12 lg:h-14"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-[#006D6D] pt-32 pb-12 text-white overflow-hidden relative px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF8C42]/10 rounded-full blur-[120px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1">
              <span className="text-4xl font-extrabold tracking-tighter block mb-8">Sahayak</span>
              <p className="text-white/70 text-base leading-relaxed font-medium">
                The world's most inclusive AI navigation platform. Making independence possible for everyone.
              </p>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Sahayak',
                        text: 'Check out Sahayak - The world\'s most inclusive AI navigation platform.',
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      toast.info('Sharing coming soon');
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF8C42] transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-8 text-[#FF8C42]">Platform</h4>
              <ul className="space-y-4 text-white/70 text-base font-medium">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-all hover:translate-x-2">Safety Features</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-all hover:translate-x-2">Routing Engine</button></li>
                <li><button onClick={() => toast.info('Live Transit coming soon')} className="hover:text-white transition-all hover:translate-x-2">Live Transit</button></li>
                <li><button onClick={() => toast.info('Privacy details coming soon')} className="hover:text-white transition-all hover:translate-x-2">Data Privacy</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-8 text-[#FF8C42]">Company</h4>
              <ul className="space-y-4 text-white/70 text-base font-medium">
                <li><button onClick={() => toast.info('Our Mission details coming soon')} className="hover:text-white transition-all hover:translate-x-2">Our Mission</button></li>
                <li><button onClick={() => toast.info('Partnership details coming soon')} className="hover:text-white transition-all hover:translate-x-2">Partnerships</button></li>
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-all hover:translate-x-2">Accessibility</button></li>
                <li><button onClick={() => toast.info('Contact form coming soon')} className="hover:text-white transition-all hover:translate-x-2">Contact Us</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-8 text-[#FF8C42]">Stay Updated</h4>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/50 transition-all font-medium"
                  />
                </div>
                <button 
                  onClick={() => toast.success('Subscribed successfully!')}
                  className="w-full py-4 rounded-2xl bg-[#FF8C42] text-white font-bold text-lg hover:bg-[#e67e3b] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-900/40"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-white/50 font-medium">
            <p>© 2024 Sahayak AI Smart Guide. All rights reserved.</p>
            <div className="flex gap-10">
              <button onClick={() => toast.info('Privacy Policy details')} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => toast.info('Terms of Service details')} className="hover:text-white transition-colors">Terms of Service</button>
              <button onClick={() => toast.info('Cookie Policy details')} className="hover:text-white transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
