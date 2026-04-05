import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Eye, Ear, Brain, User, Info, Check, Sparkles, Mic, Stethoscope } from 'lucide-react';
import { WheelchairIcon } from '../components/WheelchairIcon';
import { DISABILITY_OPTIONS } from '../constants';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function ProfileSetup1() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleOption = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'user',
        disabilities: selected,
        createdAt: Timestamp.now(),
      }, { merge: true });

      navigate('/setup/2');
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const icons: Record<string, any> = { Eye, Ear, Wheelchair: WheelchairIcon, Brain, User, Info, Sparkles, Mic, Stethoscope };

  return (
    <div className="bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col">
      {/* Header */}
      <header className="bg-white px-8 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="text-2xl font-bold text-[#006D6D]">Sahayak</div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-400">Step 1 of 3</span>
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-[#006D6D] rounded-full" />
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
            How can we <br />
            <span className="text-[#FF8C42]">guide you best?</span>
          </h1>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            Sahayak adapts its navigation, accessibility cues, and emergency triggers based on your specific needs. Select all that apply.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DISABILITY_OPTIONS.map((option, i) => {
            const Icon = icons[option.icon];
            const isSelected = selected.includes(option.id);
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggleOption(option.id)}
                className={cn(
                  "relative p-8 rounded-3xl cursor-pointer transition-all border-2",
                  isSelected 
                    ? "bg-white border-[#006D6D] shadow-xl shadow-teal-900/5" 
                    : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                  isSelected ? "bg-[#006D6D] text-white" : "bg-gray-50 text-gray-400"
                )}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl mb-2">{option.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{option.description}</p>
                
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
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={loading}
          className="px-12 py-4 rounded-2xl bg-[#006D6D] text-white font-bold text-lg hover:bg-[#005a5a] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-teal-900/10"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </footer>
    </div>
  );
}
