import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Bell, User, MapPin, Navigation, ShieldAlert, HeartPulse, MessageSquare, ChevronRight, Globe, Info, Sparkles, Map as MapIcon, Mic, Accessibility, Sun, Moon, Plus, Minus, Target, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function RoutePlanning() {
  const [from, setFrom] = useState('Central Park, NY');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState(['step-free']);

  const sampleRoute: [number, number][] = [
    [40.7128, -74.0060],
    [40.7150, -74.0080],
    [40.7180, -74.0100],
    [40.7200, -74.0120]
  ];

  const toggleFilter = (id: string) => {
    setFilters(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-[#1A1A1A]">
      <Sidebar />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Planning */}
        <div className="w-[450px] bg-white border-r border-gray-100 flex flex-col h-screen overflow-y-auto">
          <header className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="relative w-full max-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for safe routes..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D6D]/10 focus:border-[#006D6D] transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toast.info('Language settings coming soon')}
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#006D6D] transition-colors"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button 
                onClick={() => toast.info('No new notifications')}
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#006D6D] transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
              </button>
            </div>
          </header>

          <div className="p-8 flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Plan Journey</h1>
              <button 
                onClick={() => toast.info('Voice guidance activated')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-[#006D6D] text-[10px] font-bold uppercase tracking-widest"
              >
                <Mic className="w-3 h-3" /> Voice On
              </button>
            </div>

            {/* Route Form */}
            <div className="bg-gray-50 p-6 rounded-3xl space-y-4 relative">
              <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gray-200 border-l border-dashed border-gray-300" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-4 h-4 rounded-full border-2 border-[#006D6D] bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#006D6D]" />
                </div>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full"
                />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-4 h-4 rounded-full border-2 border-[#FF8C42] bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C42]" />
                </div>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Where to?"
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full placeholder:text-gray-400"
                />
              </div>
            </div>

            <button 
              onClick={() => toast.success('Navigation started! Follow the highlighted path.')}
              className="w-full py-4 rounded-2xl bg-[#006D6D] text-white font-bold text-lg hover:bg-[#005a5a] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-teal-900/10"
            >
              Start Navigation
            </button>

            {/* Priority Filters */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority Filters</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'step-free', label: 'Step-free', icon: Accessibility },
                  { id: 'well-lit', label: 'Well-lit', icon: Sun },
                  { id: 'safe-zones', label: 'Safe zones', icon: ShieldAlert },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => toggleFilter(f.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border-2",
                      filters.includes(f.id)
                        ? "bg-[#006D6D] border-[#006D6D] text-white"
                        : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                    )}
                  >
                    <f.icon className="w-3.5 h-3.5" />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Paths */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recommended Paths</h3>
              
              <motion.div
                whileHover={{ y: -5 }}
                onClick={() => toast.success('Selected Best Match route')}
                className="p-6 rounded-3xl border-2 border-[#006D6D] bg-white shadow-lg shadow-teal-900/5 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-[#006D6D] text-white text-[8px] font-bold uppercase tracking-widest">Best Match</div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold">12</span>
                  <span className="text-sm font-bold text-gray-400 mb-1">min</span>
                </div>
                <div className="text-xs text-gray-400 mb-4">0.8 miles • 14:45 Arrival</div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-teal-50 text-[#006D6D] text-[10px] font-bold">
                    <Accessibility className="w-3 h-3" /> Step-free
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 text-[#FF8C42] text-[10px] font-bold">
                    <Sun className="w-3 h-3" /> Well-lit
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                onClick={() => toast.success('Selected Quiet Path route')}
                className="p-6 rounded-3xl border-2 border-gray-50 bg-white hover:border-gray-100 transition-all cursor-pointer"
              >
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold">18</span>
                  <span className="text-sm font-bold text-gray-400 mb-1">min</span>
                </div>
                <div className="text-xs text-gray-400 mb-4">1.2 miles • 14:51 Arrival</div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 text-gray-500 text-[10px] font-bold">
                  <Moon className="w-3 h-3" /> Quiet Path
                </div>
              </motion.div>
            </div>
          </div>

          <div className="p-4">
            <button 
              onClick={() => toast.error('SOS Triggered! Notifying emergency contacts.', { duration: 5000 })}
              className="w-full py-4 rounded-2xl bg-[#DC3545] text-white font-bold flex items-center justify-center gap-3 hover:bg-red-700 transition-colors"
            >
              <ShieldAlert className="w-5 h-5" />
              SOS Emergency
            </button>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative bg-gray-200 overflow-hidden">
          <MapComponent 
            center={[40.7128, -74.0060]}
            zoom={14}
            route={sampleRoute}
            markers={[
              { id: 'start', position: [40.7128, -74.0060], title: 'Start: Central Park' },
              { id: 'end', position: [40.7200, -74.0120], title: 'End: Chelsea' },
              { id: 'hazard-1', position: [40.7160, -74.0090], title: 'Uneven Path', severity: 'high', description: 'Construction work ahead' }
            ]}
          />

          {/* Live Insight Overlay */}
          <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 max-w-[300px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-[#006D6D]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Live AI Insight</div>
                <div className="text-sm font-bold">Path Clear & Accessible</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-gray-400">Crowd Density</span>
                  <span className="text-teal-500">Very Low (8%)</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[8%] bg-teal-500 rounded-full" />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 italic leading-relaxed">
                "Weather is dry. All elevators on this route are reported operational as of 5 mins ago."
              </p>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-4">
            <div className="flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
              <button 
                onClick={() => toast.info('Zoom in')}
                className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <Plus className="w-6 h-6" />
              </button>
              <button 
                onClick={() => toast.info('Zoom out')}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-6 h-6" />
              </button>
            </div>
            <button 
              onClick={() => toast.info('Recenter to my location')}
              className="w-14 h-14 rounded-2xl bg-[#006D6D] text-white shadow-xl flex items-center justify-center hover:bg-[#005a5a] transition-all transform hover:scale-105"
            >
              <Target className="w-7 h-7" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Path Legend</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-1.5 rounded-full bg-[#006D6D]" />
                <span className="text-xs font-bold">Accessible (Step-free)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-1.5 rounded-full bg-[#FF8C42] opacity-60" />
                <span className="text-xs font-bold">Caution (Partial Stairs)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-1.5 rounded-full bg-red-500" />
                <span className="text-xs font-bold">Obstacle (Construction)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
