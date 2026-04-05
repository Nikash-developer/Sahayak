import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Play, Eye, Ear, Brain, User, Info, Map, 
  ShieldAlert, Radio, Users, History, WifiOff, MessageSquare, 
  Bell, Globe, ChevronDown, Type, Volume2, TriangleAlert, 
  Download, HelpCircle, Share2, Building2, UserRound, Search,
  Smartphone, CreditCard, BellRing, LogOut, ShieldAlert as ShieldAlertIcon,
  Trash2, Lock, Smartphone as SmartphoneIcon, ChevronRight, Camera,
  HeartPulse, Shield, User as UserIcon, Check, X, Sparkles, Navigation,
  Send
} from 'lucide-react';
import { WheelchairIcon } from '../components/WheelchairIcon';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";

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
    { icon: Map, title: 'Smart Routes', desc: 'Routes optimized for wheelchairs, canes, or strollers.', detail: 'Our advanced routing engine analyzes pavement quality, curb cuts, and slope gradients to provide the smoothest possible path for your specific mobility aid.', color: 'bg-teal-50' },
    { icon: TriangleAlert, title: 'Hazard Detection', desc: 'Real-time alerts for construction and broken elevators.', detail: 'Crowdsourced and sensor-based data provides instant notifications about temporary obstacles, ensuring you never get stuck at a broken elevator or blocked sidewalk.', color: 'bg-orange-50' },
    { icon: UserRound, title: 'Audio Wayfinding', desc: '3D spatial instructions for complex transit hubs.', detail: 'Using high-precision indoor positioning, we provide binaural audio cues that guide you through complex stations and buildings with pinpoint accuracy.', color: 'bg-blue-50' },
    { icon: Users, title: 'Community Data', desc: 'Verified reports from fellow users on actual accessibility.', detail: 'Trust the lived experience of thousands. Our community verifies accessibility features in real-time, providing photos and detailed notes on every location.', color: 'bg-purple-50' },
    { icon: WheelchairIcon, title: 'Live Hub Status', desc: 'Monitoring elevators and ramps at every station.', detail: 'Direct integration with transit authority APIs gives you live status updates on elevators, escalators, and accessible gates before you even arrive.', color: 'bg-green-50' },
    { icon: History, title: 'Safe History', desc: 'Recall your most trusted routes with privacy-first data.', detail: 'Your data stays on your device. Easily access your most frequent and trusted routes without compromising your location privacy.', color: 'bg-slate-50' },
    { icon: Download, title: 'Offline Mode', desc: 'Navigate confidently even with zero network connectivity.', detail: 'Download entire city maps and accessibility databases to your device, ensuring full navigation capabilities even in underground stations or dead zones.', color: 'bg-indigo-50' },
    { icon: HelpCircle, title: 'AI Assistant', desc: 'Voice-activated help for complex spatial queries.', detail: 'Our natural language AI understands complex requests like "Find me a route with no stairs and a quiet waiting area," providing instant, tailored guidance.', color: 'bg-pink-50' },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Wheelchair User",
      content: "Sahayak changed how I see the city. I no longer fear getting stuck at a broken elevator. The smart routing is a lifesaver.",
      avatar: "https://i.pravatar.cc/150?u=rajesh"
    },
    {
      name: "Mrs. Sharma",
      role: "Senior Citizen",
      content: "The voice assistance is so clear and easy to use. I feel much more confident walking to the park by myself now.",
      avatar: "https://i.pravatar.cc/150?u=sharma"
    },
    {
      name: "Ananya Singh",
      role: "Visually Impaired",
      content: "The audio wayfinding in the metro station is incredibly precise. It feels like I have a personal guide with me.",
      avatar: "https://i.pravatar.cc/150?u=ananya"
    }
  ];

  const [aiSimText, setAiSimText] = useState('');
  const [aiSimResponse, setAiSimResponse] = useState('');
  const [isAiSimulating, setIsAiSimulating] = useState(false);
  const [userInput, setUserInput] = useState('');

  const handleAiQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() && !aiSimText) return;

    const query = userInput || aiSimText;
    setIsAiSimulating(true);
    setAiSimResponse('');
    if (userInput) setAiSimText(userInput);
    setUserInput('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          systemInstruction: "You are Sahayak, an AI assistant for an accessibility-focused navigation app. Your goal is to help users with mobility or visual impairments find safe, accessible routes and information. Keep responses concise, helpful, and focused on accessibility (ramps, elevators, pavement quality, etc.).",
        },
      });

      setAiSimResponse(response.text || "I'm sorry, I couldn't process that request.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSimResponse("I'm having trouble connecting to my brain right now. Please try again later.");
      toast.error("Failed to connect to AI assistant.");
    } finally {
      setIsAiSimulating(false);
    }
  };

  const runAiSimulation = () => {
    setUserInput('');
    setAiSimText('');
    setAiSimResponse('');
    
    const query = "Find me a route with no stairs to the metro station.";
    let i = 0;
    setIsAiSimulating(true);
    const interval = setInterval(() => {
      setAiSimText(prev => prev + query[i]);
      i++;
      if (i >= query.length) {
        clearInterval(interval);
        // After typing finishes, trigger the real AI call
        setTimeout(() => {
          handleAiQuery();
        }, 500);
      }
    }, 40);
  };

  const emergencyFeature = {
    icon: ShieldAlert,
    title: 'Emergency Assist',
    desc: 'Instant SOS connection and location broadcast.',
    detail: 'In critical situations, one tap alerts your emergency contacts and local authorities with your precise location, medical ID, and a live audio stream of your surroundings.'
  };

  const interfaceFeature = {
    icon: WheelchairIcon,
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
    <div className="bg-white font-sans text-[#1A1A1A]">
      {/* Navbar */}
      <nav role="navigation" aria-label="Main Navigation" className="flex items-center justify-between px-12 py-4 border-b border-on-surface/5 sticky top-0 bg-[#FDFCFB]/85 backdrop-blur-xl z-50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => scrollToSection('home')} aria-label="Sahayak Home">
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
                aria-label="Start Your Journey - Sign Up"
                className="px-10 py-5 rounded-2xl bg-[#FF8C42] text-white font-bold text-xl flex items-center gap-3 hover:bg-[#e67e3b] transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,140,66,0.4)]"
              >
                Start Your Journey
              </button>
              <button 
                onClick={() => navigate('/route-planning?mode=nearby')}
                aria-label="Find nearby accessible services"
                className="px-10 py-5 rounded-2xl bg-white text-[#006D6D] font-bold text-xl flex items-center gap-3 hover:bg-teal-50 transition-all border-2 border-[#006D6D] shadow-lg"
              >
                <Search className="w-6 h-6" />
                Nearby Services
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block z-10"
          >
            <div className="aspect-square max-w-[540px] ml-auto rounded-[3rem] overflow-hidden bg-white/5 backdrop-blur-3xl border-2 border-white/10 shadow-2xl relative flex items-center justify-center group">
              {/* Animated Path Visualization - More Complex */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: [0, 1], 
                      opacity: [0, 0.4, 0],
                      strokeDashoffset: [0, -20]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      delay: i * 0.6,
                      ease: "linear"
                    }}
                    className="absolute w-full h-full"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full stroke-teal-400/40 fill-none stroke-[0.3]">
                      <path 
                        d={`M ${i * 12.5} 0 L ${100 - i * 12.5} 100`} 
                        strokeDasharray="4 4"
                      />
                      <path 
                        d={`M 0 ${i * 12.5} L 100 ${100 - i * 12.5}`} 
                        strokeDasharray="4 4"
                      />
                    </svg>
                  </motion.div>
                ))}
              </div>

              {/* Live Accessibility Pulse Grid */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-4 p-8 opacity-20 pointer-events-none">
                {[...Array(36)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      backgroundColor: Math.random() > 0.8 ? ['rgba(45, 212, 191, 0.1)', 'rgba(45, 212, 191, 0.6)', 'rgba(45, 212, 191, 0.1)'] : 'rgba(255, 255, 255, 0.03)'
                    }}
                    transition={{ 
                      duration: 3 + Math.random() * 4, 
                      repeat: Infinity,
                      delay: Math.random() * 5
                    }}
                    className="rounded-lg"
                  />
                ))}
              </div>

              {/* Central Pulse */}
              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    boxShadow: [
                      "0 0 0 0px rgba(20, 184, 166, 0)",
                      "0 0 0 40px rgba(20, 184, 166, 0.1)",
                      "0 0 0 0px rgba(20, 184, 166, 0)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-40 h-40 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-400/30"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-teal-400/20"
                  />
                  <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-2xl shadow-teal-500/50 relative z-10">
                    <Navigation className="w-10 h-10" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <p className="text-white font-black text-2xl tracking-tighter">Live Accessibility Engine</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-teal-300 font-bold text-xs uppercase tracking-[0.2em]">Analyzing 5,400+ nodes</p>
                  </div>
                </motion.div>
              </div>

              {/* Hover Floating Elements */}
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 15, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                className="absolute top-12 right-12 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white cursor-pointer transition-colors z-20"
              >
                <WheelchairIcon className="w-7 h-7" />
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.2, rotate: -15, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                className="absolute top-12 left-12 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white cursor-pointer transition-colors z-20"
              >
                <Shield className="w-7 h-7" />
              </motion.div>
            </div>
            
            {/* Floating Info Card */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -bottom-24 -left-20 bg-white p-8 rounded-3xl shadow-2xl w-80 transform -rotate-3 z-40 border border-black/5 hover:rotate-0 transition-transform duration-500 cursor-default"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#006D6D]/10 flex items-center justify-center text-[#006D6D]">
                  <WheelchairIcon className="w-7 h-7" />
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

        {/* Live Activity Ticker */}
        <div className="absolute bottom-0 left-0 w-full bg-black/20 backdrop-blur-md border-t border-white/10 py-4 overflow-hidden z-20">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 whitespace-nowrap items-center"
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 text-white/60 text-sm font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>Elevator Operational: Sector 4 Station</span>
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Hazard Reported: Main St Construction</span>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>New Accessible Cafe: "The Green Bean"</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

        {/* Hero Feature Cards - Overlapping */}
        <div className="max-w-7xl mx-auto -mt-32 grid md:grid-cols-2 gap-8 relative z-30 px-8">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => setSelectedFeature(emergencyFeature)}
            role="button"
            aria-label="Emergency Assist - Click for details"
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
            role="button"
            aria-label="Interface Control - Click for details"
            className="bg-white p-8 rounded-[40px] shadow-2xl flex items-center justify-between group cursor-pointer border-b-8 border-[#006D6D]/20"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center text-[#006D6D] group-hover:bg-[#006D6D] group-hover:text-white transition-all duration-300">
                <WheelchairIcon className="w-8 h-8" />
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-[#006D6D] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-teal-100"
          >
            <Brain className="w-3 h-3" />
            AI-Powered Capabilities
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl lg:text-7xl font-bold mb-8 text-[#006D6D] tracking-tight"
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

        {/* AI Simulation Box */}
        <div className="max-w-4xl mx-auto mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">AI Assistant Preview</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Natural Language Navigation</p>
                  </div>
                </div>
                <button 
                  onClick={runAiSimulation}
                  disabled={isAiSimulating}
                  className="px-6 py-3 rounded-xl bg-teal-50 text-[#006D6D] font-bold text-sm hover:bg-teal-100 transition-all disabled:opacity-50"
                >
                  {isAiSimulating ? 'Processing...' : 'Try Simulation'}
                </button>
              </div>
              
              <div className="space-y-6">
                <form onSubmit={handleAiQuery} className="relative">
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about accessible routes..."
                    className="w-full p-6 pr-16 bg-gray-50 rounded-2xl border border-gray-100 text-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                    disabled={isAiSimulating}
                  />
                  <button 
                    type="submit"
                    disabled={isAiSimulating || !userInput.trim()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all disabled:opacity-50 disabled:bg-gray-300"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                <div className="p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 min-h-[60px] flex items-center">
                  <p className="text-base font-medium text-gray-500 italic">
                    {aiSimText || "Your query will appear here..."}
                    {isAiSimulating && !aiSimResponse && <span className="inline-block w-1 h-5 bg-teal-500 ml-1 animate-pulse" />}
                  </p>
                </div>
                
                <AnimatePresence>
                  {aiSimResponse && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 bg-teal-600 rounded-2xl shadow-xl text-white relative"
                    >
                      <div className="absolute -top-3 left-8 w-6 h-6 bg-teal-600 rotate-45" />
                      <div className="flex gap-4">
                        <Sparkles className="w-6 h-6 shrink-0" />
                        <div className="font-bold leading-relaxed whitespace-pre-wrap">{aiSimResponse}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
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
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-300 group-hover:rotate-6",
                f.color,
                "group-hover:bg-[#006D6D] group-hover:text-white"
              )}>
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
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#006D6D]/10 rounded-full blur-[100px]"></div>
            <div className="relative z-10 p-12 bg-white rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col items-center text-center group">
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="w-32 h-32 rounded-[2.5rem] bg-teal-50 flex items-center justify-center text-[#006D6D] mb-8 shadow-inner"
              >
                <Users className="w-16 h-16" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-4">Community Powered</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Real-time accessibility data contributed by users like you. Every report makes the city more navigable for everyone.
              </p>
              <div className="mt-8 flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=user${i}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  +5k
                </div>
              </div>
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

        {/* Testimonials */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Voices of Sahayak</h3>
            <p className="text-gray-500 font-medium">Real stories from our amazing community.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 flex flex-col justify-between"
              >
                <p className="text-gray-600 italic mb-8 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-teal-50" />
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-[#006D6D] pt-32 pb-24 text-white overflow-hidden relative px-8">
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
