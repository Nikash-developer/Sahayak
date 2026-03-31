import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface VoiceContextType {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  lastTranscript: string;
  isSupported: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      setIsListening(true);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setLastTranscript(transcript);
      
      // Dispatch a custom event for pages to listen to
      const voiceEvent = new CustomEvent('voice-command', { detail: transcript });
      window.dispatchEvent(voiceEvent);
      
      toast.info(`Voice Command: "${transcript}"`, {
        icon: '🎙️',
        duration: 2000,
      });
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please check permissions.');
      }
    };

    setRecognition(recognitionInstance);
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start recognition', err);
      }
    } else if (!isSupported) {
      toast.error('Voice recognition is not supported in this browser.');
    }
  }, [recognition, isListening, isSupported]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  return (
    <VoiceContext.Provider value={{ isListening, startListening, stopListening, lastTranscript, isSupported }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
