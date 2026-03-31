import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ShieldCheck, Info, Check, ChevronRight, ChevronLeft, Volume2, Smartphone, Eye, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function ProfileSetup3() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(auth.currentUser?.displayName || '');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  useEffect(() => {
    if (auth.currentUser?.displayName && !fullName) {
      setFullName(auth.currentUser.displayName);
    }
  }, [auth.currentUser]);
  const [preferences, setPreferences] = useState({
    voiceAlerts: true,
    vibrationFeedback: false,
    highContrast: false,
    simplifiedMode: false,
    language: 'English (UK)',
  });
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!fullName || !emergencyContactName || !emergencyContactPhone) {
      toast.error('Please fill in all identity and safety fields');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      await updateDoc(doc(db, 'users', user.uid), {
        fullName,
        emergencyContactName,
        emergencyContactPhone,
        preferences,
        isVolunteer: false,
        setupComplete: true,
      });

      toast.success('Profile setup complete!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col">
      {/* Header */}
      <header className="bg-white px-8 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="text-2xl font-bold text-[#006D6D]">Sahayak</div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-400">Step 3 of 3</span>
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#006D6D] rounded-full" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-16 grid md:grid-cols-2 gap-12">
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Final Touches</h1>
            <p className="text-gray-500 leading-relaxed">
              Let's personalize your Sahayak experience to ensure every journey is safe and comfortable.
            </p>
          </motion.div>

          {/* Identity & Safety */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-sm space-y-6 border border-transparent hover:border-[#006D6D]/10 transition-all"
          >
            <h3 className="font-bold text-xl mb-4">Identity & Safety</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aditi Sharma"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/20 focus:border-[#006D6D] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Emergency Contact Name</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/20 focus:border-[#006D6D] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+91 00000 00000"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/20 focus:border-[#006D6D] transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Assistance Preferences */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-3xl shadow-sm space-y-6 border border-transparent hover:border-[#006D6D]/10 transition-all"
          >
            <h3 className="font-bold text-xl mb-4">Assistance Preferences</h3>
            
            <div className="space-y-4">
              {[
                { 
                  id: 'voiceAlerts', 
                  label: 'Enable Voice Alerts', 
                  desc: 'Real-time audio navigation cues', 
                  icon: Volume2, 
                  color: 'bg-blue-100 text-blue-600' 
                },
                { 
                  id: 'vibrationFeedback', 
                  label: 'Vibration Feedback', 
                  desc: 'Haptic alerts for key directions', 
                  icon: Smartphone, 
                  color: 'bg-purple-100 text-purple-600' 
                },
                { 
                  id: 'highContrast', 
                  label: 'High Contrast by Default', 
                  desc: 'Optimized visibility for all screens', 
                  icon: Eye, 
                  color: 'bg-teal-100 text-[#006D6D]' 
                }
              ].map((pref) => (
                <motion.div 
                  key={pref.id}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", pref.color)}>
                      <pref.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{pref.label}</div>
                      <div className="text-[10px] text-gray-400">{pref.desc}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPreferences(p => ({ ...p, [pref.id]: !p[pref.id as keyof typeof p] }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      preferences[pref.id as keyof typeof preferences] ? "bg-[#006D6D]" : "bg-gray-300"
                    )}
                  >
                    <motion.div 
                      animate={{ x: preferences[pref.id as keyof typeof preferences] ? 24 : 0 }}
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.5 }}
            className="bg-[#006D6D] p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-teal-900/20"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">Your Sahayak is ready!</h2>
              <p className="text-white/80 text-lg mb-10 leading-relaxed">
                Everything is set up. You can now start your first journey with personalized accessibility supports active.
              </p>
              <div className="bg-white/10 p-4 rounded-2xl flex items-start gap-3 border border-white/10">
                <Info className="w-5 h-5 text-white/60 mt-0.5" />
                <p className="text-sm text-white/80">Settings can be changed anytime in your profile.</p>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </motion.div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 relative overflow-hidden group">
            <h4 className="font-bold text-xl mb-2">Journey Smart</h4>
            <p className="text-sm text-gray-500 max-w-[200px]">Our AI adapts to your unique walking pace and mobility needs.</p>
            <div className="absolute bottom-4 right-4 text-gray-100 group-hover:text-gray-200 transition-colors">
              <Navigation className="w-24 h-24" />
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-5 rounded-3xl bg-[#006D6D] text-white font-bold text-xl flex items-center justify-center gap-3 hover:bg-[#005a5a] transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-teal-900/20"
            >
              {loading ? 'Finalizing...' : 'Complete Setup'}
              {!loading && <ChevronRight className="w-6 h-6" />}
            </button>
            <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
              By completing setup, you agree to Sahayak's <br />
              <span className="font-bold">Terms of Empathetic Service.</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
