import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Bell, User, MapPin, Navigation, ShieldAlert, HeartPulse, MessageSquare, ChevronRight, Globe, Info, Sparkles, Map as MapIcon, Settings as SettingsIcon, LogOut, Shield, CreditCard, BellRing, Smartphone, Trash2, Camera, Mail, Phone, Lock, Menu, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error('Failed to sign out');
    }
  };

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user || !profile) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: profile.fullName,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-[#F8F9FA] flex font-sans text-[#1A1A1A]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 mb-6 -mx-4 md:-mx-8 -mt-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-50 text-gray-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg">Settings</h1>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-10 h-10 rounded-xl bg-[#006D6D] text-white flex items-center justify-center shadow-lg shadow-teal-900/10 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
          </button>
        </header>

        <header className="hidden lg:flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4B3F72] text-white flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">General Settings</h1>
              <p className="text-sm text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-[#006D6D] text-white font-bold text-sm hover:bg-[#005a5a] transition-all flex items-center gap-2 shadow-lg shadow-teal-900/10 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Settings */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Profile Section */}
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Profile Information</h2>
                </div>
              </div>

              <div className="flex items-center gap-8 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[32px] bg-gray-100 overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid || 'arjun'}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button 
                    onClick={() => toast.info('Profile picture update coming soon')}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-[#006D6D] transition-all group-hover:scale-110"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        value={profile?.fullName || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/10 focus:border-[#006D6D] transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                      <input
                        type="email"
                        value={auth.currentUser?.email || ''}
                        disabled
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 text-sm font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Emergency Contact</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profile?.emergencyContactName || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, emergencyContactName: e.target.value } : null)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/10 focus:border-[#006D6D] transition-all text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={profile?.emergencyContactPhone || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, emergencyContactPhone: e.target.value } : null)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/10 focus:border-[#006D6D] transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Security & Privacy */}
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Security & Privacy</h2>
              </div>

              <div className="space-y-6">
                <button 
                  onClick={() => toast.info('Password reset link sent to your email')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#006D6D] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-sm">Change Password</h4>
                      <p className="text-[10px] text-gray-400">Update your security credentials</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#006D6D] transition-all" />
                </button>

                <button 
                  onClick={() => toast.info('Two-factor authentication setup coming soon')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#006D6D] transition-colors">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-sm">Two-Factor Authentication</h4>
                      <p className="text-[10px] text-gray-400">Add an extra layer of security</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#006D6D] transition-all" />
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar Settings */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => toast.info('Subscription management coming soon')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  Manage Subscription
                </button>
                <button 
                  onClick={() => toast.info('Notification preferences coming soon')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-orange-50 text-orange-600 font-bold text-sm hover:bg-orange-100 transition-all"
                >
                  <BellRing className="w-5 h-5" />
                  Notification Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 blur-[80px] opacity-20" />
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500">
                <ShieldAlert className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-white/40 mb-8 leading-relaxed">
                Deleting your account will permanently remove all your data, including saved routes and preferences.
              </p>
              <button 
                onClick={() => toast.error('Account deletion is a permanent action. Please contact support to proceed.')}
                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>

            <div className="p-8 text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sahayak v1.0.4</div>
              <div className="flex items-center justify-center gap-4 text-gray-400">
                <button 
                  onClick={() => toast.info('Privacy Policy')}
                  className="text-[10px] font-bold hover:text-[#006D6D] transition-colors"
                >
                  Privacy Policy
                </button>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <button 
                  onClick={() => toast.info('Terms of Service')}
                  className="text-[10px] font-bold hover:text-[#006D6D] transition-colors"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
