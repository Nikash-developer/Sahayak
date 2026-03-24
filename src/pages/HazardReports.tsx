import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { Search, Bell, User, MapPin, Navigation, ShieldAlert, HeartPulse, MessageSquare, ChevronRight, Globe, Info, Sparkles, Map as MapIcon, Plus, Camera, Mic, Filter, AlertTriangle, CheckCircle2, Clock, Map as MapIcon2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';
import { auth, db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { HazardReport } from '../types';
import { HAZARD_TYPES } from '../constants';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function HazardReports() {
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [newHazard, setNewHazard] = useState({
    type: '' as any,
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    location: { latitude: 40.7128, longitude: -74.0060, address: 'Current Location' }
  });

  useEffect(() => {
    const q = query(collection(db, 'hazards'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HazardReport));
      setHazards(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHazard.type || !newHazard.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, 'hazards'), {
        ...newHazard,
        reporterUid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast.success('Hazard reported successfully. Thank you for helping the community!');
      setIsReporting(false);
      setNewHazard({
        type: '' as any,
        description: '',
        severity: 'medium',
        location: { latitude: 40.7128, longitude: -74.0060, address: 'Current Location' }
      });
    } catch (error) {
      toast.error('Failed to report hazard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-[#1A1A1A]">
      <Sidebar />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Hazard List */}
        <div className="w-[450px] bg-white border-r border-gray-100 flex flex-col h-screen overflow-y-auto">
          <header className="p-8 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
            <h1 className="text-3xl font-bold">Hazards</h1>
            <button
              onClick={() => setIsReporting(true)}
              className="w-12 h-12 rounded-2xl bg-[#006D6D] text-white flex items-center justify-center shadow-lg shadow-teal-900/10 hover:bg-[#005a5a] transition-all transform hover:scale-105"
            >
              <Plus className="w-6 h-6" />
            </button>
          </header>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter hazards..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/10 focus:border-[#006D6D] transition-all text-sm"
                />
              </div>
              <button 
                onClick={() => toast.info('Filter options coming soon')}
                className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#006D6D] transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {hazards.map((hazard) => {
                const typeInfo = HAZARD_TYPES.find(t => t.id === hazard.type);
                const Icon = typeInfo?.icon || AlertTriangle;
                
                return (
                  <motion.div
                    key={hazard.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    onClick={() => toast.info(`Viewing details for ${typeInfo?.label || 'hazard'}`)}
                    className={cn(
                      "p-6 rounded-[32px] border-2 transition-all cursor-pointer relative overflow-hidden",
                      hazard.severity === 'high' ? "bg-red-50 border-red-100" : "bg-white border-gray-50 shadow-sm"
                    )}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        hazard.severity === 'high' ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-lg">{typeInfo?.label || 'Unknown Hazard'}</h4>
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest",
                            hazard.severity === 'high' ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"
                          )}>
                            {hazard.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <MapPin className="w-3 h-3" /> {hazard.location.address}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{hazard.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <Clock className="w-3 h-3" /> 
                        {hazard.createdAt instanceof Timestamp ? hazard.createdAt.toDate().toLocaleTimeString() : 'Just now'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#006D6D]">
                        <CheckCircle2 className="w-3 h-3" /> 12 Verified
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Map & Reporting */}
        <div className="flex-1 relative bg-gray-200 overflow-hidden">
          <MapComponent 
            markers={hazards.map(h => ({
              id: h.id,
              position: [h.location.latitude, h.location.longitude] as [number, number],
              title: h.type,
              description: h.description,
              severity: h.severity
            }))}
            center={[40.7128, -74.0060]}
            zoom={13}
          />

          {/* Report Modal */}
          <AnimatePresence>
            {isReporting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm"
              >
                <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-3xl font-bold">Report New Hazard</h2>
                    <button onClick={() => setIsReporting(false)} className="text-gray-400 hover:text-gray-600">
                      <Plus className="w-8 h-8 rotate-45" />
                    </button>
                  </div>

                  <form onSubmit={handleReport} className="p-8 space-y-8 overflow-y-auto">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hazard Type</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {HAZARD_TYPES.map(type => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setNewHazard({ ...newHazard, type: type.id })}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                              newHazard.type === type.id
                                ? "bg-[#006D6D] border-[#006D6D] text-white"
                                : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                            )}
                          >
                            <type.icon className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</h3>
                      <textarea
                        value={newHazard.description}
                        onChange={(e) => setNewHazard({ ...newHazard, description: e.target.value })}
                        placeholder="Describe the hazard and how it affects accessibility..."
                        className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/10 focus:border-[#006D6D] transition-all text-sm min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Severity</h3>
                        <div className="flex gap-2">
                          {['low', 'medium', 'high'].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setNewHazard({ ...newHazard, severity: s as any })}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all",
                                newHazard.severity === s
                                  ? "bg-red-500 border-red-500 text-white"
                                  : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evidence</h3>
                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={() => toast.info('Camera access requested')}
                            className="flex-1 py-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 flex items-center justify-center gap-2 hover:border-[#006D6D] hover:text-[#006D6D] transition-all"
                          >
                            <Camera className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Photo</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={() => toast.info('Microphone access requested')}
                            className="flex-1 py-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 flex items-center justify-center gap-2 hover:border-[#006D6D] hover:text-[#006D6D] transition-all"
                          >
                            <Mic className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Voice</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-2xl bg-[#006D6D] text-white font-bold text-lg hover:bg-[#005a5a] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-teal-900/10"
                      >
                        Submit Report
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map Controls */}
          <div className="absolute top-8 right-8 flex flex-col gap-4">
            <button 
              onClick={() => toast.info('Map layer selection coming soon')}
              className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-[#006D6D] transition-all"
            >
              <MapIcon2 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => toast.info('Recenter map')}
              className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-gray-600 hover:text-[#006D6D] transition-all"
            >
              <Navigation className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute bottom-8 right-8">
            <button
              onClick={() => setIsReporting(true)}
              className="px-8 py-4 rounded-full bg-red-500 text-white font-bold flex items-center gap-3 shadow-xl shadow-red-900/20 hover:bg-red-600 transition-all transform hover:scale-105"
            >
              <AlertTriangle className="w-5 h-5" />
              Report Hazard Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
