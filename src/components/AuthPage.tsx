import React, { useState } from 'react';
import { Shield, Mail, Lock, User as UserIcon, Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const getRegisteredUsers = (): { [email: string]: { username: string; passwordHash: string; createdAt: string } } => {
    const data = localStorage.getItem('last_minute_registered_users');
    return data ? JSON.parse(data) : {};
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      try {
        const users = getRegisteredUsers();

        if (isLogin) {
          // LOGIN FLOW
          const lowerEmail = email.trim().toLowerCase();
          const userObj = users[lowerEmail];

          if (!userObj) {
            throw new Error('Access denied. No account associated with this email.');
          }

          if (userObj.passwordHash !== password) {
            throw new Error('Access denied. Invalid password signature.');
          }

          setSuccess('AUTHENTICATION SIGNATURE VERIFIED. INGRESS GRANTED.');
          setTimeout(() => {
            onAuthSuccess({
              username: userObj.username,
              email: lowerEmail,
              createdAt: userObj.createdAt,
              role: (userObj as any).role,
              institution: (userObj as any).institution,
              mainGoal: (userObj as any).mainGoal,
              workMode: (userObj as any).workMode,
              dailyFocusHours: (userObj as any).dailyFocusHours,
              onboarded: (userObj as any).onboarded,
            });
          }, 1000);
        } else {
          // SIGNUP FLOW
          const lowerEmail = email.trim().toLowerCase();
          const cleanUsername = username.trim();

          if (!cleanUsername) {
            throw new Error('Username signature required.');
          }
          if (cleanUsername.length < 3) {
            throw new Error('Username must be at least 3 characters.');
          }
          if (!lowerEmail || !lowerEmail.includes('@')) {
            throw new Error('Valid email address required.');
          }
          if (password.length < 6) {
            throw new Error('Password signature must be at least 6 characters.');
          }

          if (users[lowerEmail]) {
            throw new Error('Account already registered with this email.');
          }

          // Register
          users[lowerEmail] = {
            username: cleanUsername,
            passwordHash: password,
            createdAt: new Date().toISOString(),
          };

          localStorage.setItem('last_minute_registered_users', JSON.stringify(users));
          setSuccess('ACCOUNT CREATED. INGRESS PIPELINE ESTABLISHED.');
          
          setTimeout(() => {
            // Automatically log in
            onAuthSuccess({
              username: cleanUsername,
              email: lowerEmail,
              createdAt: users[lowerEmail].createdAt,
            });
          }, 1000);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication.');
      } finally {
        setLoading(false);
      }
    }, 800); // realistic short delay
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-vivid-dark relative overflow-hidden font-sans selection:bg-[#ff453a] selection:text-white">
      {/* Decorative background grid and ambient lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-[#ff453a]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-[#a78bfa]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Top Centered Brand Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#ff453a]/10 border border-[#ff453a]/30 px-3 py-1 font-mono text-[9px] text-[#ff453a] uppercase tracking-widest font-black animate-pulse">
            <Shield className="w-3.5 h-3.5" /> SECURE CONTROL ACCESS
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-[0.4em] uppercase opacity-50 font-black mb-1">Emergency Salvage</span>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter leading-none text-white uppercase">
              CRUNCHTIME <span className="text-[#ff453a]">AI</span>
            </h1>
          </div>
        </div>

        {/* Auth Card Form */}
        <div className="bg-vivid-panel border-2 border-vivid-border p-6 sm:p-8 relative overflow-hidden glow-vivid">
          
          {/* Tab header selectors */}
          <div className="flex border-b border-vivid-border pb-5 mb-6 justify-between items-center">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className={`text-sm font-black uppercase tracking-widest pb-1 transition-all border-b-2 relative ${
                  isLogin ? 'text-white border-[#ff453a]' : 'text-white/40 border-transparent hover:text-white/75'
                }`}
              >
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`text-sm font-black uppercase tracking-widest pb-1 transition-all border-b-2 relative ${
                  !isLogin ? 'text-white border-[#ff453a]' : 'text-white/40 border-transparent hover:text-white/75'
                }`}
              >
                SIGN UP
              </button>
            </div>
            <div className="font-mono text-[9px] text-[#a78bfa] uppercase font-bold tracking-widest bg-vivid-dark px-2.5 py-1 border border-vivid-border">
              {isLogin ? 'SECURE_INBOUND' : 'ENROLL_PIPELINE'}
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-white/50 font-mono font-black uppercase tracking-wider">
                  OPERATOR NAME
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. CaptainProcrastinator"
                    className="w-full bg-vivid-dark border border-vivid-border pl-10 pr-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff453a] transition font-mono"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] text-white/50 font-mono font-black uppercase tracking-wider">
                SECURE EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@lifesaver.ai"
                  className="w-full bg-vivid-dark border border-vivid-border pl-10 pr-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff453a] transition font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-white/50 font-mono font-black uppercase tracking-wider">
                SECURITY PASSKEY
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-vivid-dark border border-vivid-border pl-10 pr-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff453a] transition font-mono"
                  required
                />
              </div>
            </div>

            {/* Status alerts */}
            {error && (
              <div className="bg-[#ff453a]/10 border-2 border-[#ff453a] text-white p-3.5 font-mono text-xs uppercase tracking-tight flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#ff453a] shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <span className="font-black text-[#ff453a] block text-[10px] tracking-wider">SIGNATURE ERROR</span>
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="bg-[#34C759]/10 border-2 border-[#34C759] text-white p-3.5 font-mono text-xs uppercase tracking-tight flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-[#34C759] block text-[10px] tracking-wider">SECURE AUTHORIZATION</span>
                  {success}
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-[#ff453a] text-black hover:text-white font-black py-4.5 px-4 text-xs uppercase tracking-widest transition duration-300 border border-transparent disabled:opacity-30 mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'INITIATE SESSION INGRESS' : 'ESTABLISH SECURE PIPELINE'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom auxiliary note */}
          <div className="mt-6 pt-5 border-t border-vivid-border/50 text-center font-mono text-[9px] text-white/40 leading-normal uppercase">
            By accessing this system you authorize CrunchTime AI to track deadlines and optimize focus metrics.
          </div>

        </div>
      </div>
    </div>
  );
}
