import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, User, Contrast, Type, Globe, ShieldAlert } from 'lucide-react';
import { WheelchairIcon } from './WheelchairIcon';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  showSearch?: boolean;
  rightElement?: React.ReactNode;
}

export default function Header({ onMenuClick, title, showSearch = true, rightElement }: HeaderProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

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

    fetchProfile();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    toast.info(`Searching for "${searchQuery}"...`, {
      description: "Finding accessible routes and services.",
    });
    
    // Navigate to route planning with search query
    navigate('/route-planning', { state: { searchService: searchQuery } });
  };

  const notifications = [
    { id: 1, title: 'New Hazard Reported', desc: 'Flooding detected near your usual route.', time: '2m ago', type: 'warning' },
    { id: 2, title: 'Route Updated', desc: 'A more accessible path is available for your saved trip.', time: '15m ago', type: 'info' },
    { id: 3, title: 'Volunteer Nearby', desc: 'A verified volunteer is available to assist at Central Station.', time: '1h ago', type: 'success' },
  ];

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 border-b border-slate-200/50 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {title ? (
          <h1 className="text-lg font-bold text-teal-800 font-headline hidden md:block">{title}</h1>
        ) : (
          <div className="flex flex-col hidden md:flex">
            <h1 className="text-base font-bold text-teal-700 font-headline leading-none">
              Hello, {profile?.fullName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-[10px] text-slate-500 font-body">Ready to navigate safely?</p>
          </div>
        )}

        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden sm:block">
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
          </form>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <div className="hidden sm:flex items-center gap-1">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/accessibility')}
            title="Accessibility Settings"
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <WheelchairIcon className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toast.info('Language settings coming soon')}
            title="Language"
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <Globe className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">3 New</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                            n.type === 'warning' ? "bg-orange-500" : n.type === 'success' ? "bg-teal-500" : "bg-blue-500"
                          )} />
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-900 leading-none">{n.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{n.desc}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      toast.info('All notifications marked as read');
                    }}
                    className="w-full py-3 text-xs font-bold text-teal-600 hover:bg-teal-50 transition-colors border-t border-slate-50"
                  >
                    View All Notifications
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/settings')}
          title="Profile Settings"
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

        {rightElement}
      </div>
    </header>
  );
}
