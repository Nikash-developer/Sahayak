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
  User as UserIcon, Award,
  BarChart2, Heart, ArrowUpRight, AlertTriangle,
  LayoutGrid, History
} from 'lucide-react';
import { WheelchairIcon } from '../components/WheelchairIcon';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [evidence, setEvidence] = useState<{
    photos: string[];
    video: string | null;
    voiceNote: string | null;
  }>({
    photos: [],
    video: null,
    voiceNote: null
  });
  
  const [newHazard, setNewHazard] = useState({
    type: 'flooding',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    location: { latitude: 19.0760, longitude: 72.8777, address: 'Main St. & 4th Avenue' }
  });

  useEffect(() => {
    if (userCoords && typeof userCoords.latitude === 'number' && typeof userCoords.longitude === 'number') {
      setNewHazard(prev => ({
        ...prev,
        location: {
          ...prev.location,
          latitude: userCoords.latitude,
          longitude: userCoords.longitude
        }
      }));
    }
  }, [userCoords]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleFileUpload = (type: 'photos' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'photos' ? 'image/*' : 'video/*';
    if (type === 'photos') input.multiple = true;
    
    input.onchange = (e: any) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (type === 'photos') {
        const newPhotos = Array.from(files).map(file => URL.createObjectURL(file as File));
        setEvidence(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos].slice(0, 5) }));
        toast.success(`${files.length} photo(s) added`);
      } else {
        const videoUrl = URL.createObjectURL(files[0]);
        setEvidence(prev => ({ ...prev, video: videoUrl }));
        toast.success('Video added');
      }
    };
    input.click();
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info('Recording voice note...');
    } else {
      setIsRecording(false);
      setEvidence(prev => ({ ...prev, voiceNote: 'simulated_voice_note_url' }));
      toast.success('Voice note recorded');
    }
  };

  const removeEvidence = (type: 'photos' | 'video' | 'voiceNote', index?: number) => {
    if (type === 'photos' && typeof index === 'number') {
      setEvidence(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }));
    } else {
      setEvidence(prev => ({ ...prev, [type]: null }));
    }
  };

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
        evidence: {
          photos: evidence.photos,
          video: evidence.video,
          voiceNote: evidence.voiceNote
        },
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
        <Header onMenuClick={() => setSidebarOpen(true)} title="Hazard Reporting" />

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
                      onClick={toggleRecording}
                      className={cn(
                        "absolute bottom-6 right-6 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all transform active:scale-95",
                        isRecording ? "bg-red-500 animate-pulse" : "bg-indigo-600 hover:bg-indigo-700"
                      )}
                    >
                      {isRecording ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4 text-white" />}
                      <span className="text-xs font-bold text-white">
                        {isRecording ? `Recording... ${recordingDuration}s` : 'Record Voice Note'}
                      </span>
                    </button>
                  </div>

                  {/* Evidence Preview */}
                  {(evidence.photos.length > 0 || evidence.video || evidence.voiceNote) && (
                    <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                      {evidence.photos.map((photo, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden group">
                          <img src={photo} alt="Evidence" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeEvidence('photos', idx)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                      {evidence.video && (
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden group bg-black">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <button 
                            onClick={() => removeEvidence('video')}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      )}
                      {evidence.voiceNote && (
                        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                          <Volume2 className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-bold text-indigo-700">Voice Note</span>
                          <button onClick={() => removeEvidence('voiceNote')}>
                            <X className="w-4 h-4 text-indigo-400 hover:text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleFileUpload('photos')}
                      className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-teal-500/30 transition-all group"
                    >
                      <Camera className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-600">Upload Photos</p>
                        <p className="text-[10px] text-slate-400 font-medium">Max 5MB</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleFileUpload('video')}
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
              {/* Community Impact & Support */}
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <HeartPulse className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Community Support</h2>
                    <p className="text-xs text-slate-400">How your report helps others</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Impact</span>
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 text-[10px] font-black rounded-full">HIGH</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-slate-900">150+</span>
                      <span className="text-sm font-bold text-slate-500 mb-1">users affected daily</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-900 px-1">Nearby Volunteers</h4>
                    <div className="flex -space-x-3 overflow-hidden p-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-slate-200 overflow-hidden">
                          <img 
                            src={`https://i.pravatar.cc/100?u=vol${i}`} 
                            alt="Volunteer" 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white ring-4 ring-white text-[10px] font-bold">
                        +12
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-1">
                      17 verified volunteers are currently within 500m and have been alerted to assist users near this hazard.
                    </p>
                  </div>

                  <button 
                    onClick={() => toast.success('Support request broadcasted to nearby volunteers')}
                    className="w-full py-4 bg-teal-50 text-teal-700 rounded-2xl font-bold text-xs hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" /> Request Immediate Support
                  </button>
                </div>
              </div>

              {/* Dynamic Safety Tips */}
              <div className="bg-orange-50 p-8 rounded-[2.5rem] shadow-sm border border-orange-100 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold mb-6 flex items-center gap-2 text-lg text-orange-900">
                    <ShieldAlert className="w-6 h-6 text-orange-600" />
                    Safety Tips: {HAZARD_CATEGORIES.find(c => c.id === newHazard.type)?.label}
                  </h3>
                  <div className="space-y-4">
                    {newHazard.type === 'flooding' && (
                      <>
                        <div className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-orange-800/80 leading-relaxed">Avoid walking through moving water; even 6 inches can knock you down.</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-orange-800/80 leading-relaxed">Be aware of potential electrical hazards from submerged power lines.</p>
                        </div>
                      </>
                    )}
                    {newHazard.type === 'broken_path' && (
                      <>
                        <div className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-orange-800/80 leading-relaxed">Use the 'Alternative Route' feature in Sahayak to bypass this section.</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-orange-800/80 leading-relaxed">If using a wheelchair, proceed with extreme caution or request volunteer assistance.</p>
                        </div>
                      </>
                    )}
                    {(!['flooding', 'broken_path'].includes(newHazard.type)) && (
                      <>
                        <div className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-orange-800/80 leading-relaxed">Maintain a safe distance from the hazard and follow local safety signs.</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-orange-800/80 leading-relaxed">Alert others nearby who might not have seen the hazard yet.</p>
                        </div>
                      </>
                    )}
                  </div>
                  <hr className="my-6 border-orange-200" />
                  <p className="text-[10px] leading-relaxed text-orange-700/60 italic">
                    Safety tips are curated by Sahayak's accessibility experts and community leaders.
                  </p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl"></div>
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
