import { motion, AnimatePresence } from 'framer-motion';
import { Siren, X, Phone, AlertTriangle, Shield, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: [number, number] | null;
}

export default function SOSModal({ isOpen, onClose, userCoords }: SOSModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [isTriggered, setIsTriggered] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0 && !isTriggered) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && !isTriggered) {
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isTriggered]);

  const triggerSOS = async () => {
    setIsTriggered(true);
    setIsSending(true);
    
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'emergency_alerts'), {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || 'Anonymous User',
          location: userCoords ? {
            lat: userCoords[0],
            lng: userCoords[1]
          } : null,
          timestamp: serverTimestamp(),
          status: 'active',
          type: 'SOS'
        });
      }
      
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSent(true);
      toast.success('Emergency alert sent successfully!');
    } catch (error) {
      console.error('Error sending SOS:', error);
      toast.error('Failed to send SOS alert. Please call emergency services directly.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    if (!isTriggered) {
      onClose();
      setCountdown(5);
    }
  };

  const handleCallEmergency = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/80 backdrop-blur-sm"
            onClick={handleCancel}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-red-600 p-8 text-white text-center relative">
              {!isTriggered && (
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Siren className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black font-headline uppercase tracking-tight">Emergency SOS</h2>
              <p className="text-red-100 font-medium mt-2">Immediate assistance requested</p>
            </div>

            <div className="p-8">
              {!isTriggered ? (
                <div className="text-center">
                  <div className="text-6xl font-black text-red-600 mb-4 tabular-nums">
                    {countdown}
                  </div>
                  <p className="text-slate-600 font-medium mb-8">
                    Sending emergency alert in {countdown} seconds...
                  </p>
                  
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel Alert
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {isSending ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-900 font-bold text-xl">Sending Alert...</p>
                      <p className="text-slate-500 text-sm mt-2">Broadcasting your location to emergency services</p>
                    </div>
                  ) : isSent ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <p className="text-slate-900 font-bold text-xl">Alert Broadcasted</p>
                      <p className="text-slate-500 text-sm mt-2">Help is on the way. Stay where you are if safe.</p>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleCallEmergency('112')}
                      className="flex items-center justify-between p-5 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-red-900">Call Emergency (112)</p>
                          <p className="text-xs text-red-700 font-medium">National Emergency Number</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => handleCallEmergency('100')}
                      className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-slate-900">Call Police (100)</p>
                          <p className="text-xs text-slate-500 font-medium">Local Police Assistance</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-4">
                    <MapPin className="w-6 h-6 text-orange-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-orange-900 uppercase tracking-widest">Your Location</p>
                      <p className="text-sm font-medium text-orange-800 mt-1">
                        {userCoords ? `${userCoords[0].toFixed(4)}, ${userCoords[1].toFixed(4)}` : 'Detecting...'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
