import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Search, Bell, User, MapPin, Navigation, ShieldAlert, HeartPulse, 
  MessageSquare, ChevronRight, Globe, Info, Sparkles, Map as MapIcon, 
  Accessibility, Sun, Moon, Volume2, Type, Eye, Hand, Ear, Brain, 
  Save, RotateCcw, Menu, Play, Video, CheckCircle, Trash2, 
  Settings2, Award, BarChart2, Heart, ArrowUpRight, AlertTriangle, 
  LayoutGrid, History, Smartphone, Mic, VolumeX, EyeOff, 
  Fingerprint, Headphones, Zap, HelpCircle, Check, Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
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
  const [islActive, setIslActive] = useState(true);

  const profiles = [
    { id: 'visual', label: 'Visual', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 'hearing', label: 'Hearing', icon: Ear, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
    { id: 'motor', label: 'Motor', icon: Hand, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { id: 'cognitive', label: 'Cognitive', icon: Brain, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100' },
  ];

  const applyProfile = (id: string) => {
    setActiveProfile(id);
    toast.success(`${id.charAt(0).toUpperCase() + id.slice(1)} profile applied!`);
    // Logic to update multiple settings at once based on profile
    if (id === 'visual') {
      handleUpdate({ highContrast: true });
    } else if (id === 'hearing') {
      handleUpdate({ vibrationFeedback: true, voiceAlerts: false });
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (updates: Partial<UserProfile['preferences']>) => {
    if (!profile) return;
    const newProfile = {
      ...profile,
      preferences: { ...profile.preferences, ...updates }
    };
    setProfile(newProfile);
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

      <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto pb-32">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 mb-6 -mx-4 md:-mx-8 -mt-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-50 text-gray-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg">Accessibility</h1>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-10 h-10 rounded-xl bg-[#006D6D] text-white flex items-center justify-center shadow-lg shadow-teal-900/10 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
          </button>
        </header>

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
                    <span className="text-[#006D6D] font-black text-xl">125%</span>
                  </div>
                  <div className="relative flex items-center h-2">
                    <div className="absolute w-full h-full bg-gray-100 rounded-full" />
                    <div className="absolute w-[25%] h-full bg-[#006D6D] rounded-full" />
                    <input 
                      type="range" 
                      min="100" 
                      max="200" 
                      value="125" 
                      step="25" 
                      className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
                      onChange={(e) => toast.info(`Text size: ${e.target.value}%`)}
                    />
                    <div className="absolute left-[25%] -translate-x-1/2 w-6 h-6 bg-white border-4 border-[#006D6D] rounded-full shadow-md" />
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
                      onClick={() => toast.info('Screen reader optimization enabled')}
                      className="w-14 h-8 rounded-full bg-gray-200 relative"
                    >
                      <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-bold text-lg block">Color Blindness Filters</label>
                  <div className="flex flex-wrap gap-3">
                    {['None', 'Protanopia', 'Deuteranopia', 'Tritanopia'].map((mode) => (
                      <button
                        key={mode}
                        className={cn(
                          "px-6 py-2 rounded-full font-bold text-xs transition-all",
                          mode === 'None' ? "bg-[#006D6D] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
                <div className="p-8 bg-gray-50 rounded-[32px] flex flex-col justify-between h-56 group hover:bg-white hover:shadow-xl hover:shadow-teal-900/5 transition-all cursor-pointer border border-transparent hover:border-teal-500/10">
                  <div className="flex justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Mic className="w-7 h-7" />
                    </div>
                    <button className="w-14 h-7 rounded-full bg-gray-200 relative">
                      <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Voice Control</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">Navigate the app using spoken commands and gestures.</p>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 rounded-[32px] flex flex-col justify-between h-56 group hover:bg-white hover:shadow-xl hover:shadow-teal-900/5 transition-all cursor-pointer border border-transparent hover:border-teal-500/10">
                  <div className="flex justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 text-[#006D6D] flex items-center justify-center">
                      <LayoutGrid className="w-7 h-7" />
                    </div>
                    <button className="w-14 h-7 rounded-full bg-[#006D6D] relative">
                      <div className="absolute top-1 left-8 w-5 h-5 rounded-full bg-white shadow-sm" />
                    </button>
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
                  onClick={() => setIslActive(!islActive)}
                  className={cn(
                    "w-16 h-8 rounded-full transition-all relative",
                    islActive ? "bg-teal-500" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm",
                    islActive ? "left-9" : "left-1"
                  )} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                <div className="lg:col-span-7 aspect-video rounded-[32px] bg-black/40 overflow-hidden relative shadow-2xl group cursor-pointer">
                  <img 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800" 
                    alt="ISL Interpretation" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold tracking-widest uppercase">Live Interpretation Active</span>
                    </div>
                    <p className="text-white/60 text-xs">Connecting you with a certified ISL interpreter...</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current" />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-8">
                  <h4 className="text-xl font-bold">How it works</h4>
                  <div className="space-y-6">
                    {[
                      { num: '01', text: 'Enable ISL toggle to see sign language icons next to all announcements.' },
                      { num: '02', text: 'Tap the icon to open a floating video guide for station directions.' },
                      { num: '03', text: 'Connect with a live interpreter for complex transit assistance.' }
                    ].map((step) => (
                      <div key={step.num} className="flex gap-4">
                        <span className="text-teal-500 font-black text-lg">{step.num}</span>
                        <p className="text-teal-100/70 text-sm leading-relaxed">{step.text}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-4 bg-white text-teal-900 rounded-2xl font-bold hover:bg-teal-50 transition-all shadow-xl shadow-black/20">
                    View ISL Tutorial
                  </button>
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
                          "font-bold transition-all",
                          profile?.preferences?.highContrast ? "text-white text-xl" : "text-white/90 text-lg"
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
                        <div className="text-lg font-bold text-white">Uneven Surface</div>
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
                    onClick={() => toast.info('AI Assistant coming soon')}
                    className="w-full py-5 rounded-3xl bg-gray-50 text-[#006D6D] font-bold text-sm hover:bg-[#006D6D] hover:text-white transition-all flex items-center justify-center gap-3 group shadow-sm"
                  >
                    <MessageSquare className="w-5 h-5" /> Chat with Assistant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Bar */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50"
        >
          <div className="bg-white/80 backdrop-blur-2xl p-4 md:p-6 rounded-[40px] border border-white shadow-2xl flex items-center justify-between gap-6">
            <div className="hidden md:flex items-center gap-8 text-gray-400 font-bold text-xs uppercase tracking-widest px-4">
              <button className="hover:text-[#006D6D] transition-colors flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Help
              </button>
              <button className="hover:text-[#006D6D] transition-colors flex items-center gap-2">
                <Heart className="w-4 h-4" /> Feedback
              </button>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 md:flex-none px-8 py-4 rounded-3xl font-bold text-gray-500 hover:bg-gray-50 transition-colors text-sm"
              >
                Reset
              </button>
              <button 
                onClick={saveSettings}
                disabled={saving}
                className="flex-1 md:flex-none px-12 py-4 rounded-3xl bg-[#006D6D] text-white font-bold shadow-xl shadow-teal-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
