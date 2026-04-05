import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Search, Bell, User, MapPin, Navigation, ShieldAlert, HeartPulse, 
  MessageSquare, ChevronRight, Globe, Info, Sparkles, Map as MapIcon, 
  Sun, Moon, Volume2, Type, Eye, Hand, Ear, Brain, 
  Save, RotateCcw, Menu, Play, Video, CheckCircle, Trash2, 
  Settings2, Award, BarChart2, Heart, ArrowUpRight, AlertTriangle, 
  LayoutGrid, History, Smartphone, Mic, VolumeX, EyeOff, 
  Fingerprint, Headphones, Zap, HelpCircle, Check, Loader2
} from 'lucide-react';
import { WheelchairIcon } from '../components/WheelchairIcon';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function AccessibilitySettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const profiles = [
    { id: 'visual', label: 'Visual', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'High contrast & large text' },
    { id: 'hearing', label: 'Hearing', icon: Ear, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', desc: 'Vibration & ISL support' },
    { id: 'motor', label: 'Motor', icon: Hand, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', desc: 'Voice & gesture control' },
    { id: 'cognitive', label: 'Cognitive', icon: Brain, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100', desc: 'Simplified & focused UI' },
  ];

  const applyProfile = (id: string) => {
    setActiveProfile(id);
    
    const basePrefs = profile?.preferences || {
      voiceAlerts: false,
      vibrationFeedback: false,
      highContrast: false,
      simplifiedMode: false,
      language: 'en',
      textSize: 100,
      screenReader: false,
      colorBlindMode: 'None' as const,
      voiceControl: false,
      islSupport: false
    };

    let updates: Partial<UserProfile['preferences']> = {};

    if (id === 'visual') {
      updates = { highContrast: true, textSize: 150, screenReader: true, colorBlindMode: 'None' };
    } else if (id === 'hearing') {
      updates = { vibrationFeedback: true, voiceAlerts: false, islSupport: true };
    } else if (id === 'motor') {
      updates = { voiceControl: true, simplifiedMode: true };
    } else if (id === 'cognitive') {
      updates = { simplifiedMode: true, voiceAlerts: true };
    }

    handleUpdate(updates);
    toast.success(`${id.charAt(0).toUpperCase() + id.slice(1)} profile applied!`, {
      description: "Settings have been auto-configured for your needs."
    });
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          // Ensure all preferences exist
          const defaultPrefs = {
            voiceAlerts: false,
            vibrationFeedback: false,
            highContrast: false,
            simplifiedMode: false,
            language: 'en',
            textSize: 100,
            screenReader: false,
            colorBlindMode: 'None' as const,
            voiceControl: false,
            islSupport: false,
            ...data.preferences
          };
          setProfile({ ...data, preferences: defaultPrefs });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = (updates: Partial<UserProfile['preferences']>) => {
    if (!profile) return;
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        preferences: { ...prev.preferences, ...updates }
      };
    });
  };

  const resetSettings = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
        setActiveProfile(null);
        toast.info('Settings reset to last saved state');
      }
    } catch (error) {
      toast.error('Failed to reset settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    const user = auth.currentUser;
    if (!user || !profile) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        preferences: profile.preferences
      });
      toast.success('Accessibility settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-[#F8F9FA] flex font-sans text-[#1A1A1A] min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          title="Accessibility"
          rightElement={
            <div className="flex items-center gap-3">
              <button
                onClick={resetSettings}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-colors"
              >
                Reset
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-[#006D6D] text-white font-bold text-sm shadow-lg shadow-teal-900/10 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          }
        />

        <div className="pt-20 p-4 md:p-8 lg:p-12 pb-32">
          {/* Hero Section - Editorial Style */}
        <section className="mb-16 space-y-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-600 w-fit text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            Personalized Experience
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter leading-[0.9] text-[#1A1A1A]">
            Designed for <span className="text-[#006D6D] italic underline decoration-teal-500/20 underline-offset-8">Everyone.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Customize your Sahayak experience to match your unique needs. Your preferences help us guide you better through the urban landscape.
          </p>
        </section>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-12">
            
            {/* Quick Setup Profiles */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Setup Profiles
                </h3>
                <span className="text-xs text-gray-400 font-medium">Select a preset to auto-configure</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyProfile(p.id)}
                    className={cn(
                      "p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group",
                      activeProfile === p.id 
                        ? "bg-[#006D6D] border-[#006D6D] text-white shadow-xl shadow-teal-900/20" 
                        : "bg-white border-gray-100 hover:border-teal-500/30 text-gray-600"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      activeProfile === p.id ? "bg-white/20" : p.bg
                    )}>
                      <p.icon className={cn("w-6 h-6", activeProfile === p.id ? "text-white" : p.color)} />
                    </div>
                    <span className="font-bold text-sm">{p.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Visual Assistance */}
            <section className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Eye className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Visual Accessibility</h2>
                  <p className="text-xs text-gray-400">Optimize display for clarity and comfort</p>
                </div>
              </div>

              <div className="space-y-12">
                {/* Text Size Slider */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="font-bold text-lg">Text Size Adjustment</label>
                    <span className="text-[#006D6D] font-black text-xl">{profile?.preferences?.textSize || 100}%</span>
                  </div>
                  <div className="relative flex items-center h-2">
                    <div className="absolute w-full h-full bg-gray-100 rounded-full" />
                    <div 
                      className="absolute h-full bg-[#006D6D] rounded-full transition-all duration-300" 
                      style={{ width: `${((profile?.preferences?.textSize || 100) - 100) / (200 - 100) * 100}%` }}
                    />
                    <input 
                      type="range" 
                      min="100" 
                      max="200" 
                      value={profile?.preferences?.textSize || 100} 
                      step="25" 
                      className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleUpdate({ textSize: parseInt(e.target.value) })}
                    />
                    <div 
                      className="absolute w-6 h-6 bg-white border-4 border-[#006D6D] rounded-full shadow-md transition-all duration-300" 
                      style={{ left: `calc(${((profile?.preferences?.textSize || 100) - 100) / (200 - 100) * 100}% - 12px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    <span>100%</span>
                    <span>125%</span>
                    <span>150%</span>
                    <span>175%</span>
                    <span>200%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-teal-500/20 transition-all">
                    <div className="space-y-1">
                      <h4 className="font-bold">High Contrast</h4>
                      <p className="text-[10px] text-gray-400">Enhance UI visibility</p>
                    </div>
                    <button
                      onClick={() => handleUpdate({ highContrast: !profile?.preferences?.highContrast })}
                      className={cn(
                        "w-14 h-8 rounded-full transition-all relative",
                        profile?.preferences?.highContrast ? "bg-[#006D6D]" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm",
                        profile?.preferences?.highContrast ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-teal-500/20 transition-all">
                    <div className="space-y-1">
                      <h4 className="font-bold">Screen Reader</h4>
                      <p className="text-[10px] text-gray-400">Optimized for TalkBack/VoiceOver</p>
                    </div>
                    <button
                      onClick={() => handleUpdate({ screenReader: !profile?.preferences?.screenReader })}
                      className={cn(
                        "w-14 h-8 rounded-full transition-all relative",
                        profile?.preferences?.screenReader ? "bg-[#006D6D]" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm",
                        profile?.preferences?.screenReader ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-bold text-lg block">Color Blindness Filters</label>
                  <div className="flex flex-wrap gap-3">
                    {['None', 'Protanopia', 'Deuteranopia', 'Tritanopia'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleUpdate({ colorBlindMode: mode as any })}
                        className={cn(
                          "px-6 py-2 rounded-full font-bold text-xs transition-all",
                          profile?.preferences?.colorBlindMode === mode ? "bg-[#006D6D] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Interaction Control */}
            <section className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Hand className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Interaction Control</h2>
                  <p className="text-xs text-gray-400">Customize how you interact with the app</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => handleUpdate({ voiceControl: !profile?.preferences?.voiceControl })}
                  className={cn(
                    "p-8 rounded-[32px] flex flex-col justify-between h-56 transition-all cursor-pointer border",
                    profile?.preferences?.voiceControl 
                      ? "bg-orange-50 border-orange-200 shadow-lg shadow-orange-900/5" 
                      : "bg-gray-50 border-transparent hover:border-teal-500/10"
                  )}
                >
                  <div className="flex justify-between">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      profile?.preferences?.voiceControl ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-600"
                    )}>
                      <Mic className="w-7 h-7" />
                    </div>
                    <div className={cn(
                      "w-14 h-7 rounded-full transition-all relative",
                      profile?.preferences?.voiceControl ? "bg-orange-500" : "bg-gray-200"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                        profile?.preferences?.voiceControl ? "left-8" : "left-1"
                      )} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Voice Control</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">Navigate the app using spoken commands and gestures.</p>
                  </div>
                </div>

                <div 
                  onClick={() => handleUpdate({ simplifiedMode: !profile?.preferences?.simplifiedMode })}
                  className={cn(
                    "p-8 rounded-[32px] flex flex-col justify-between h-56 transition-all cursor-pointer border",
                    profile?.preferences?.simplifiedMode 
                      ? "bg-teal-50 border-teal-200 shadow-lg shadow-teal-900/5" 
                      : "bg-gray-50 border-transparent hover:border-teal-500/10"
                  )}
                >
                  <div className="flex justify-between">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      profile?.preferences?.simplifiedMode ? "bg-[#006D6D] text-white" : "bg-teal-100 text-[#006D6D]"
                    )}>
                      <LayoutGrid className="w-7 h-7" />
                    </div>
                    <div className={cn(
                      "w-14 h-7 rounded-full transition-all relative",
                      profile?.preferences?.simplifiedMode ? "bg-[#006D6D]" : "bg-gray-200"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                        profile?.preferences?.simplifiedMode ? "left-8" : "left-1"
                      )} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Simplified Mode</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">Reduces clutter and focuses on core journey actions.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ISL Support Section */}
            <section className="bg-teal-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 blur-[120px] opacity-20" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black font-headline">ISL Support</h3>
                    <p className="text-teal-300/60 text-sm">Indian Sign Language video interpretation</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUpdate({ islSupport: !profile?.preferences?.islSupport })}
                  className={cn(
                    "w-16 h-8 rounded-full transition-all relative",
                    profile?.preferences?.islSupport ? "bg-teal-500" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm",
                    profile?.preferences?.islSupport ? "left-9" : "left-1"
                  )} />
                </button>
              </div>

              <div className="space-y-12 relative z-10">
                <div className="w-full aspect-video rounded-[40px] bg-black/40 overflow-hidden relative shadow-2xl group border-4 border-white/10">
                  <iframe
                    className="w-full h-full border-none"
                    src="https://www.youtube.com/embed/_xId8cP7rXg"
                    title="Indian Sign Language Tutorial"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 pointer-events-none">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full animate-pulse",
                        profile?.preferences?.islSupport ? "bg-red-500" : "bg-gray-500"
                      )} />
                      <span className="text-sm font-black tracking-widest uppercase text-white">
                        {profile?.preferences?.islSupport ? "Live Interpretation Active" : "Interpretation Offline"}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm font-medium">
                      {profile?.preferences?.islSupport 
                        ? "Watch the tutorial below to master essential transit signs." 
                        : "Enable ISL support to unlock full sign language navigation features."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                  <div className="space-y-8">
                    <h4 className="text-2xl font-black font-headline">Master ISL Navigation</h4>
                    <div className="space-y-6">
                      {[
                        { num: '01', text: 'Enable ISL toggle to see sign language icons next to all announcements.' },
                        { num: '02', text: 'Tap the icon to open a floating video guide for station directions.' },
                        { num: '03', text: 'Connect with a live interpreter for complex transit assistance.' }
                      ].map((step) => (
                        <div key={step.num} className="flex gap-6 items-start">
                          <span className="text-teal-400 font-black text-2xl leading-none">{step.num}</span>
                          <p className="text-teal-100/80 text-base leading-relaxed">{step.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <h5 className="font-bold text-lg">Quick Actions</h5>
                    <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={() => setShowTutorial(true)}
                        className="w-full py-4 bg-white text-teal-900 rounded-2xl font-bold hover:bg-teal-50 transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        <Play className="w-5 h-5 fill-current" /> Full Screen Tutorial
                      </button>
                      <button 
                        onClick={() => handleUpdate({ islSupport: !profile?.preferences?.islSupport })}
                        className={cn(
                          "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border-2",
                          profile?.preferences?.islSupport 
                            ? "bg-teal-500/20 border-teal-500 text-teal-300" 
                            : "bg-transparent border-white/20 text-white hover:border-white/40"
                        )}
                      >
                        {profile?.preferences?.islSupport ? <CheckCircle className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                        {profile?.preferences?.islSupport ? 'ISL Enabled' : 'Enable ISL Support'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Preview Panel */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-8 space-y-8">
              <div className="bg-[#1A1A1A] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#006D6D] blur-[100px] opacity-20" />
                
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#006D6D]" />
                    Live Preview
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Active
                  </div>
                </div>
                
                <div className="space-y-6 relative z-10">
                  <motion.div 
                    layout
                    className={cn(
                      "p-8 rounded-[32px] border transition-all duration-500",
                      profile?.preferences?.highContrast 
                        ? "bg-black border-white/40" 
                        : "bg-white/5 border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#006D6D] flex items-center justify-center shadow-lg shadow-teal-900/40">
                        <Navigation className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Next Step</div>
                        <div className={cn(
                          "font-bold transition-all duration-300",
                          profile?.preferences?.highContrast ? "text-white" : "text-white/90",
                          (profile?.preferences?.textSize || 100) <= 100 && "text-lg",
                          (profile?.preferences?.textSize || 100) === 125 && "text-xl",
                          (profile?.preferences?.textSize || 100) === 150 && "text-2xl",
                          (profile?.preferences?.textSize || 100) === 175 && "text-3xl",
                          (profile?.preferences?.textSize || 100) >= 200 && "text-4xl",
                        )}>Turn Right in 20m</div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '66%' }}
                        className="h-full bg-[#006D6D] rounded-full" 
                      />
                    </div>
                  </motion.div>

                  <div className="p-8 rounded-[32px] bg-red-500/10 border border-red-500/20 backdrop-blur-md">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-900/40">
                        <AlertTriangle className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Hazard Alert</div>
                        <div className={cn(
                          "font-bold text-white transition-all duration-300",
                          (profile?.preferences?.textSize || 100) <= 100 && "text-lg",
                          (profile?.preferences?.textSize || 100) === 125 && "text-xl",
                          (profile?.preferences?.textSize || 100) === 150 && "text-2xl",
                          (profile?.preferences?.textSize || 100) === 175 && "text-3xl",
                          (profile?.preferences?.textSize || 100) >= 200 && "text-4xl",
                        )}>Uneven Surface</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-white/5 text-center">
                  <p className="text-[10px] text-white/30 italic leading-relaxed px-4">
                    "This preview adapts in real-time to your selected accessibility settings."
                  </p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-4">Need Help?</h3>
                  <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    Our AI assistant can help you find the perfect settings for your specific needs.
                  </p>
                  <button 
                    onClick={() => setShowHelp(true)}
                    className="w-full py-5 rounded-3xl bg-gray-50 text-[#006D6D] font-bold text-sm hover:bg-[#006D6D] hover:text-white transition-all flex items-center justify-center gap-3 group shadow-sm"
                  >
                    <MessageSquare className="w-5 h-5" /> Chat with Assistant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {(showHelp || showFeedback || showTutorial) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={() => {
                setShowHelp(false);
                setShowFeedback(false);
                setShowTutorial(false);
              }}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[48px] p-10 max-w-2xl w-full shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 blur-[100px] opacity-50" />
                
                <div className="relative z-10">
                  {showHelp && (
                    <div className="space-y-6">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mb-8">
                        <HelpCircle className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-black font-headline">Accessibility Help</h2>
                      <div className="space-y-4 text-gray-500 leading-relaxed">
                        <p>Our accessibility settings are designed to make Sahayak usable for everyone. Here's a quick guide:</p>
                        <ul className="space-y-3 list-disc list-inside">
                          <li><span className="font-bold text-gray-700">Visual:</span> Adjust text size, contrast, and color filters.</li>
                          <li><span className="font-bold text-gray-700">Hearing:</span> Enable ISL support and vibration feedback.</li>
                          <li><span className="font-bold text-gray-700">Motor:</span> Use voice commands and simplified layouts.</li>
                          <li><span className="font-bold text-gray-700">Cognitive:</span> Reduce clutter and enable focused navigation.</li>
                        </ul>
                        <div className="pt-6">
                          <button 
                            onClick={() => {
                              setShowHelp(false);
                              setShowTutorial(true);
                            }}
                            className="flex items-center gap-2 text-[#006D6D] font-bold hover:underline"
                          >
                            <Play className="w-4 h-4" /> Watch ISL Tutorial
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showFeedback && (
                    <div className="space-y-6">
                      <div className="w-16 h-16 rounded-3xl bg-pink-50 text-pink-500 flex items-center justify-center mb-8">
                        <Heart className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-black font-headline">Share Your Feedback</h2>
                      <p className="text-gray-500 leading-relaxed">
                        We are constantly improving Sahayak. If you have suggestions for new accessibility features or improvements, we'd love to hear from you.
                      </p>
                      <textarea 
                        placeholder="Tell us how we can improve..."
                        className="w-full h-32 p-6 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-teal-500/20 text-sm resize-none"
                      />
                      <button 
                        onClick={() => {
                          toast.success('Thank you for your feedback!');
                          setShowFeedback(false);
                        }}
                        className="w-full py-5 bg-[#006D6D] text-white rounded-2xl font-bold shadow-xl shadow-teal-900/20"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}

                  {showTutorial && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#006D6D] flex items-center justify-center">
                            <Play className="w-7 h-7" />
                          </div>
                          <h2 className="text-4xl font-black font-headline">ISL Masterclass</h2>
                        </div>
                      </div>
                      <div className="aspect-video rounded-[40px] bg-black overflow-hidden shadow-2xl border-4 border-gray-50">
                        <iframe
                          className="w-full h-full border-none"
                          src="https://www.youtube.com/embed/_xId8cP7rXg?autoplay=1"
                          title="Indian Sign Language Tutorial"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="bg-gray-50 p-8 rounded-[32px] space-y-4">
                        <h4 className="font-bold text-lg">What you'll learn:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 text-gray-600">
                            <CheckCircle className="w-5 h-5 text-teal-500" /> Basic Greetings
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <CheckCircle className="w-5 h-5 text-teal-500" /> Transit Directions
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <CheckCircle className="w-5 h-5 text-teal-500" /> Emergency Signs
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <CheckCircle className="w-5 h-5 text-teal-500" /> Station Navigation
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setShowHelp(false);
                      setShowFeedback(false);
                      setShowTutorial(false);
                    }}
                    className="mt-10 w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
