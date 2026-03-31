import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, EyeOff, Globe, Bell, User as UserIcon, 
  Accessibility, Type, Mic, Contrast, Sparkles,
  ChevronDown, Check, X, ArrowRight, ArrowLeft, Phone, User,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (location.state?.mode === 'signup') {
      setIsSignUp(true);
    }
  }, [location.state]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with full name
        if (fullName) {
          await updateProfile(userCredential.user, {
            displayName: fullName
          });
        }
        toast.success('Account created successfully!');
        navigate('/setup/1');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        toast.success('Welcome back!');
        if (userDoc.exists() && userDoc.data()?.setupComplete) {
          navigate('/dashboard');
        } else {
          navigate('/setup/1');
        }
      }
    } catch (error: any) {
      let message = 'Authentication failed';
      if (error.code === 'auth/email-already-in-use') message = 'Email already in use';
      if (error.code === 'auth/invalid-credential') message = 'Invalid email or password';
      if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await login();
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      toast.success('Welcome back!');
      if (userDoc.exists() && userDoc.data()?.setupComplete) {
        navigate('/dashboard');
      } else {
        navigate('/setup/1');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased flex flex-col">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#FDFCFB]/85 backdrop-blur-xl border-b border-on-surface/5 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between px-12 py-4 w-full">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#006D6D] hover:text-[#005353] transition-colors font-bold group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-3xl font-extrabold text-[#006D6D] group-hover:scale-105 transition-transform tracking-tighter font-sans">Sahayak</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="text-sm font-bold text-[#006D6D] hover:opacity-80 transition-all"
            >
              Help
            </button>
            <button 
              onClick={() => setIsSignUp(true)}
              className="bg-[#006D6D] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#005353] transition-all shadow-md shadow-teal-900/10 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="p-8 lg:p-12">
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center text-[#006D6D] mb-8">
                  <HelpCircle className="w-10 h-10" />
                </div>
                
                <h3 className="text-3xl font-bold mb-4 text-[#006D6D]">How can we help?</h3>
                <p className="text-gray-500 text-lg font-medium leading-relaxed mb-8">
                  Our support team is available 24/7 to assist you with any questions or issues you may have.
                </p>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      setIsHelpOpen(false);
                      toast.success('Opening FAQ Center...');
                    }}
                    className="w-full py-4 rounded-2xl bg-gray-50 text-on-surface font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-between px-6"
                  >
                    <span>Frequently Asked Questions</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setIsHelpOpen(false);
                      toast.success('Connecting to live support...');
                    }}
                    className="w-full py-4 rounded-2xl bg-gray-50 text-on-surface font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-between px-6"
                  >
                    <span>Contact Support</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setIsHelpOpen(false);
                      toast.success('Opening Accessibility Guide...');
                    }}
                    className="w-full py-4 rounded-2xl bg-gray-50 text-on-surface font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-between px-6"
                  >
                    <span>Accessibility Guide</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 flex items-center justify-between border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sahayak Support</span>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF8C42]" />
                  <div className="w-2 h-2 rounded-full bg-[#006D6D]" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex items-stretch pt-16">
        {/* Hero Side Panel */}
        <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-12">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img 
              alt="Diverse people smiling" 
              className="w-full h-full object-cover grayscale" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANgKkyVpSaXbKa5UGZLyS3ULgNrWSCTIRRF-nBGTlGXCzlkVx3OXC5ZlmW9a61JD3BV7JRIlT_B5Fw3hImetMjmYZd0pB3IUMosiRad8l6bFb4MEMryO4_fzKElda2_gNiB8S3NL6CXMiULGLjG4Qzdxt-HZiFbcfykujee1X5df8oEEqcHJw6DbKhxzwGTp8-i7yK8lPpoDSVgF1F6dRPosCErxYHTuzQbTTSRodM5VHuoKQjNR6pXvvTu9-k59fEkl07R7sBGZ4"
              referrerPolicy="no-referrer"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-lg"
          >
            <h1 className="font-headline text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Accessibility <br/> <span className="text-[#ffb68d]">Redefined.</span>
            </h1>
            <p className="text-white/90 text-xl leading-relaxed mb-10 font-light">
              Join a world where mobility has no boundaries. We are building the future of inclusive navigation, one step at a time.
            </p>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl"
            >
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shadow-lg">
                <Accessibility className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold">Sahayak Unity</p>
                <p className="text-white/70 text-sm">Empowering 1M+ users globally</p>
              </div>
            </motion.div>
          </motion.div>
          {/* Decorative Asymmetric Element */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        </section>

        {/* Login Form Section */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface">
          <motion.div 
            key={isSignUp ? 'signup' : 'login'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-10"
          >
            <div className="space-y-3">
              <h2 className="text-4xl font-extrabold font-headline tracking-tight text-primary">
                {isSignUp ? 'Join Sahayak' : 'Welcome Back'}
              </h2>
              <p className="text-on-surface-variant font-medium text-lg">
                {isSignUp ? 'Create your account to start navigating.' : 'Please enter your details to sign in.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-5">
                {isSignUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-5"
                  >
                    <div className="group relative">
                      <label className="block text-sm font-bold text-primary mb-2 ml-1 transition-colors group-focus-within:text-secondary" htmlFor="fullName">Full Name</label>
                      <div className="relative">
                        <input 
                          className="w-full h-14 px-5 pl-12 bg-surface-container-highest border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-on-surface font-medium outline-none shadow-sm group-hover:shadow-md" 
                          id="fullName" 
                          name="fullName" 
                          placeholder="John Doe" 
                          required={isSignUp}
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                      </div>
                    </div>
                    <div className="group relative">
                      <label className="block text-sm font-bold text-primary mb-2 ml-1 transition-colors group-focus-within:text-secondary" htmlFor="phone">Phone Number</label>
                      <div className="relative">
                        <input 
                          className="w-full h-14 px-5 pl-12 bg-surface-container-highest border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-on-surface font-medium outline-none shadow-sm group-hover:shadow-md" 
                          id="phone" 
                          name="phone" 
                          placeholder="+1 (555) 000-0000" 
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div className="group relative">
                  <label className="block text-sm font-bold text-primary mb-2 ml-1 transition-colors group-focus-within:text-secondary" htmlFor="email">Email Address</label>
                  <input 
                    className="w-full h-14 px-5 bg-surface-container-highest border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-on-surface font-medium outline-none shadow-sm group-hover:shadow-md" 
                    id="email" 
                    name="email" 
                    placeholder="name@example.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="group relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-primary ml-1 transition-colors group-focus-within:text-secondary" htmlFor="password">Password</label>
                    {!isSignUp && (
                      <button 
                        type="button"
                        onClick={() => toast.info('Password reset link sent to your email')}
                        className="text-sm font-bold text-secondary hover:underline underline-offset-4 decoration-2 transition-all"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      className="w-full h-14 px-5 bg-surface-container-highest border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-on-surface font-medium pr-14 outline-none shadow-sm group-hover:shadow-md" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors p-2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2" 
                type="submit"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-surface text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Or continue with</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-3 gap-4">
              <motion.button 
                whileHover={{ y: -4, backgroundColor: '#f3f3f3', borderColor: 'var(--color-primary)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleLogin}
                className="flex items-center justify-center h-14 rounded-2xl bg-white border border-outline-variant/20 transition-all shadow-sm"
              >
                <img alt="Google" className="w-6 h-6" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" />
              </motion.button>
              <motion.button 
                whileHover={{ y: -4, backgroundColor: '#f3f3f3', borderColor: '#1877F2' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.info('Facebook login is currently being integrated. Please use Email or Google.')}
                className="flex items-center justify-center h-14 rounded-2xl bg-white border border-outline-variant/20 transition-all shadow-sm"
              >
                <svg className="w-6 h-6 text-[#1877F2] fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
              </motion.button>
              <motion.button 
                whileHover={{ y: -4, backgroundColor: '#f3f3f3', borderColor: '#1a1c1c' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.info('X login is currently being integrated. Please use Email or Google.')}
                className="flex items-center justify-center h-14 rounded-2xl bg-white border border-outline-variant/20 transition-all shadow-sm"
              >
                <svg className="w-5 h-5 text-on-surface fill-current" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z"></path></svg>
              </motion.button>
            </div>

            {/* Footer CTA */}
            <p className="text-center font-bold text-on-surface-variant text-lg">
              {isSignUp ? 'Already have an account?' : 'New to Sahayak?'}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-secondary font-black ml-2 hover:underline underline-offset-4 decoration-2 transition-all"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </motion.div>
        </section>
      </main>

      {/* Global Floating Accessibility Toolbar */}
      <div className="fixed left-8 bottom-8 z-50 flex flex-col gap-4">
        <AnimatePresence>
          {isAccessibilityOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white/80 backdrop-blur-xl p-3 rounded-3xl shadow-2xl flex flex-col gap-3 border border-outline-variant/20"
            >
              <button 
                onClick={() => toast.success('High Contrast mode activated')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm" title="High Contrast"
              >
                <Contrast className="w-6 h-6" />
              </button>
              <button 
                onClick={() => toast.success('Text size increased')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm" title="Text Size"
              >
                <Type className="w-6 h-6" />
              </button>
              <button 
                onClick={() => toast.success('Voice Over enabled')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm" title="Voice Over"
              >
                <Mic className="w-6 h-6" />
              </button>
              <button 
                onClick={() => toast.success('Simplified Mode activated')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm" title="Simplified Mode"
              >
                <Sparkles className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
          className="w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:bg-primary-container transition-all relative z-10"
        >
          {isAccessibilityOpen ? <X className="w-8 h-8" /> : <Accessibility className="w-8 h-8" />}
        </motion.button>
      </div>

      {/* Tonal Footer */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">© 2024 Sahayak Mobility. All rights reserved.</p>
          <nav className="flex gap-10">
            <button onClick={() => toast.info('Help center is available 24/7 at support@sahayak.ai')} className="text-gray-400 hover:text-secondary transition-colors font-bold text-sm uppercase tracking-widest">Help</button>
            <button onClick={() => toast.info('Privacy Policy: We value your data security.')} className="text-gray-400 hover:text-secondary transition-colors font-bold text-sm uppercase tracking-widest">Privacy</button>
            <button onClick={() => toast.info('Terms of Service: By using Sahayak, you agree to our guidelines.')} className="text-gray-400 hover:text-secondary transition-colors font-bold text-sm uppercase tracking-widest">Terms</button>
          </nav>
        </div>
      </footer>
    </div>
  );
}


