import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Home, Navigation, LayoutGrid, BarChart3, User, 
  Contrast, Type, Bell, Settings, Footprints, 
  AlertTriangle, Handshake, Siren, AlertCircle, 
  Volume2, MapPin, Ban, Heart, 
  User as UserIcon, ParkingCircle, CreditCard, 
  PlusSquare, Utensils, CheckCircle2, Mic,
  ChevronRight, Search, Menu, X, Star, History,
  ShieldCheck, Phone, Sparkles, Send, Loader2,
  Map as MapIcon3, TrendingUp, Users, Zap, Navigation2,
  Shield, CloudRain, Clock, Trophy, Map as MapIcon,
  Eye, Video, Coins, Info, ExternalLink, Sun, Thermometer
} from 'lucide-react';
import { WheelchairIcon } from '../components/WheelchairIcon';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SOSModal from '../components/SOSModal';
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
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAllActionsOpen, setIsAllActionsOpen] = useState(false);
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
    setIsSOSModalOpen(true);
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
    { id: 'accessibility', label: 'Accessibility', icon: WheelchairIcon, color: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white', path: '/accessibility', desc: 'Personalize your experience' },
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
        <SOSModal 
          isOpen={isSOSModalOpen} 
          onClose={() => setIsSOSModalOpen(false)} 
          userCoords={userCoords} 
        />

        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div className="pt-20 pb-0 px-4 md:px-8 space-y-2">
          {/* Predictive Alert Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-8 border-amber-500 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl shadow-amber-900/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative z-10">
              <Sun className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="font-headline font-bold text-lg text-amber-900 leading-tight">Predictive Alert: Extreme Heatwave & Sunstroke Risk</h3>
              <p className="text-sm text-amber-800/80 mt-1">
                High UV index and extreme temperatures detected. AI suggests staying in shaded areas or using indoor transit corridors. 
                Hydration points marked on your map. Your travel buddy <span className="font-bold">'Rohan'</span> is nearby for assistance.
              </p>
            </div>
            <button 
              onClick={() => handleFeatureUnderDev('Rerouting')}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-amber-900/20 relative z-10"
            >
              View Shade Route
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Quick Actions */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-on-surface font-headline">Quick Actions</h2>
                  <button 
                    onClick={() => setIsAllActionsOpen(true)}
                    className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group transition-all bg-teal-50 px-4 py-2 rounded-full hover:bg-teal-100"
                  >
                    View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.05, y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => action.path ? navigate(action.path) : action.action?.()}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 sm:p-8 aspect-square rounded-[2.5rem] transition-all shadow-md border border-white/40 backdrop-blur-md relative overflow-hidden group",
                        action.id === 'sos' ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-red-900/40" : "bg-white/90 hover:bg-white"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl mb-3 transition-transform group-hover:scale-110 shadow-sm",
                        action.id === 'sos' ? "bg-white/20" : "bg-teal-50 text-teal-600"
                      )}>
                        <action.icon className="w-7 h-7" />
                      </div>
                      <span className={cn(
                        "text-xs sm:text-sm font-black text-center leading-tight tracking-tight",
                        action.id === 'sos' ? "text-white" : "text-slate-900"
                      )}>{action.label}</span>
                      {action.id !== 'sos' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Accessibility Pulse Dashboard */}
              <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <h2 className="text-xl font-bold text-on-surface font-headline mb-6">Accessibility Pulse Dashboard</h2>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Gauge Widget */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-slate-100" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="10"></circle>
                      <circle className="text-teal-600" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="88" strokeWidth="10" strokeLinecap="round"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black font-headline text-teal-900">82</span>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Nearby Score</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                          <UserIcon className="w-3.5 h-3.5 text-teal-700" />
                        </div>
                        <span className="font-bold text-xs">Restrooms</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 w-[90%]"></div>
                        </div>
                        <span className="text-[10px] font-bold">90%</span>
                      </div>
                      <span className="text-[9px] text-teal-700 font-bold mt-1 inline-block">4 Accessible Nearby</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                          <ParkingCircle className="w-3.5 h-3.5 text-orange-700" />
                        </div>
                        <span className="font-bold text-xs">Parking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 w-[45%]"></div>
                        </div>
                        <span className="text-[10px] font-bold">45%</span>
                      </div>
                      <span className="text-[9px] text-orange-700 font-bold mt-1 inline-block">High Demand</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                        </div>
                        <span className="font-bold text-xs">Elevators</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 w-[100%]"></div>
                        </div>
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter">Live</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium mt-1 inline-block">All operational</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-indigo-700" />
                        </div>
                        <span className="font-bold text-xs">Live Pulse</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Monitoring Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Background decoration */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
              </section>

              {/* Accessibility Squad */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-on-surface font-headline">Accessibility Squad</h2>
                  <div className="flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Squad Online</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Travel Buddy */}
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-2 border-teal-100 shadow-lg group-hover:border-teal-400 transition-colors">
                          <img 
                            src="https://picsum.photos/seed/aarav/200" 
                            alt="Aarav Sharma" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <h3 className="font-black text-sm text-slate-900">Aarav Sharma</h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-tighter">
                          <MapPin className="w-3 h-3 text-teal-600" /> Verified Guide • 120m
                        </p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-2.5 h-2.5 text-orange-400 fill-orange-400" />)}
                          <span className="text-[9px] font-bold text-slate-400 ml-1">(48)</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-600">Wheelchair Assist</span>
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-600">Hindi/English</span>
                      </div>
                      <button 
                        onClick={() => handleFeatureUnderDev('Request Escort')}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-black hover:bg-teal-700 transition-all transform active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-teal-900/20"
                      >
                        Request Escort
                      </button>
                    </div>
                  </motion.div>

                  {/* Live Help */}
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-800 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner">
                        <Video className="w-7 h-7 text-white animate-pulse" />
                      </div>
                      <h3 className="font-black text-lg mb-2 font-headline">Live Sighted Help</h3>
                      <p className="text-[11px] text-indigo-100/80 mb-8 leading-relaxed font-medium">
                        Connect with a sighted volunteer instantly for real-time navigation support and object identification.
                      </p>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-indigo-700 bg-slate-200 overflow-hidden">
                              <img src={`https://picsum.photos/seed/vol${i}/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-indigo-200">12 Volunteers Ready</span>
                      </div>
                      <button 
                        onClick={() => handleFeatureUnderDev('Live Help Call')}
                        className="w-full bg-white text-indigo-900 py-3.5 rounded-2xl text-xs font-black hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                      >
                        Start Video Call
                      </button>
                    </div>
                  </motion.div>

                  {/* Token Economy */}
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group border border-slate-800"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(20,184,166,0.15),transparent)]"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm uppercase tracking-tight">Active Mission</h3>
                            <p className="text-[9px] text-orange-400 font-bold uppercase tracking-widest">Limited Time</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-orange-400">+50</span>
                          <p className="text-[8px] font-bold text-slate-500 uppercase">Tokens</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-700">
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                          Verify the new tactile paving and ramp accessibility at <span className="text-white font-bold">Central Station Road</span>.
                        </p>
                        <div className="mt-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          <span>Progress</span>
                          <span className="text-teal-400">0/1 Verified</span>
                        </div>
                        <div className="mt-2 w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 w-0 group-hover:w-[10%] transition-all duration-1000"></div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleFeatureUnderDev('Accept Mission')}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3.5 rounded-2xl text-xs font-black hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                      >
                        Accept Mission
                      </button>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Community Impact */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-on-surface font-headline">Community Impact</h2>
                  <div className="flex items-center gap-2 text-teal-600">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold">12,402 Contributors</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                      <Footprints className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-2xl font-black font-headline text-teal-900">450km</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Accessible Path Mapped</p>
                    <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-[75%]"></div>
                    </div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-black font-headline text-orange-900">1,204</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hazards Resolved</p>
                    <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[60%]"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Accessibility Pulse */}
              <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-teal-900/20 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-teal-200" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold font-headline">Accessibility Pulse</h2>
                        <p className="text-sm text-teal-100/70">Real-time environmental data</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-teal-200/60 uppercase tracking-widest mb-1">Crowd Level</p>
                        <p className="text-xl font-black">Moderate</p>
                        <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-300 w-[45%]"></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-teal-200/60 uppercase tracking-widest mb-1">Air Quality</p>
                        <p className="text-xl font-black">Good (42)</p>
                        <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 w-[85%]"></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-teal-200/60 uppercase tracking-widest mb-1">Weather</p>
                        <p className="text-xl font-black">32°C, Sunny</p>
                        <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 w-[60%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-md border border-white/10 w-full md:w-auto">
                    <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mb-4">Accessibility Score</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black font-headline">8.4</span>
                      <span className="text-teal-300 font-bold mb-1">/10</span>
                    </div>
                    <p className="text-[10px] text-teal-100/60 mt-2">Based on 1.2k reports today</p>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-teal-400 rounded-full opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              </section>
            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* What's Next */}
              <section>
                <h2 className="text-xl font-bold text-on-surface font-headline mb-4">What's Next</h2>
                <div className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-[2rem] bg-white shadow-sm border border-slate-100 flex items-start gap-4 relative overflow-hidden group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">In 12 mins</p>
                      <h3 className="font-bold text-sm text-slate-900">Route Forecast</h3>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Bus 202 arriving at Platform 4. Low floor ramp requested for you.</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-teal-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alert</p>
                      <h3 className="font-bold text-sm text-slate-900">Elevator Maintenance</h3>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Elevator at Exit B is under maintenance. Use Exit A for ramp access.</p>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Your Activity */}
              <section className="bg-teal-800 text-white rounded-[3rem] p-6 shadow-xl shadow-teal-900/20 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
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

              {/* Infrastructure Status */}
              <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Infrastructure</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold text-green-600 uppercase">Live</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Elevators (Line 1)', status: '9/10 Active', color: 'text-green-600' },
                    { label: 'Escalators (Main)', status: '14/16 Active', color: 'text-orange-500' },
                    { label: 'Tactile Paving', status: 'Verified', color: 'text-teal-600' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                      <span className="text-xs font-bold text-slate-700">{item.label}</span>
                      <span className={cn("text-[10px] font-black", item.color)}>{item.status}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => handleFeatureUnderDev('Infrastructure Map')}
                  className="w-full mt-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-colors"
                >
                  View Full Status Map
                </button>
              </section>

              {/* AI Assistant Widget */}
              <section className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
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
            </div>
          </div>

          {/* AI Assistant Section (Moved below or integrated) */}
          {/* ... existing AI Assistant code could be here or kept as is ... */}

          {/* Nearby Services - Full Width */}
          <section className="space-y-6 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-on-surface font-headline">Nearby Services</h2>
              <button 
                onClick={() => navigate('/route-planning?mode=nearby')}
                className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-all hover:translate-x-1 flex items-center gap-1 bg-teal-50 px-5 py-2 rounded-full"
              >
                See Full Map
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex overflow-x-auto py-4 gap-6 no-scrollbar">
              {services.map((service) => (
                <motion.button
                  key={service.id}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.05,
                    boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleServiceClick(service.label)}
                  className="flex flex-col items-center justify-center min-w-[160px] p-8 gap-4 rounded-[3rem] bg-slate-50 transition-all border border-transparent hover:border-teal-500/30 hover:bg-white group shadow-sm"
                >
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center shadow-sm group-hover:bg-teal-50 transition-colors">
                    <service.icon className="w-8 h-8 text-teal-600" />
                  </div>
                  <span className="text-sm font-black text-slate-900 tracking-tight">{service.label}</span>
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
