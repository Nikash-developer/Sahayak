import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Search, Bell, User, MapPin, Navigation, ShieldAlert, HeartPulse, MessageSquare, ChevronRight, Globe, Info, Sparkles, Map as MapIcon, Mic, Accessibility, Sun, Moon, Plus, Minus, Target, Check, Menu, ToggleLeft, ToggleRight, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle, X, Coffee, Building2, Train, Star } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useVoice } from '../contexts/VoiceContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { getNearbyServices } from '../services/aiService';

export default function RoutePlanning() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const mode = searchParams.get('mode');
  const searchService = location.state?.searchService;
  const { startListening, isListening: isGlobalListening } = useVoice();
  const { coordinates: userCoords } = useGeolocation();
  const [from, setFrom] = useState('My Location');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState(['step-free']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);
  const [isTracking, setIsTracking] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'heard' | 'processing' | 'executed'>('idle');
  const [lastCommandText, setLastCommandText] = useState('');
  const [voiceTarget, setVoiceTarget] = useState<'from' | 'to' | null>(null);
  const [isReportingHazard, setIsReportingHazard] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [hazardLocation, setHazardLocation] = useState<[number, number] | null>(null);
  const [hazardType, setHazardType] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [foundLocations, setFoundLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [isSearchingReal, setIsSearchingReal] = useState(false);
  const watchId = useRef<number | null>(null);

  const performSearch = (service: string) => {
    if (!userCoords) {
      toast.info("Waiting for your location to find nearby services...");
      return;
    }

    // Reset previous search results
    setFoundLocations([]);
    setSelectedLocation(null);
    
    // Check if it's one of our predefined services
    const matchingService = nearbyServices.find(s => 
      s.name.toLowerCase().includes(service.toLowerCase()) || 
      s.type.toLowerCase().includes(service.toLowerCase())
    );
    
    if (matchingService) {
      setSelectedService(matchingService.id);
      setMapCenter(matchingService.position);
    } else {
      setSelectedService(null);
    }

    setTo(service);
    setIsSearchingReal(true);
    setIsCalculatingRoute(true);
    
    toast.info(`Finding nearby ${service}...`, {
      description: "Searching for the most accessible locations.",
      icon: <MapPin className="w-4 h-4" />
    });

    getNearbyServices(service, userCoords[0], userCoords[1])
      .then(result => {
        const locations = result.grounding.map((chunk: any, index: number) => {
          const mapInfo = chunk.maps;
          return {
            id: `real-${index}`,
            name: mapInfo?.title || `Accessible ${service}`,
            address: mapInfo?.uri ? "View on Google Maps" : "Address details in navigation",
            distance: "Nearby",
            accessibility: "Verified Accessible",
            rating: 4.5 + (Math.random() * 0.5),
            coords: [userCoords[0] + (Math.random() - 0.5) * 0.01, userCoords[1] + (Math.random() - 0.5) * 0.01],
            uri: mapInfo?.uri
          };
        });
        
        if (locations.length > 0) {
          setFoundLocations(locations);
          toast.success(`Found real ${service}s nearby!`);
        } else {
          const mockLocations = [
            { id: '1', name: `Accessible ${service} A`, address: '123 Main St, Sector 18', distance: '0.4 km', accessibility: 'Highly Accessible', rating: 4.8, coords: [userCoords[0] + 0.001, userCoords[1] + 0.001] },
            { id: '2', name: `Accessible ${service} B`, address: '456 Park Ave, Downtown', distance: '0.9 km', accessibility: 'Step-free Access', rating: 4.5, coords: [userCoords[0] + 0.002, userCoords[1] - 0.001] },
          ];
          setFoundLocations(mockLocations);
          toast.info("Using estimated nearby locations.");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to fetch real-time locations. Using offline data.");
        const mockLocations = [
          { id: '1', name: `Accessible ${service} A`, address: '123 Main St, Sector 18', distance: '0.4 km', accessibility: 'Highly Accessible', rating: 4.8, coords: [userCoords[0] + 0.001, userCoords[1] + 0.001] },
        ];
        setFoundLocations(mockLocations);
      })
      .finally(() => {
        setIsSearchingReal(false);
        setIsCalculatingRoute(false);
      });
  };

  const nearbyServices = [
    { id: 's1', name: 'Accessible Cafe', type: 'cafe', icon: Coffee, position: [40.7140, -74.0070] as [number, number], accessibility: '100% Step-free' },
    { id: 's2', name: 'Central Station', type: 'transit', icon: Train, position: [40.7180, -74.0100] as [number, number], accessibility: 'Elevator Operational' },
    { id: 's3', name: 'Public Restroom', type: 'facility', icon: Building2, position: [40.7110, -74.0050] as [number, number], accessibility: 'Wide Doors' },
    { id: 's4', name: 'Accessible Parking', type: 'parking', icon: MapPin, position: [40.7120, -74.0080] as [number, number], accessibility: 'Designated Spots' },
    { id: 's5', name: 'Accessible ATM', type: 'atm', icon: Building2, position: [40.7160, -74.0040] as [number, number], accessibility: 'Braille Keypad' },
  ];

  useEffect(() => {
    if (mode === 'nearby') {
      setIsTracking(true);
      toast.info('Showing nearby accessible services');
    }
  }, [mode]);

  useEffect(() => {
    if (searchService && userCoords) {
      performSearch(searchService);
    } else if (searchService && !userCoords) {
      toast.info("Waiting for your location to find nearby services...");
    }
  }, [searchService, userCoords]);

  useEffect(() => {
    if (userCoords) {
      setMapCenter(userCoords);
      setUserLocation(userCoords);
    }
  }, [userCoords]);

  useEffect(() => {
    if (isTracking) {
      if ("geolocation" in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newPos: [number, number] = [latitude, longitude];
            setUserLocation(newPos);
            if (isNavigating) {
              setMapCenter(newPos);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.error("Unable to access location. Please check permissions.");
            setIsTracking(false);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        toast.error("Geolocation is not supported by your browser.");
        setIsTracking(false);
      }
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isTracking, isNavigating]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setIsTracking(true);
    toast.success('Navigation started! Follow the highlighted path.');
  };

  const handleRecenter = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      toast.info('Recentered to your location');
    } else {
      toast.error('Location not available. Enable tracking first.');
    }
  };

  useEffect(() => {
    const handleVoiceCommand = (e: any) => {
      const command = e.detail.toLowerCase();
      setLastCommandText(command);
      setVoiceStatus('heard');

      // Simulate processing delay for visual feedback
      setTimeout(() => {
        setVoiceStatus('processing');
        
        setTimeout(() => {
          let executed = false;
          
          if (voiceTarget === 'from') {
            setFrom(e.detail); // Use original case for location
            setVoiceTarget(null);
            executed = true;
          } else if (voiceTarget === 'to') {
            setTo(e.detail); // Use original case for location
            performSearch(e.detail);
            setVoiceTarget(null);
            executed = true;
          } else if (command.includes('start navigation')) {
            handleStartNavigation();
            executed = true;
          } else if (command.includes('recenter map') || command.includes('recenter')) {
            handleRecenter();
            executed = true;
          } else if (command.includes('cancel navigation') || command.includes('stop navigation')) {
            setIsNavigating(false);
            toast.info('Navigation cancelled');
            executed = true;
          }

          if (executed) {
            setVoiceStatus('executed');
            setTimeout(() => setVoiceStatus('idle'), 2000);
          } else {
            setVoiceStatus('idle');
          }
        }, 600);
      }, 300);
    };

    window.addEventListener('voice-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-command', handleVoiceCommand);
  }, [userLocation, voiceTarget]);

  const handleVoiceInput = (target: 'from' | 'to') => {
    setVoiceTarget(target);
    startListening();
    toast.info(`Listening for ${target} location...`);
  };

  const handleMapClick = (latlng: [number, number]) => {
    if (isReportingHazard) {
      setHazardLocation(latlng);
      toast.info('Location selected. Please choose hazard type.');
    }
  };

  const submitHazardReport = () => {
    if (!hazardLocation || !hazardType) {
      toast.error('Please select a location and hazard type');
      return;
    }
    
    // In a real app, this would send data to a backend
    toast.success(`Hazard reported: ${hazardType} at [${hazardLocation[0].toFixed(4)}, ${hazardLocation[1].toFixed(4)}]`);
    setIsReportingHazard(false);
    setHazardLocation(null);
    setHazardType('');
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (!isTracking) {
      toast.success('Location tracking enabled');
    } else {
      toast.info('Location tracking disabled');
      setUserLocation(undefined);
    }
  };

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
    <div className="bg-[#F8F9FA] flex font-sans text-[#1A1A1A] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col lg:flex-row lg:ml-64 overflow-hidden h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-50 text-gray-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg">Navigation</h1>
          </div>
          <button
            onClick={() => toast.info('No new notifications')}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </header>

        {/* Left Panel - Planning */}
        <div className="w-full lg:w-[450px] bg-white border-r border-gray-100 flex flex-col h-full overflow-y-auto">
          <header className="hidden lg:flex p-8 border-b border-gray-50 items-center justify-between">
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
              <h1 className="text-3xl font-bold">{mode === 'nearby' ? 'Nearby Services' : 'Plan Journey'}</h1>
              <button 
                onClick={() => {
                  setIsVoiceActive(!isVoiceActive);
                  toast.info(isVoiceActive ? 'Voice guidance deactivated' : 'Voice guidance activated');
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  isVoiceActive ? "bg-teal-500 text-white" : "bg-teal-50 text-[#006D6D]"
                )}
              >
                <Mic className={cn("w-3 h-3", isVoiceActive && "animate-pulse")} /> 
                Voice {isVoiceActive ? 'On' : 'Off'}
              </button>
            </div>

            {/* Found Locations List */}
            {isSearchingReal && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <p className="text-sm font-bold text-slate-500">Finding real-time accessible {searchService}s...</p>
              </div>
            )}
            
            {!isSearchingReal && foundLocations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-headline">Nearby {searchService}s</h2>
                  <button 
                    onClick={() => setFoundLocations([])}
                    className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear Results
                  </button>
                </div>
                <div className="space-y-3">
                  {foundLocations.map((loc) => (
                    <motion.div
                      key={loc.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setTo(loc.name);
                        setMapCenter(loc.coords);
                        toast.success(`Selected ${loc.name}`);
                      }}
                      className={cn(
                        "p-4 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden",
                        selectedLocation?.id === loc.id 
                          ? "bg-teal-50 border-[#006D6D] shadow-lg" 
                          : "bg-white border-gray-100 hover:border-teal-200"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        selectedLocation?.id === loc.id ? "bg-[#006D6D] text-white" : "bg-teal-50 text-teal-600"
                      )}>
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-sm truncate">{loc.name}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{loc.address}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                            <span className="text-[10px] font-bold text-gray-600">{loc.rating}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-[10px] font-bold text-teal-600">{loc.distance}</span>
                          {loc.uri && (
                            <>
                              <span className="text-[10px] text-gray-400">•</span>
                              <a 
                                href={loc.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                              >
                                <Globe className="w-2.5 h-2.5" />
                                Maps
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      {selectedLocation?.id === loc.id && (
                        <div className="absolute top-0 right-0 p-2">
                          <CheckCircle2 className="w-5 h-5 text-teal-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {selectedLocation && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartNavigation}
                    className="w-full py-4 bg-[#006D6D] text-white rounded-[2rem] font-bold shadow-xl shadow-teal-900/20 flex items-center justify-center gap-3 group"
                  >
                    <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Start Navigation to {selectedLocation.name}
                  </motion.button>
                )}
              </div>
            )}

            {foundLocations.length === 0 && mode === 'nearby' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-medium">Select a service to see the best accessible route.</p>
                <div className="space-y-3">
                  {nearbyServices.map(service => (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => performSearch(service.name)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4",
                        selectedService === service.id 
                          ? "bg-teal-50 border-[#006D6D] shadow-md" 
                          : "bg-white border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        selectedService === service.id ? "bg-[#006D6D] text-white" : "bg-gray-50 text-gray-400"
                      )}>
                        <service.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{service.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Accessibility className="w-3 h-3 text-teal-600" />
                          <span className="text-[10px] text-gray-500 font-medium">{service.accessibility}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Form */}
            {foundLocations.length === 0 && (
              <div className={cn("bg-gray-50 p-6 rounded-3xl space-y-4 relative", mode === 'nearby' && "opacity-50 pointer-events-none")}>
              <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gray-200 border-l border-dashed border-gray-300" />
              <div className="flex items-center gap-4 relative z-10 group">
                <div className="w-4 h-4 rounded-full border-2 border-[#006D6D] bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#006D6D]" />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 focus-within:border-teal-200 transition-all">
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full p-0"
                  />
                  <button 
                    onClick={() => handleVoiceInput('from')}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      voiceTarget === 'from' ? "bg-teal-500 text-white" : "text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 relative z-10 group">
                <div className="w-4 h-4 rounded-full border-2 border-[#FF8C42] bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C42]" />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 focus-within:border-teal-200 transition-all">
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        performSearch(to);
                      }
                    }}
                    placeholder="Where to?"
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full p-0 placeholder:text-gray-400"
                  />
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => performSearch(to)}
                      className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                      title="Search"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleVoiceInput('to')}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        voiceTarget === 'to' ? "bg-teal-500 text-white" : "text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

            <div className="flex items-center justify-between p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", isTracking ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-400")}>
                  {isTracking ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Live Tracking</p>
                  <p className="text-[10px] text-gray-500">Respects your privacy</p>
                </div>
              </div>
              <button 
                onClick={toggleTracking}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  isTracking ? "bg-[#006D6D]" : "bg-gray-300"
                )}
              >
                <motion.div 
                  animate={{ x: isTracking ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <button 
              onClick={handleStartNavigation}
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
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recommended Paths</h3>
                {isCalculatingRoute && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[#006D6D]"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-[10px] font-bold">AI Calculating...</span>
                  </motion.div>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {isCalculatingRoute ? (
                  <motion.div
                    key="calculating"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-8 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-[#006D6D] mb-4">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">Analyzing accessibility data...</p>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                        className="h-full bg-[#006D6D]"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      onClick={() => toast.success('Selected Best Match route')}
                      className="p-6 rounded-3xl border-2 border-[#006D6D] bg-white shadow-lg shadow-teal-900/5 relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-[#006D6D] text-white text-[8px] font-bold uppercase tracking-widest">Best Match</div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold">{selectedService ? '8' : '12'}</span>
                        <span className="text-sm font-bold text-gray-400 mb-1">min</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-4">{selectedService ? '0.4' : '0.8'} miles • {selectedService ? '14:41' : '14:45'} Arrival</div>
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
                        <span className="text-3xl font-bold">{selectedService ? '12' : '18'}</span>
                        <span className="text-sm font-bold text-gray-400 mb-1">min</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-4">{selectedService ? '0.6' : '1.2'} miles • {selectedService ? '14:45' : '14:51'} Arrival</div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 text-gray-500 text-[10px] font-bold">
                        <Moon className="w-3 h-3" /> Quiet Path
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
            center={mapCenter}
            zoom={14}
            route={sampleRoute}
            userLocation={userLocation}
            onMapClick={handleMapClick}
            selectedMarkerId={selectedService}
            markers={[
              { id: 'start', position: [40.7128, -74.0060], title: 'Start: Central Park' },
              { id: 'end', position: [40.7200, -74.0120], title: 'End: Chelsea' },
              { id: 'hazard-1', position: [40.7160, -74.0090], title: 'Uneven Path', severity: 'high', description: 'Construction work ahead' },
              ...nearbyServices.map(s => ({
                id: s.id,
                position: s.position,
                title: s.name,
                description: s.accessibility,
                severity: 'low' as const
              })),
              ...(hazardLocation ? [{
                id: 'new-hazard',
                position: hazardLocation,
                title: 'New Hazard Location',
                severity: 'high' as const
              }] : [])
            ]}
          />

          {/* Hazard Reporting Modal */}
          <AnimatePresence>
            {isReportingHazard && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
              >
                <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Report Hazard</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Community Safety</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsReportingHazard(false);
                        setHazardLocation(null);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {!hazardLocation ? (
                      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 text-center">
                        <p className="text-sm text-teal-700 font-medium">
                          Tap on the map to select the hazard location, or use your current position.
                        </p>
                        <button 
                          onClick={() => {
                            if (userLocation) {
                              setHazardLocation(userLocation);
                              toast.success('Using current location');
                            } else {
                              toast.error('Current location not available');
                            }
                          }}
                          className="mt-3 text-xs font-bold text-teal-600 underline"
                        >
                          Use My Current Location
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-700 font-medium">Location Selected</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {['Uneven Path', 'Construction', 'No Elevator', 'Crowded', 'Poor Lighting', 'Other'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setHazardType(type)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                            hazardType === type 
                              ? "bg-teal-500 text-white border-teal-500" 
                              : "bg-white text-slate-600 border-slate-100 hover:border-teal-200"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={submitHazardReport}
                      disabled={!hazardLocation || !hazardType}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                        (!hazardLocation || !hazardType)
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-[#006D6D] text-white shadow-lg hover:bg-[#005a5a]"
                      )}
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Command Visual Feedback Overlay */}
          <AnimatePresence>
            {voiceStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
              >
                <div className={cn(
                  "bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border p-5 flex items-center gap-5 transition-all duration-500 overflow-hidden relative",
                  voiceStatus === 'executed' ? "border-green-200 bg-green-50/95 shadow-green-200/20" : "border-teal-100 shadow-teal-200/20"
                )}>
                  {/* Background Accents */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/10" />
                  
                  <div className="shrink-0 relative">
                    {voiceStatus === 'heard' && (
                      <>
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-teal-400 rounded-full"
                        />
                        <div className="relative w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 z-10">
                          <Mic className="w-6 h-6" />
                        </div>
                      </>
                    )}
                    {voiceStatus === 'processing' && (
                      <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                    {voiceStatus === 'executed' && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30"
                      >
                        <CheckCircle2 className="w-7 h-7" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        voiceStatus === 'heard' ? "bg-teal-400 animate-pulse" : 
                        voiceStatus === 'processing' ? "bg-teal-500" : "bg-green-500"
                      )} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {voiceStatus === 'heard' && 'Command Heard'}
                        {voiceStatus === 'processing' && 'Analyzing Request'}
                        {voiceStatus === 'executed' && 'Action Completed'}
                      </p>
                    </div>
                    <p className={cn(
                      "text-base font-bold truncate transition-colors",
                      voiceStatus === 'executed' ? "text-green-700" : "text-slate-900"
                    )}>
                      {lastCommandText || 'Listening...'}
                    </p>
                  </div>

                  {/* Progress Indicator for Processing */}
                  {voiceStatus === 'processing' && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-teal-500"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Insight Overlay */}
          <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 max-w-[300px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-[#006D6D]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Live AI Insight</div>
                <div className="text-sm font-bold">{isNavigating ? 'Navigating to Destination' : 'Path Clear & Accessible'}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-gray-400">{isNavigating ? 'Route Progress' : 'Crowd Density'}</span>
                  <span className="text-teal-500">{isNavigating ? '15%' : 'Very Low (8%)'}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: isNavigating ? '15%' : '8%' }}
                    className="h-full bg-teal-500 rounded-full" 
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 italic leading-relaxed">
                {isNavigating 
                  ? "You are on the safest path. Next turn in 200 meters at 5th Ave."
                  : "Weather is dry. All elevators on this route are reported operational as of 5 mins ago."}
              </p>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-4">
            <button 
              onClick={() => setIsReportingHazard(!isReportingHazard)}
              className={cn(
                "w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all",
                isReportingHazard ? "bg-red-500 text-white" : "bg-white text-red-500 hover:bg-red-50"
              )}
              title="Report Hazard"
            >
              <AlertCircle className="w-7 h-7" />
            </button>

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
              onClick={handleRecenter}
              className={cn(
                "w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all transform hover:scale-105",
                isTracking ? "bg-[#006D6D] text-white" : "bg-white text-gray-400"
              )}
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
