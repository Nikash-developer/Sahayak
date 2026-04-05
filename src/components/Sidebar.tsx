import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Navigation, AlertTriangle, User, LogOut } from 'lucide-react';
import { WheelchairIcon } from './WheelchairIcon';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error('Failed to sign out');
    }
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/route-planning', icon: Navigation, label: 'Navigation' },
    { to: '/accessibility', icon: WheelchairIcon, label: 'Accessibility' },
    { to: '/hazard-reports', icon: AlertTriangle, label: 'Hazard Report' },
    { to: '/settings', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "h-screen w-64 fixed left-0 top-0 z-50 bg-slate-50 flex flex-col py-4 border-r border-slate-200/50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="text-2xl font-bold text-teal-900 px-6 py-8 tracking-tight font-headline flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Sahayak
            <p className="text-xs font-normal text-slate-500 font-body mt-1">Accessible Mobility</p>
          </motion.div>
          {onClose && (
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="lg:hidden p-2 rounded-full hover:bg-slate-200 text-slate-500"
            >
              <LogOut className="w-5 h-5 rotate-180" />
            </motion.button>
          )}
        </div>
        
        <nav className="flex-1 flex flex-col">
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 px-6 py-4 transition-all duration-200 group relative",
                  isActive 
                    ? "text-teal-800 font-semibold" 
                    : "text-slate-600 hover:bg-slate-200"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-teal-50 border-r-4 border-teal-700"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors relative z-10",
                      isActive ? "text-teal-700" : "group-hover:text-teal-700"
                    )} />
                    <span className="text-sm font-medium relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="px-6 py-4 mt-auto space-y-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-slate-200/50 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-teal-100 overflow-hidden border border-teal-200">
              <img 
                src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${profile?.fullName || 'User'}&background=006d6d&color=fff`} 
                alt={profile?.fullName || 'User'} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{profile?.fullName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">Premium Member</p>
            </div>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all font-medium group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm">Sign Out</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
}
