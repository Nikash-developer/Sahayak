import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Bell, User, MapPin, Navigation, ShieldAlert, 
  HeartPulse, MessageSquare, ChevronRight, Globe, Info, 
  Sparkles, Map as MapIcon, Plus, Camera, Mic, Filter, 
  CheckCircle2, Clock, Map as MapIcon2, 
  Menu, X, Volume2, Play, Loader2, Construction, 
  Droplets, Image as ImageIcon, Ban, Sun, TrendingUp, 
  Zap, Video, Trophy, CheckCircle, Trash2, Settings2,
  Accessibility, User as UserIcon, Award,
  BarChart2, Heart, ArrowUpRight, AlertTriangle,
  LayoutGrid, History
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { HazardReport } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';

const HAZARD_CATEGORIES = [
  { id: 'construction', label: 'Construction', icon: Construction },
  { id: 'flooding', label: 'Flooding', icon: Droplets },
  { id: 'broken_path', label: 'Broken Path', icon: ImageIcon },
  { id: 'obstacle', label: 'Obstacle', icon: Ban },
  { id: 'lighting', label: 'Poor Lighting', icon: Sun },
  { id: 'incline', label: 'Steep Incline', icon: ArrowUpRight },
  { id: 'slippery', label: 'Slippery', icon: AlertTriangle },
  { id: 'other', label: 'Other', icon: Plus },
];

export default function HazardReports() {
  const navigate = useNavigate();
  const { coordinates: userCoords } = useGeolocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newHazard, setNewHazard] = useState({
    type: 'flooding',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    location: { latitude: 19.0760, longitude: 72.8777, address: 'Main St. & 4th Avenue' }
  });

  const handleReport = async () => {
    if (!newHazard.description) {
      toast.error('Please describe the hazard');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in to report a hazard');
        return;
      }

      await addDoc(collection(db, 'hazards'), {
        ...newHazard,
        reporterUid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast.success('Hazard reported successfully!', {
        description: 'You earned +25 XP for your contribution.'
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to report hazard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex font-body text-[#1a1c1c]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search hazards or areas..."
                className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 ring-teal-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-teal-600 transition-colors">
              <Accessibility className="w-5 h-5" />
            </button>
            <button className="text-slate-500 hover:text-teal-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-100 overflow-hidden border border-teal-200">
                <img 
                  src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=User&background=006d6d&color=fff`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 max-w-6xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full mb-4 uppercase tracking-widest">
                Live Safety Reporting
              </span>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2 font-headline">Report a Hazard</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Help your community by identifying obstacles. Your contribution improves accessibility for everyone in real-time.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Contributor Points</p>
                <p className="text-2xl font-black text-teal-700">+25 XP</p>
              </div>
              <div className="w-12 h-12 bg-teal-700 flex items-center justify-center rounded-2xl text-white shadow-lg shadow-teal-900/20">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Reporting Form Area */}
            <div className="lg:col-span-8 space-y-8">
              {/* Hazard Type Grid */}
              <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">What kind of hazard is it?</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {HAZARD_CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNewHazard({ ...newHazard, type: cat.id })}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 aspect-square rounded-[2.5rem] transition-all border-2 group",
                        newHazard.type === cat.id 
                          ? "bg-white border-orange-500 shadow-xl shadow-orange-900/10" 
                          : "bg-slate-50 border-transparent hover:bg-white hover:border-orange-200"
                      )}
                    >
                      <cat.icon className={cn(
                        "w-8 h-8 mb-3 transition-colors",
                        newHazard.type === cat.id ? "text-orange-600" : "text-slate-400 group-hover:text-orange-400"
                      )} />
                      <span className={cn(
                        "text-xs font-bold text-center leading-tight",
                        newHazard.type === cat.id ? "text-slate-900" : "text-slate-500"
                      )}>{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Details & Evidence */}
              <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Info className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Add details and evidence</h3>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Describe the situation</label>
                    <textarea 
                      value={newHazard.description}
                      onChange={(e) => setNewHazard({ ...newHazard, description: e.target.value })}
                      className="w-full min-h-[180px] bg-slate-50 border-none rounded-[2rem] p-6 focus:ring-2 ring-teal-600 text-slate-900 text-sm placeholder:text-slate-400"
                      placeholder="Describe the hazard to help others navigate better..."
                    />
                    <button 
                      onClick={() => toast.info('Voice recording started')}
                      className="absolute bottom-6 right-6 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition-all transform active:scale-95"
                    >
                      <Mic className="w-4 h-4" />
                      <span className="text-xs font-bold">Record Voice Note</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => toast.info('Photo upload triggered')}
                      className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-teal-500/30 transition-all group"
                    >
                      <Camera className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-600">Upload Photos</p>
                        <p className="text-[10px] text-slate-400 font-medium">Max 5MB</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => toast.info('Video upload triggered')}
                      className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-teal-500/30 transition-all group"
                    >
                      <Video className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-600">Upload Video</p>
                        <p className="text-[10px] text-slate-400 font-medium">Up to 15 sec</p>
                      </div>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Contextual Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Location Card */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    Location
                  </h3>
                  <button className="text-orange-600 text-xs font-bold hover:underline">Adjust</button>
                </div>
                <div className="h-48 rounded-[2rem] bg-slate-100 mb-4 overflow-hidden relative group">
                  <img 
                    src="https://picsum.photos/seed/mumbai-map/800/600" 
                    alt="Map View" 
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white animate-bounce">
                      <History className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{newHazard.location.address}</p>
                  <p className="text-[10px] text-slate-400 font-medium italic mt-1">Detected within 5 meters</p>
                </div>
              </div>

              {/* Impact Analysis */}
              <div className="bg-teal-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-teal-900/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold mb-6 flex items-center gap-2 text-lg">
                    <TrendingUp className="w-6 h-6 text-teal-400" />
                    Impact Analysis
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-teal-100/70 font-medium">Affects Wheelchairs</span>
                      <CheckCircle className="w-5 h-5 text-orange-400 fill-orange-400/20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-teal-100/70 font-medium">Visual Impairment Risk</span>
                      <CheckCircle className="w-5 h-5 text-orange-400 fill-orange-400/20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-teal-100/70 font-medium">Delayed Routes</span>
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur-md">+4 mins</span>
                    </div>
                  </div>
                  <hr className="my-6 border-white/10" />
                  <p className="text-[10px] leading-relaxed text-teal-100/50 italic">
                    Our AI validates reports based on similar crowdsourced data to maintain high trust scores.
                  </p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl"></div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button 
                  onClick={handleReport}
                  disabled={isSubmitting}
                  className="w-full py-5 bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-teal-900/20 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  Submit Hazard Report
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-bold hover:bg-slate-200 transition-colors"
                >
                  Discard Draft
                </button>
              </div>

              {/* Points Summary Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                  <HeartPulse className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Community Reward</p>
                  <p className="text-[10px] text-slate-500 font-medium">Points unlock local transit passes</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Success Pulse Indicator */}
      <div className="fixed bottom-8 right-8 pointer-events-none z-50">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 bg-indigo-500/20 rounded-full animate-ping"></div>
          <div className="relative w-12 h-12 bg-white shadow-2xl rounded-full flex items-center justify-center text-indigo-600 border border-indigo-50">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
