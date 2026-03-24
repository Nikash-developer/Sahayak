import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Bell, User, MapPin, Navigation, ShieldAlert, HeartPulse, MessageSquare, ChevronRight, Globe, Info, Sparkles, Map as MapIcon, Accessibility, Sun, Moon, Volume2, Type, Eye, Hand, Ear, Brain, Save, RotateCcw } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-[#1A1A1A]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#006D6D] text-white flex items-center justify-center">
              <Accessibility className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Accessibility Settings</h1>
              <p className="text-sm text-gray-400">Personalize your Sahayak experience</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-white border border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-[#006D6D] text-white font-bold text-sm hover:bg-[#005a5a] transition-all flex items-center gap-2 shadow-lg shadow-teal-900/10 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Settings Sections */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Visual Assistance */}
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Visual Assistance</h2>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">High Contrast Mode</h4>
                    <p className="text-xs text-gray-400">Enhance visibility of UI elements</p>
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

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">Text Size</h4>
                    <p className="text-xs text-gray-400">Adjust the size of all text in the app</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
                    <button 
                      onClick={() => toast.info('Decreasing text size')}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-[#006D6D] transition-colors"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold w-12 text-center">100%</span>
                    <button 
                      onClick={() => toast.info('Increasing text size')}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-[#006D6D] transition-colors"
                    >
                      <Type className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">Color Blind Mode</h4>
                    <p className="text-xs text-gray-400">Optimize colors for specific vision needs</p>
                  </div>
                  <select 
                    onChange={(e) => toast.info(`Color blind mode set to: ${e.target.value}`)}
                    className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-[#006D6D]/10"
                  >
                    <option>None</option>
                    <option>Protanopia</option>
                    <option>Deuteranopia</option>
                    <option>Tritanopia</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Audio & Feedback */}
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Audio & Feedback</h2>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">Voice Guidance</h4>
                    <p className="text-xs text-gray-400">Turn on audio instructions for navigation</p>
                  </div>
                  <button
                    onClick={() => {
                      handleUpdate({ voiceAlerts: !profile?.preferences?.voiceAlerts });
                      toast.info(`Voice guidance ${!profile?.preferences?.voiceAlerts ? 'enabled' : 'disabled'}`);
                    }}
                    className={cn(
                      "w-14 h-8 rounded-full transition-all relative",
                      profile?.preferences?.voiceAlerts ? "bg-[#006D6D]" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm",
                      profile?.preferences?.voiceAlerts ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">Haptic Feedback</h4>
                    <p className="text-xs text-gray-400">Vibrate for alerts and navigation cues</p>
                  </div>
                  <button
                    onClick={() => {
                      handleUpdate({ vibrationFeedback: !profile?.preferences?.vibrationFeedback });
                      toast.info(`Haptic feedback ${!profile?.preferences?.vibrationFeedback ? 'enabled' : 'disabled'}`);
                    }}
                    className={cn(
                      "w-14 h-8 rounded-full transition-all relative",
                      profile?.preferences?.vibrationFeedback ? "bg-[#006D6D]" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm",
                      profile?.preferences?.vibrationFeedback ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </section>

            {/* Navigation Preferences */}
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Navigation className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Navigation Preferences</h2>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">Avoid Stairs</h4>
                    <p className="text-xs text-gray-400">Prioritize step-free routes</p>
                  </div>
                  <button 
                    onClick={() => toast.info('Avoid stairs preference updated')}
                    className="w-14 h-8 rounded-full bg-[#006D6D] relative"
                  >
                    <div className="absolute top-1 left-7 w-6 h-6 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">Avoid Crowds</h4>
                    <p className="text-xs text-gray-400">Suggest quieter, less busy paths</p>
                  </div>
                  <button 
                    onClick={() => toast.info('Avoid crowds preference updated')}
                    className="w-14 h-8 rounded-full bg-gray-200 relative"
                  >
                    <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Preview Panel */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              <div className="bg-[#1A1A1A] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#006D6D] blur-[80px] opacity-20" />
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#006D6D]" />
                  Live Preview
                </h3>
                
                <div className="space-y-6">
                  <div className={cn(
                    "p-6 rounded-3xl border transition-all",
                    profile?.preferences?.highContrast 
                      ? "bg-black border-white/20" 
                      : "bg-white/5 border-white/10"
                  )}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#006D6D] flex items-center justify-center">
                        <Navigation className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Navigation</div>
                        <div className="text-sm font-bold">Turn Right in 20m</div>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-[#006D6D] rounded-full" />
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Alert</div>
                        <div className="text-sm font-bold">Uneven Surface Ahead</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <p className="text-[10px] text-white/40 italic leading-relaxed">
                    "This preview reflects how navigation cues and alerts will appear based on your current settings."
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4">Need Help?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Our AI assistant can help you find the perfect settings for your specific needs.
                </p>
                <button 
                  onClick={() => toast.info('AI Assistant coming soon')}
                  className="w-full py-4 rounded-2xl bg-gray-50 text-[#006D6D] font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Chat with Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
