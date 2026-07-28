import React, { useState } from 'react';
import { Zap, ArrowLeft, Loader2, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Magnetic from '../components/Magnetic.tsx';
import DarkVeil from '../components/DarkVeil.tsx';

interface LoginProps {
  store: any;
}

const Login: React.FC<LoginProps> = ({ store }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, signup } = store;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface-50 dark:bg-surface-950 selection:bg-brand-500/30">

      {/* DarkVeil Shader Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 dark:opacity-100 transition-opacity duration-1000 overflow-hidden">
        <DarkVeil
          hueShift={10}
          speed={1}
        />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-600/10 dark:bg-brand-500/5 blur-[120px] rounded-full animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 dark:bg-purple-500/5 blur-[100px] rounded-full animate-float [animation-delay:2s]"></div>
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="fixed top-8 left-8">
          <Magnetic strength={0.2}>
            <Link 
              to="/" 
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-surface-200 dark:border-white/10 shadow-premium transition-all hover:bg-white dark:hover:bg-white/10 group"
            >
              <ArrowLeft size={18} className="text-surface-500 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest text-surface-700 dark:text-surface-300">Home</span>
            </Link>
          </Magnetic>
        </div>

        <div className="w-full max-w-lg space-y-10">
          {/* Logo and Title */}
          <div className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex relative"
            >
              <div className="absolute inset-0 bg-brand-500/30 blur-2xl rounded-3xl animate-pulse-glow"></div>
              <div className="relative bg-brand-600 p-6 rounded-[2rem] shadow-brand text-white">
                <Zap size={48} fill="currentColor" />
              </div>
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-6xl font-display font-black tracking-tighter text-surface-900 dark:text-white">
                ZenSpace
              </h1>
              <p className="text-lg text-surface-500 font-medium">
                {isLogin ? 'Welcome back to your productivity sanctuary' : 'Begin your journey to absolute clarity'}
              </p>
            </div>
          </div>

          {/* Main Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="glass-premium rounded-[3rem] p-10 sm:p-14 space-y-10 shadow-premium relative group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles size={80} />
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex gap-4 overflow-hidden"
                >
                  <AlertCircle size={22} className="text-rose-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab Switcher */}
            <div className="relative p-1.5 bg-surface-100/50 dark:bg-white/5 rounded-2xl border border-surface-200 dark:border-white/5">
              <div 
                className="absolute top-1.5 bottom-1.5 transition-all duration-500 ease-[0.23,1,0.32,1] bg-white dark:bg-surface-800 rounded-xl shadow-premium"
                style={{
                  left: isLogin ? '0.375rem' : 'calc(50% + 0.1875rem)',
                  width: 'calc(50% - 0.5625rem)',
                }}
              ></div>
              <div className="relative flex">
                <button 
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${isLogin ? 'text-brand-500' : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'}`}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${!isLogin ? 'text-brand-500' : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'}`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {!isLogin && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 pl-1">
                      Full Name
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full glass-inset !bg-white dark:!bg-white/5 py-4 px-6 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all border-surface-100 dark:border-white/10"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 pl-1">
                    Email Address
                  </label>
                  <input 
                    required
                    type="email" 
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-inset !bg-white dark:!bg-white/5 py-4 px-6 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all border-surface-100 dark:border-white/10"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">
                      Password
                    </label>
                    {isLogin && (
                      <button type="button" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 hover:text-brand-400 transition-colors">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass-inset !bg-white dark:!bg-white/5 py-4 px-6 pr-14 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all border-surface-100 dark:border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-surface-400 hover:text-brand-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <Magnetic strength={0.1}>
                <button 
                  disabled={isLoading}
                  type="submit" 
                  className="w-full h-[64px] px-8 bg-brand-600 hover:bg-brand-500 text-white rounded-[1.25rem] font-black transition-all shadow-brand flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98] text-lg group"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="leading-none tracking-tight">{isLogin ? 'Enter' : 'Join ZenSpace'}</span>
                      <Zap size={22} fill="currentColor" className="animate-pulse-glow transition-transform group-hover:scale-110 group-hover:rotate-12" />
                    </div>
                  )}
                </button>
              </Magnetic>
            </form>

            <div className="pt-8 border-t border-surface-200 dark:border-white/5 text-center">
              <p className="text-sm text-surface-500 font-medium">
                {isLogin ? "New to ZenSpace?" : "Already part of the squad?"}{" "}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-brand-500 font-black uppercase tracking-widest text-xs hover:text-brand-400 transition-colors hover:underline decoration-2 underline-offset-4"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Secure Protocol Active</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">
              ZenSpace © 2026 ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;