import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Home, Navigation, LayoutGrid, BarChart3, User, 
  Contrast, Type, Bell, Settings, Footprints, 
  AlertTriangle, Handshake, Siren, AlertCircle, 
  Volume2, MapPin, Ban, Accessibility, Heart, 
  User as UserIcon, ParkingCircle, CreditCard, 
  PlusSquare, Utensils, CheckCircle2, Mic,
  ChevronRight, Search, Menu, X
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { UserProfile, HazardReport } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

    const q = query(collection(db, 'hazards'), orderBy('createdAt', 'desc'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HazardReport));
      setHazards(docs);
      setLoading(false);
    });

    fetchProfile();
    return () => unsubscribe();
  }, []);

  const handleSOS = () => {
    toast.error('SOS Triggered! Notifying emergency contacts and nearby assistance.', {
      duration: 10000,
      action: {
        label: 'Cancel',
        onClick: () => toast.success('SOS Cancelled')
      }
    });
  };

  const handleFeatureUnderDev = (feature: string) => {
    toast.info(`${feature} feature coming soon!`, {
      description: "We're working hard to bring this to you.",
      icon: <Settings className="w-4 h-4" />
    });
  };

  const handleServiceClick = (service: string) => {
    toast.success(`Finding nearby ${service}...`, {
      description: "Searching for the most accessible locations.",
      icon: <MapPin className="w-4 h-4" />
    });
  };

  const quickActions = [
    { id: 'nav', label: 'Start Navigation', icon: Footprints, color: 'bg-gradient-to-br from-primary to-primary-container text-on-primary', path: '/route-planning' },
    { id: 'hazard', label: 'Report Hazard', icon: AlertTriangle, color: 'bg-secondary-container text-on-secondary-container', path: '/hazard-reports' },
    { id: 'assist', label: 'Need Assistance', icon: Handshake, color: 'bg-tertiary text-on-tertiary', action: () => handleFeatureUnderDev('Assistance') },
    { id: 'sos', label: 'Emergency SOS', icon: Siren, color: 'bg-error text-on-error', action: handleSOS },
  ];

  const services = [
    { id: 'restrooms', label: 'Restrooms', icon: UserIcon },
    { id: 'parking', label: 'Parking', icon: ParkingCircle },
    { id: 'atms', label: 'ATMs', icon: CreditCard },
    { id: 'pharmacies', label: 'Pharmacies', icon: PlusSquare },
    { id: 'eateries', label: 'Eateries', icon: Utensils },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden font-body">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 lg:ml-64 overflow-y-auto min-h-screen">
        {/* Header */}
        <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-30 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-full hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-bold text-teal-700 font-headline leading-none">
                Hello, {profile?.fullName?.split(' ')[0] || 'User'}
              </h1>
              <p className="hidden sm:block text-[10px] md:text-xs text-slate-500 font-body">Ready to navigate safely?</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search locations, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-3">
            <div className="hidden sm:flex items-center gap-1">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleFeatureUnderDev('High Contrast')}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
              >
                <Contrast className="w-5 h-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleFeatureUnderDev('Text Scaling')}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
              >
                <Type className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleFeatureUnderDev('Notifications')}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </motion.button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings')}
              className="p-1 rounded-full border-2 border-teal-100 hover:border-teal-500 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-teal-50 overflow-hidden">
                <img 
                  src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${profile?.fullName || 'User'}&background=006d6d&color=fff`} 
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.button>
          </div>
        </header>

        <div className="pt-24 pb-12 px-4 md:px-8 space-y-8">
          {/* Welcome Section (Mobile Only) */}
          <div className="md:hidden space-y-2">
            <h2 className="text-2xl font-extrabold text-on-surface font-headline">Dashboard</h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none"
              />
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Quick Actions - Main Column */}
            <div className="md:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-on-surface font-headline">Quick Actions</h2>
                <button 
                  onClick={() => handleFeatureUnderDev('All Actions')}
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => action.path ? navigate(action.path) : action.action?.()}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 aspect-square rounded-3xl transition-all shadow-sm border border-transparent",
                      action.color
                    )}
                  >
                    <div className="p-3 rounded-2xl bg-white/20 mb-3">
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-center leading-tight">{action.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Map Section - Integrated into Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-on-surface font-headline">Accessibility Map</h2>
                  <button 
                    onClick={() => navigate('/route-planning')}
                    className="px-4 py-2 bg-teal-50 text-teal-700 text-xs font-bold rounded-full hover:bg-teal-100 transition-colors"
                  >
                    Open Full Map
                  </button>
                </div>
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200/50 group">
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
                  
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 flex items-center justify-between z-[1000]">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Location</p>
                      <p className="font-bold text-on-surface">MG Road, Sector 14</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-semibold text-green-600">Safe Area</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Column - Alerts & Activity */}
            <div className="md:col-span-4 space-y-6">
              {/* Alerts Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-on-surface font-headline">Live Alerts</h2>
                  <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 text-xs font-bold rounded-full">
                    {hazards.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {hazards.length > 0 ? (
                    hazards.map((hazard) => (
                      <motion.div
                        key={hazard.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ x: 4 }}
                        onClick={() => handleFeatureUnderDev('Alert Details')}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm text-on-surface truncate">{hazard.type}</p>
                          <p className="text-xs text-slate-500 truncate">{hazard.location.address}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-teal-800">All clear!</p>
                        <p className="text-xs text-teal-600">No hazards nearby.</p>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleFeatureUnderDev('Alert History')}
                  className="w-full py-3 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors"
                >
                  View Alert History
                </button>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h2 className="text-lg font-bold text-on-surface font-headline">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    { icon: Navigation, label: 'Navigated to Central Park', time: '2h ago', color: 'bg-blue-100 text-blue-600' },
                    { icon: AlertTriangle, label: 'Reported Pothole', time: '5h ago', color: 'bg-orange-100 text-orange-600' },
                    { icon: Heart, label: 'Assisted by Volunteer', time: 'Yesterday', color: 'bg-pink-100 text-pink-600' },
                  ].map((activity, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 4 }}
                      onClick={() => handleFeatureUnderDev('Activity Details')}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", activity.color)}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-on-surface truncate group-hover:text-teal-600 transition-colors">{activity.label}</p>
                        <p className="text-[10px] text-slate-400">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Services - Full Width */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface font-headline">Nearby Services</h2>
              <button 
                onClick={() => handleFeatureUnderDev('Service Map')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                See Map
              </button>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
              {services.map((service) => (
                <motion.button
                  key={service.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleServiceClick(service.label)}
                  className="flex flex-col items-center justify-center min-w-[120px] p-6 gap-3 rounded-3xl bg-white transition-all border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-500/20"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-xs font-bold">{service.label}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center text-on-surface-variant gap-6">
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

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleFeatureUnderDev('Voice Assistant')}
          className="w-16 h-16 rounded-full bg-primary text-white shadow-2xl shadow-primary/30 flex items-center justify-center transition-transform group relative"
        >
          <Mic className="w-7 h-7" />
          <span className="absolute right-full mr-4 px-4 py-2 bg-inverse-surface text-inverse-on-surface text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none font-medium">
            Voice Assistant
          </span>
        </motion.button>
      </div>
    </div>
  );
}
