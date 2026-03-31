import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Home, Navigation, LayoutGrid, BarChart3, User, 
  Contrast, Type, Bell, Settings, Footprints, 
  AlertTriangle, Handshake, Siren, AlertCircle, 
  Volume2, MapPin, Ban, Accessibility, Heart, 
  User as UserIcon, ParkingCircle, CreditCard, 
  PlusSquare, Utensils, CheckCircle2, Mic,
  ChevronRight, Search, Menu, X, Star, History,
  ShieldCheck, Phone, Sparkles, Send, Loader2,
  Map as MapIcon3, TrendingUp, Users, Zap, Navigation2,
  Shield, CloudRain, Clock, Trophy, Map as MapIcon,
  Eye, Video, Coins, Info, ExternalLink
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { UserProfile, HazardReport } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useVoice } from '../contexts/VoiceContext';
import { complexQuery, getAccessibilityInfo } from '../services/aiService';
import { useGeolocation } from '../hooks/useGeolocation';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isListening, startListening, stopListening } = useVoice();
  const { coordinates: userCoords } = useGeolocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAllActionsOpen, setIsAllActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'heard' | 'processing' | 'executed'>('idle');
  const [lastCommandText, setLastCommandText] = useState('');
  
  // AI Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'thinking' | 'maps'>('thinking');

  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);

  useEffect(() => {
    if (userCoords) {
      setMapCenter(userCoords);
    }
  }, [userCoords]);

  const handleAiAssistant = async () => {
    if (!aiQuery && aiMode === 'thinking') return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      if (aiMode === 'thinking') {
        const response = await complexQuery(aiQuery);
        setAiResponse(response);
      } else {
        // For maps grounding, we use the user's location if available
        const lat = userCoords ? userCoords[0] : 40.7128; // Default to NYC for demo
        const lng = userCoords ? userCoords[1] : -74.0060;
        const response = await getAccessibilityInfo(aiQuery || "What are the most accessible places nearby?", lat, lng);
        setAiResponse(response.text);
      }
    } catch (error) {
      toast.error("AI Assistant failed to respond");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const handleVoiceCommand = (e: any) => {
      const command = e.detail.toLowerCase();
      setLastCommandText(command);
      
      if (command.includes('emergency sos') || command.includes('activate sos') || command.includes('help help')) {
        setVoiceStatus('heard');
        setTimeout(() => {
          setVoiceStatus('processing');
          setTimeout(() => {
            handleSOS();
            setVoiceStatus('executed');
            setTimeout(() => setVoiceStatus('idle'), 2000);
          }, 800);
        }, 400);
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-command', handleVoiceCommand);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    };

    const q = query(collection(db, 'hazards'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HazardReport));
      
      // Detect new hazards for notification
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !snapshot.metadata.fromCache) {
          const data = change.doc.data() as HazardReport;
          // Only notify if it's not the initial load (approximate check)
          if (data.createdAt) {
            toast.warning(`New Hazard Reported: ${data.type}`, {
              description: data.location.address,
              icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
              action: {
                label: 'View',
                onClick: () => navigate('/hazard-reports')
              }
            });
          }
        }
      });

      setHazards(docs);
      setLoading(false);
    });

    fetchProfile();
    return () => unsubscribe();
  }, []);

  const handleSOS = () => {
    toast.error('SOS Triggered! Notifying emergency contacts and nearby assistance.', {
      duration: 10000,
      action: {
        label: 'Cancel',
        onClick: () => toast.success('SOS Cancelled')
      }
    });
  };

  const handleFeatureUnderDev = (feature: string) => {
    toast.info(`${feature} feature coming soon!`, {
      description: "We're working hard to bring this to you.",
      icon: <Settings className="w-4 h-4" />
    });
  };

  const handleServiceClick = (service: string) => {
    navigate('/route-planning', { state: { searchService: service } });
  };

  const quickActions = [
    { id: 'nav', label: 'Start Navigation', icon: Footprints, color: 'bg-gradient-to-br from-teal-500 to-teal-700 text-white', path: '/route-planning', desc: 'Find accessible paths' },
    { id: 'hazard', label: 'Hazard Report', icon: AlertTriangle, color: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white', path: '/hazard-reports', desc: 'Help the community' },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility, color: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white', path: '/accessibility', desc: 'Personalize your experience' },
    { id: 'sos', label: 'Emergency SOS', icon: Siren, color: 'bg-gradient-to-br from-red-500 to-red-700 text-white', action: handleSOS, desc: 'Immediate emergency help' },
  ];

  const allQuickActions = [
    ...quickActions,
    { id: 'assist', label: 'Need Assistance', icon: Handshake, color: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white', action: () => handleFeatureUnderDev('Assistance'), desc: 'Request volunteer help' },
    { id: 'profile', label: 'Profile Settings', icon: User, color: 'bg-gradient-to-br from-slate-600 to-slate-800 text-white', path: '/settings', desc: 'Manage your account' },
    { id: 'history', label: 'Saved Routes', icon: History, color: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white', action: () => handleFeatureUnderDev('Saved Routes'), desc: 'Quick access to favorites' },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone, color: 'bg-gradient-to-br from-rose-500 to-rose-700 text-white', action: () => navigate('/settings'), desc: 'Manage safety circle' },
    { id: 'verify', label: 'Verified Places', icon: ShieldCheck, color: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white', action: () => handleFeatureUnderDev('Verified Places'), desc: 'Browse certified locations' },
    { id: 'voice', label: 'Voice Assistant', icon: Mic, color: 'bg-gradient-to-br from-violet-500 to-violet-700 text-white', action: () => handleFeatureUnderDev('Voice Assistant'), desc: 'Hands-free navigation' },
  ];

  const services = [
    { id: 'restrooms', label: 'Restrooms', icon: UserIcon },
    { id: 'parking', label: 'Parking', icon: ParkingCircle },
    { id: 'atms', label: 'ATMs', icon: CreditCard },
    { id: 'pharmacies', label: 'Pharmacies', icon: PlusSquare },
    { id: 'eateries', label: 'Eateries', icon: Utensils },
  ];

  return (
    <div className="bg-background text-on-background flex overflow-x-hidden font-body">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Voice Feedback Overlay */}
      <AnimatePresence>
        {voiceStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4"
          >
            <div className={cn(
              "bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border p-4 flex items-center gap-4 transition-colors duration-300",
              voiceStatus === 'executed' ? "border-green-200 bg-green-50/90" : "border-red-100 bg-red-50/90"
            )}>
              <div className="shrink-0">
                {voiceStatus === 'heard' && (
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
                    <Siren className="w-5 h-5" />
                  </div>
                )}
                {voiceStatus === 'processing' && (
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {voiceStatus === 'executed' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  {voiceStatus === 'heard' && 'Emergency Command'}
                  {voiceStatus === 'processing' && 'Activating SOS...'}
                  {voiceStatus === 'executed' && 'SOS Activated'}
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {lastCommandText || '...'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-64 overflow-y-auto">
        {/* Header */}
        <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-30 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-full hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-bold text-teal-700 font-headline leading-none">
                Hello, {profile?.fullName?.split(' ')[0] || 'User'}
              </h1>
              <p className="hidden sm:block text-[10px] md:text-xs text-slate-500 font-body">Ready to navigate safely?</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search locations, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-3">
            <div className="hidden sm:flex items-center gap-1">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleFeatureUnderDev('High Contrast')}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
              >
                <Contrast className="w-5 h-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleFeatureUnderDev('Text Scaling')}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
              >
                <Type className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleFeatureUnderDev('Notifications')}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </motion.button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings')}
              className="p-1 rounded-full border-2 border-teal-100 hover:border-teal-500 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-teal-50 overflow-hidden">
                <img 
                  src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${profile?.fullName || 'User'}&background=006d6d&color=fff`} 
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.button>
          </div>
        </header>

        <div className="pt-24 pb-12 px-4 md:px-8 space-y-10">
          {/* Predictive Alert Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border-l-8 border-orange-500 p-6 rounded-2xl flex items-center gap-6 shadow-lg shadow-orange-900/5"
          >
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <CloudRain className="w-8 h-8 text-orange-600 animate-bounce" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-lg text-orange-900 leading-tight">Predictive Alert: Heavy Rainfall Expected</h3>
              <p className="text-sm text-orange-800/80 mt-1">
                Water logging detected at Lower Parel exit. AI suggests taking the skywalk elevation for a dry journey. 
                Your travel buddy <span className="font-bold">'Rohan'</span> is nearby for assistance.
              </p>
            </div>
            <button 
              onClick={() => handleFeatureUnderDev('Rerouting')}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-orange-900/20"
            >
              Reroute Now
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Quick Actions */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-on-surface font-headline">Quick Actions</h2>
                  <button 
                    onClick={() => setIsAllActionsOpen(true)}
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group transition-all"
                  >
                    View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => action.path ? navigate(action.path) : action.action?.()}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 aspect-square rounded-[2.5rem] transition-all shadow-sm border border-white/40 backdrop-blur-md relative overflow-hidden group",
                        action.id === 'sos' ? "bg-red-600 text-white shadow-red-900/20" : "bg-white/80 hover:bg-white"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-2xl mb-3 transition-transform group-hover:scale-110",
                        action.id === 'sos' ? "bg-white/20" : "bg-teal-50 text-teal-600"
                      )}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        "text-xs font-bold text-center leading-tight",
                        action.id === 'sos' ? "text-white" : "text-slate-900"
                      )}>{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Accessibility Pulse Dashboard */}
              <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <h2 className="text-xl font-bold text-on-surface font-headline mb-8">Accessibility Pulse Dashboard</h2>
                <div className="flex flex-col md:flex-row items-center gap-12">
                  {/* Gauge Widget */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-slate-100" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
                      <circle className="text-teal-600" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502" strokeDashoffset="100" strokeWidth="12" strokeLinecap="round"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black font-headline text-teal-900">82</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Nearby Score</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-teal-700" />
                        </div>
                        <span className="font-bold text-sm">Restrooms</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 w-[90%]"></div>
                        </div>
                        <span className="text-xs font-bold">90%</span>
                      </div>
                      <span className="text-[10px] text-teal-700 font-bold mt-2 inline-block">4 Accessible Nearby</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                          <ParkingCircle className="w-4 h-4 text-orange-700" />
                        </div>
                        <span className="font-bold text-sm">Parking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 w-[45%]"></div>
                        </div>
                        <span className="text-xs font-bold">45%</span>
                      </div>
                      <span className="text-[10px] text-orange-700 font-bold mt-2 inline-block">High Demand</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-teal-700" />
                        </div>
                        <span className="font-bold text-sm">Elevators</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 w-[100%]"></div>
                        </div>
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-tighter">Live</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-2 inline-block">All operational</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-indigo-700" />
                        </div>
                        <span className="font-bold text-sm">Live Pulse</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Monitoring Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Background decoration */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
              </section>

              {/* Accessibility Squad */}
              <section>
                <h2 className="text-xl font-bold text-on-surface font-headline mb-6">Accessibility Squad</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Travel Buddy */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-teal-100">
                        <img 
                          src="https://picsum.photos/seed/rohan/200" 
                          alt="Rohan Mehta" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Rohan Mehta</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Travel Buddy • 50m away</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFeatureUnderDev('Request Escort')}
                      className="w-full bg-slate-100 py-3 rounded-2xl text-xs font-bold hover:bg-teal-700 hover:text-white transition-all transform active:scale-95"
                    >
                      Request Escort
                    </button>
                  </motion.div>

                  {/* Live Help */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                      <Video className="w-6 h-6 text-indigo-700" />
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-indigo-900">Live Help</h3>
                    <p className="text-[10px] text-indigo-700/70 mb-6 leading-relaxed">Volunteer via Video Call for sighted assistance.</p>
                    <button 
                      onClick={() => handleFeatureUnderDev('Live Help Call')}
                      className="w-full bg-white/50 py-3 rounded-2xl text-xs font-bold text-indigo-900 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Start Call
                    </button>
                  </motion.div>

                  {/* Token Economy */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-[2.5rem] bg-teal-900 text-white shadow-lg shadow-teal-900/20 relative overflow-hidden group"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                        <h3 className="font-bold text-sm">Token Economy</h3>
                      </div>
                      <p className="text-[10px] text-teal-100/70 mb-6 leading-relaxed">Earn 50 tokens by verifying the new ramp at Station Road.</p>
                      <button 
                        onClick={() => handleFeatureUnderDev('Accept Mission')}
                        className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20"
                      >
                        Accept Mission
                      </button>
                    </div>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
                  </motion.div>
                </div>
              </section>

              {/* Community Impact */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-on-surface font-headline">Community Impact</h2>
                  <div className="flex items-center gap-2 text-teal-600">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-bold">12,402 Contributors</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                      <Footprints className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-3xl font-black font-headline text-teal-900">450km</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Accessible Path Mapped</p>
                    <div className="mt-6 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-[75%]"></div>
                    </div>
                  </div>
                  <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-3xl font-black font-headline text-orange-900">1,204</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Hazards Resolved</p>
                    <div className="mt-6 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[60%]"></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-4 space-y-10">
              
              {/* What's Next */}
              <section>
                <h2 className="text-xl font-bold text-on-surface font-headline mb-6">What's Next</h2>
                <div className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-[2.5rem] bg-white shadow-sm border border-slate-100 flex items-start gap-4 relative overflow-hidden group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">In 12 mins</p>
                      <h3 className="font-bold text-sm text-slate-900">Route Forecast</h3>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Bus 202 arriving at Platform 4. Low floor ramp requested for you.</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 text-teal-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Infrastructure Alert</p>
                      <h3 className="font-bold text-sm text-slate-900">Lift Maintenance</h3>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Andheri Station Lift 2 is under service. Use the East Entrance ramp.</p>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Your Activity */}
              <section className="bg-teal-800 text-white rounded-[3rem] p-8 shadow-xl shadow-teal-900/20 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h2 className="text-lg font-bold font-headline">Your Activity</h2>
                  <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
                    <Coins className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-bold">1,240</span>
                  </div>
                </div>

                {/* Daily Goal Progress */}
                <div className="mb-8 relative z-10">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xs font-bold text-teal-100/70 uppercase tracking-widest">Daily Goal</span>
                    <span className="text-sm font-black">75%</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      className="h-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]"
                    />
                  </div>
                  <p className="text-[10px] text-teal-100/50 mt-2 font-medium">25 tokens more to reach your daily target!</p>
                </div>

                <div className="space-y-8 relative z-10">
                  <div className="flex gap-4">
                    <div className="w-1 h-12 bg-orange-500 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-[10px] font-bold text-teal-200/60 uppercase tracking-widest">Today, 08:30 AM</p>
                      <p className="text-sm font-medium leading-snug mt-1">Reported broken tactile paving at Terminal 2.</p>
                      <p className="text-[10px] text-orange-400 font-bold mt-2">+25 Tokens Pending</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1 h-12 bg-white/20 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-[10px] font-bold text-teal-200/60 uppercase tracking-widest">Yesterday</p>
                      <p className="text-sm font-medium leading-snug mt-1">Verified wheelchair access at 'Green Cafe'.</p>
                      <p className="text-[10px] text-teal-300 font-bold mt-2">+50 Tokens Awarded</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleFeatureUnderDev('Contribution History')}
                  className="w-full mt-10 py-4 bg-white text-teal-900 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg"
                >
                  View Contribution History
                </button>
                
                {/* Decoration */}
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-700 rounded-full opacity-50 blur-2xl"></div>
              </section>

              {/* Mini Map Card */}
              <section className="rounded-[2.5rem] overflow-hidden h-56 relative border border-slate-100 shadow-sm group">
                <img 
                  src="https://picsum.photos/seed/mumbai-map/800/600" 
                  alt="Live Mobility Map" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div>
                    <p className="text-white font-bold text-sm">Live Coverage</p>
                    <p className="text-white/70 text-[10px] font-medium">98.2% data accuracy</p>
                  </div>
                  <button 
                    onClick={() => navigate('/route-planning')}
                    className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/30 transition-colors"
                  >
                    <MapIcon className="w-5 h-5" />
                  </button>
                </div>
              </section>

              {/* AI Assistant Widget */}
              <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">AI Assistant</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Ask about accessibility</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g., 'Is the metro lift working?'"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-4 pr-12 text-xs focus:ring-2 focus:ring-teal-500/20 transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleAiAssistant()}
                    />
                    <button 
                      onClick={handleAiAssistant}
                      disabled={isAiLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-teal-600 text-white rounded-xl flex items-center justify-center hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>

                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-xs text-teal-900 leading-relaxed"
                    >
                      {aiResponse}
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAiMode('thinking')}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-bold transition-all",
                        aiMode === 'thinking' ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      General Info
                    </button>
                    <button 
                      onClick={() => setAiMode('maps')}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-bold transition-all",
                        aiMode === 'maps' ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      Nearby Map
                    </button>
                  </div>
                </div>
              </section>

              {/* Weather & Environment Widget */}
              <section className="bg-gradient-to-br from-indigo-600 to-indigo-900 text-white rounded-[2.5rem] p-6 shadow-lg shadow-indigo-900/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-sm font-bold">Weather Pulse</h2>
                      <p className="text-[10px] text-indigo-100/70">Mumbai, Maharashtra</p>
                    </div>
                    <CloudRain className="w-8 h-8 text-indigo-200" />
                  </div>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-4xl font-black font-headline">28°C</span>
                    <span className="text-xs font-bold text-indigo-200 mb-1">Heavy Rain</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md">
                      <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Humidity</p>
                      <p className="text-xs font-bold">88%</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md">
                      <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Visibility</p>
                      <p className="text-xs font-bold">2.4 km</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-400 rounded-full opacity-20 blur-2xl"></div>
              </section>
            </div>
          </div>

          {/* AI Assistant Section (Moved below or integrated) */}
          {/* ... existing AI Assistant code could be here or kept as is ... */}

          {/* Quick Services - Full Width */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface font-headline">Nearby Services</h2>
              <button 
                onClick={() => navigate('/route-planning?mode=nearby')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-all hover:translate-x-1 flex items-center gap-1"
              >
                See Map
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
              {services.map((service) => (
                <motion.button
                  key={service.id}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.05,
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleServiceClick(service.label)}
                  className="flex flex-col items-center justify-center min-w-[120px] p-6 gap-3 rounded-[2.5rem] bg-white transition-all border border-slate-100 shadow-sm hover:border-teal-500/30 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-xs font-bold">{service.label}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 pb-24 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center text-on-surface-variant gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium">WCAG AAA Certified Accessible Design System</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button 
                onClick={() => handleFeatureUnderDev('Privacy Policy')}
                className="hover:text-primary transition-colors font-medium"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handleFeatureUnderDev('Accessibility Statement')}
                className="hover:text-primary transition-colors font-medium"
              >
                Accessibility Statement
              </button>
              <button 
                onClick={() => handleFeatureUnderDev('Contact Support')}
                className="hover:text-primary transition-colors font-medium"
              >
                Contact Support
              </button>
            </div>
          </footer>
        </div>
      </main>

      {/* All Actions Modal */}
      <AnimatePresence>
        {isAllActionsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAllActionsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <header className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 font-headline">All Quick Actions</h2>
                  <p className="text-sm text-slate-500">Everything you need for safe navigation</p>
                </div>
                <button 
                  onClick={() => setIsAllActionsOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allQuickActions.map((action, i) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsAllActionsOpen(false);
                        action.path ? navigate(action.path) : action.action?.();
                      }}
                      className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-teal-500/30 hover:bg-white hover:shadow-xl transition-all text-left group"
                    >
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform", action.color)}>
                        <action.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">{action.label}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{action.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <p className="text-xs text-slate-400 font-medium italic">"Empowering your independence with every step."</p>
                <button 
                  onClick={() => setIsAllActionsOpen(false)}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
