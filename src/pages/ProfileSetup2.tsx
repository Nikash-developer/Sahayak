import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  User, Info, Check, ChevronRight, 
  ChevronLeft, MapPin, Navigation, ShieldCheck, 
  HeartPulse, Zap, Activity, Users 
} from 'lucide-react';
import { WheelchairIcon } from '../components/WheelchairIcon';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function ProfileSetup2() {
  const navigate = useNavigate();
  const [mobilityAids, setMobilityAids] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const aids = [
    { id: 'wheelchair', label: 'Wheelchair', icon: WheelchairIcon },
    { id: 'scooter', label: 'Motorized Scooter', icon: Zap },
    { id: 'cane', label: 'White Cane', icon: Info },
    { id: 'crutches', label: 'Crutches', icon: User },
    { id: 'walker', label: 'Walker', icon: Navigation },
    { id: 'prosthetic', label: 'Prosthetic Limb', icon: Activity },
    { id: 'service-dog', label: 'Service Dog', icon: HeartPulse },
    { id: 'human-assistant', label: 'Human Assistant', icon: Users },
    { id: 'none', label: 'No mobility aids', icon: ShieldCheck },
  ];

  const toggleAid = (id: string) => {
    if (id === 'none') {
      setMobilityAids(['none']);
      return;
    }
    setMobilityAids(prev => {
      const filtered = prev.filter(i => i !== 'none');
      return filtered.includes(id) ? filtered.filter(i => i !== id) : [...filtered, id];
    });
  };

  const handleContinue = async () => {
    if (mobilityAids.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      await updateDoc(doc(db, 'users', user.uid), {
        mobilityAids,
      });

      navigate('/setup/3');
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
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
          <span className="text-sm font-medium text-gray-400">Step 2 of 3</span>
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[#006D6D] rounded-full" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            What <span className="text-[#FF8C42]">mobility aids</span> <br />
            do you use?
          </h1>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            This helps us prioritize routes with ramps, elevators, and tactile paths tailored to your equipment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aids.map((aid, i) => {
            const isSelected = mobilityAids.includes(aid.id);
            
            return (
              <motion.div
                key={aid.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggleAid(aid.id)}
                className={cn(
                  "relative p-8 rounded-3xl cursor-pointer transition-all border-2 flex flex-col items-center text-center",
                  isSelected 
                    ? "bg-white border-[#006D6D] shadow-xl shadow-teal-900/5" 
                    : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors",
                  isSelected ? "bg-[#006D6D] text-white" : "bg-gray-50 text-gray-400"
                )}>
                  <aid.icon className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl mb-2">{aid.label}</h3>
                
                <div className={cn(
                  "absolute top-6 right-6 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  isSelected ? "bg-[#006D6D] border-[#006D6D] text-white" : "border-gray-200"
                )}>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white px-8 py-6 border-t border-gray-100 flex items-center justify-between">
        <button 
          onClick={() => navigate('/setup/1')}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={loading}
          className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-[#006D6D] text-white font-bold text-lg hover:bg-[#005a5a] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-teal-900/10"
        >
          {loading ? 'Saving...' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
