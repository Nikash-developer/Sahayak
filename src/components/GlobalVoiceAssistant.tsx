import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const GlobalVoiceAssistant: React.FC = () => {
  const { isListening, startListening, stopListening, lastTranscript, isSupported } = useVoice();
  const [showUI, setShowUI] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isListening) {
      setShowUI(true);
    }
  }, [isListening]);

  useEffect(() => {
    if (lastTranscript) {
      // Global commands
      if (lastTranscript.includes('go to dashboard') || lastTranscript.includes('open dashboard')) {
        navigate('/dashboard');
        toast.success('Navigating to Dashboard');
      } else if (lastTranscript.includes('go to navigation') || lastTranscript.includes('open navigation')) {
        navigate('/route-planning');
        toast.success('Navigating to Route Planning');
      } else if (lastTranscript.includes('go to hazards') || lastTranscript.includes('open hazards')) {
        navigate('/hazard-reports');
        toast.success('Navigating to Hazard Reports');
      } else if (lastTranscript.includes('go to settings') || lastTranscript.includes('open settings')) {
        navigate('/settings');
        toast.success('Navigating to Settings');
      } else if (lastTranscript.includes('help')) {
        toast.info('Voice Commands: "Go to Dashboard", "Open Navigation", "Start Navigation", "Recenter Map", "Cancel Navigation"', {
          duration: 5000,
        });
      }
    }
  }, [lastTranscript, navigate]);

  if (!isSupported) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-[9999]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isListening ? stopListening : startListening}
          className={cn(
            "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all group relative",
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-[#006D6D] text-white"
          )}
        >
          {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          <span className="absolute right-full mr-4 px-4 py-2 bg-slate-800 text-white text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none font-medium">
            {isListening ? 'Stop Listening' : 'Voice Assistant'}
          </span>
        </motion.button>
      </div>

      {/* Voice Assistant UI Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-md px-4"
          >
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl p-6 flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">Voice Assistant</span>
                </div>
                <button onClick={stopListening} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="relative w-24 h-24 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-teal-500/20 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-4 bg-teal-500/10 rounded-full"
                />
                <div className="relative z-10 w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Mic className="w-6 h-6" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-slate-900">Listening...</p>
                <p className="text-sm text-slate-500 italic">
                  {lastTranscript ? `"${lastTranscript}"` : 'Try saying "Go to Dashboard"'}
                </p>
              </div>

              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-teal-500 to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalVoiceAssistant;
