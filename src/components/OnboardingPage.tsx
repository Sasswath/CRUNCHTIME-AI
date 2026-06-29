import React, { useState } from 'react';
import {
  GraduationCap, Briefcase, Rocket, ArrowRight, ArrowLeft,
  CheckCircle, Target, Clock, Shield, Sliders, Users, User
} from 'lucide-react';
import { User as UserType } from '../types';

interface OnboardingPageProps {
  currentUser: UserType;
  onComplete: (updatedUser: UserType) => void;
}

type OnboardingStep = 'role' | 'details' | 'targets';

export default function OnboardingPage({ currentUser, onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState<OnboardingStep>('role');
  const [role, setRole] = useState<'student' | 'professional' | 'entrepreneur' | null>(null);
  
  // Custom details states
  const [institution, setInstitution] = useState('');
  const [secondaryDetail, setSecondaryDetail] = useState(''); // Major, Title, or Product
  const [mainGoal, setMainGoal] = useState('');
  
  // Custom target states
  const [dailyFocusHours, setDailyFocusHours] = useState<number>(4);
  const [workMode, setWorkMode] = useState<'solo' | 'collaborative'>('solo');

  const handleNextStep = () => {
    if (step === 'role' && role) {
      setStep('details');
    } else if (step === 'details') {
      setStep('targets');
    }
  };

  const handlePrevStep = () => {
    if (step === 'details') {
      setStep('role');
    } else if (step === 'targets') {
      setStep('details');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    const updatedUser: UserType = {
      ...currentUser,
      role,
      institution: institution.trim() || undefined,
      mainGoal: mainGoal.trim() || undefined,
      workMode,
      dailyFocusHours,
      onboarded: true,
    };

    onComplete(updatedUser);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-vivid-dark relative overflow-hidden font-sans selection:bg-[#ff453a] selection:text-white">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-[15%] left-[25%] w-[35%] h-[35%] bg-[#ff453a]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[25%] w-[35%] h-[35%] bg-[#a78bfa]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.4em] uppercase opacity-55 font-black">INITIALIZING EXPERIENCE</span>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
              COCKPIT <span className="text-[#ff453a]">SETUP</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-white/50 bg-vivid-panel px-3.5 py-1.5 border border-vivid-border">
            <span className={step === 'role' ? 'text-[#ff453a] font-bold' : ''}>01. PROFILE</span>
            <span className="text-white/20">/</span>
            <span className={step === 'details' ? 'text-[#ff453a] font-bold' : ''}>02. METRICS</span>
            <span className="text-white/20">/</span>
            <span className={step === 'targets' ? 'text-[#ff453a] font-bold' : ''}>03. TARGETS</span>
          </div>
        </div>

        {/* Setup card */}
        <div className="bg-vivid-panel border-2 border-vivid-border p-6 sm:p-10 relative overflow-hidden glow-vivid">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#ff453a]/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Welcome User Banner */}
          <div className="border-b border-vivid-border/50 pb-6 mb-8">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic leading-none mb-2">
              WELCOME COMMANDER, <span className="text-[#ff453a]">@{currentUser.username}</span>
            </h1>
            <p className="text-xs text-white/60 font-mono uppercase tracking-wider">
              Establish your operator parameters to calibrate CrunchTime AI for your specific workflows.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: ROLE SELECTION */}
            {step === 'role' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-[#ff453a]" /> Select Your Professional Profile
                  </h3>
                  <p className="text-xs text-white/50">
                    Your choice will customize immediate seed tasks, habits, strategies, and focus soundscapes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Student */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setInstitution('');
                      setSecondaryDetail('');
                      setMainGoal('');
                    }}
                    className={`flex flex-col items-center justify-center p-6 border-2 text-center transition-all group duration-300 ${
                      role === 'student'
                        ? 'bg-white text-black border-transparent scale-102 shadow-lg shadow-white/5'
                        : 'bg-vivid-dark border-vivid-border text-white hover:border-[#ff453a]/60'
                    }`}
                  >
                    <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${
                      role === 'student' ? 'bg-[#ff453a] text-white' : 'bg-white/5 text-[#a78bfa] group-hover:bg-[#ff453a]/10'
                    }`}>
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider block mb-1">STUDENT</span>
                    <span className={`text-[10px] leading-relaxed block ${role === 'student' ? 'text-black/70' : 'text-white/40'}`}>
                      Tackle academic syllabi, distributed assignments, exams, and project turn-ins.
                    </span>
                  </button>

                  {/* Professional */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('professional');
                      setInstitution('');
                      setSecondaryDetail('');
                      setMainGoal('');
                    }}
                    className={`flex flex-col items-center justify-center p-6 border-2 text-center transition-all group duration-300 ${
                      role === 'professional'
                        ? 'bg-white text-black border-transparent scale-102 shadow-lg shadow-white/5'
                        : 'bg-vivid-dark border-vivid-border text-white hover:border-[#ff453a]/60'
                    }`}
                  >
                    <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${
                      role === 'professional' ? 'bg-[#ff453a] text-white' : 'bg-white/5 text-[#a78bfa] group-hover:bg-[#ff453a]/10'
                    }`}>
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider block mb-1">PROFESSIONAL</span>
                    <span className={`text-[10px] leading-relaxed block ${role === 'professional' ? 'text-black/70' : 'text-white/40'}`}>
                      Rescue client presentations, severe production bugs, and quarterly company deliverables.
                    </span>
                  </button>

                  {/* Entrepreneur */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('entrepreneur');
                      setInstitution('');
                      setSecondaryDetail('');
                      setMainGoal('');
                    }}
                    className={`flex flex-col items-center justify-center p-6 border-2 text-center transition-all group duration-300 ${
                      role === 'entrepreneur'
                        ? 'bg-white text-black border-transparent scale-102 shadow-lg shadow-white/5'
                        : 'bg-vivid-dark border-vivid-border text-white hover:border-[#ff453a]/60'
                    }`}
                  >
                    <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${
                      role === 'entrepreneur' ? 'bg-[#ff453a] text-white' : 'bg-white/5 text-[#a78bfa] group-hover:bg-[#ff453a]/10'
                    }`}>
                      <Rocket className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider block mb-1">FOUNDER</span>
                    <span className={`text-[10px] leading-relaxed block ${role === 'entrepreneur' ? 'text-black/70' : 'text-white/40'}`}>
                      Race to release MVPs, build venture slide decks, secure investments, and scale startups.
                    </span>
                  </button>
                </div>

                <div className="flex justify-end pt-4 border-t border-vivid-border/30">
                  <button
                    type="button"
                    disabled={!role}
                    onClick={handleNextStep}
                    className="bg-white hover:bg-[#ff453a] text-black hover:text-white disabled:opacity-30 font-black px-6 py-3.5 uppercase text-xs tracking-widest flex items-center gap-2 transition duration-200 cursor-pointer"
                  >
                    <span>NEXT OPERATIONAL METRICS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS INPUT */}
            {step === 'details' && role && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#ff453a]" /> Personalize Your Profile Data
                  </h3>
                  <p className="text-xs text-white/50">
                    Provide quick parameters so our AI models can customize the wording of rescue recommendations.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Contextual Input 1 */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-white/50 font-mono font-black uppercase tracking-wider">
                      {role === 'student' && 'INSTITUTION / UNIVERSITY NAME'}
                      {role === 'professional' && 'COMPANY NAME / WORK INDUSTRY'}
                      {role === 'entrepreneur' && 'VENTURE OR PROJECT NAME'}
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder={
                        role === 'student' ? 'e.g. Stanford University' :
                        role === 'professional' ? 'e.g. Google Cloud Solutions' :
                        'e.g. FlightPath Technologies'
                      }
                      className="w-full bg-vivid-dark border border-vivid-border px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff453a] transition font-mono"
                      required
                    />
                  </div>

                  {/* Contextual Input 2 */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-white/50 font-mono font-black uppercase tracking-wider">
                      {role === 'student' && 'PRIMARY FIELD OF STUDY'}
                      {role === 'professional' && 'ROLE / PROFESSIONAL TITLE'}
                      {role === 'entrepreneur' && 'CORE PRODUCT / SERVICE VALUE'}
                    </label>
                    <input
                      type="text"
                      value={secondaryDetail}
                      onChange={(e) => setSecondaryDetail(e.target.value)}
                      placeholder={
                        role === 'student' ? 'e.g. Computer Science & Systems' :
                        role === 'professional' ? 'e.g. Senior Backend Engineer' :
                        'e.g. AI-driven logistics tracker'
                      }
                      className="w-full bg-vivid-dark border border-vivid-border px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff453a] transition font-mono"
                      required
                    />
                  </div>

                  {/* Immediate Critical Deliverable */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-white/50 font-mono font-black uppercase tracking-wider">
                      YOUR HIGHEST-PRESSURE TARGET GOAL (IMMEDIATE DELIVERABLE)
                    </label>
                    <input
                      type="text"
                      value={mainGoal}
                      onChange={(e) => setMainGoal(e.target.value)}
                      placeholder={
                        role === 'student' ? 'e.g. Pass CS301 Distributed Systems Project' :
                        role === 'professional' ? 'e.g. Release production DB latency patch' :
                        'e.g. Pitch deck dry-run for Seed Funding'
                      }
                      className="w-full bg-vivid-dark border border-vivid-border px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff453a] transition font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-5 border-t border-vivid-border/30">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="bg-transparent hover:bg-white/5 text-white/60 hover:text-white border border-vivid-border font-black px-5 py-3.5 uppercase text-xs tracking-widest flex items-center gap-2 transition duration-200 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>BACK</span>
                  </button>
                  <button
                    type="button"
                    disabled={!institution || !secondaryDetail || !mainGoal}
                    onClick={handleNextStep}
                    className="bg-white hover:bg-[#ff453a] text-black hover:text-white disabled:opacity-30 font-black px-6 py-3.5 uppercase text-xs tracking-widest flex items-center gap-2 transition duration-200 cursor-pointer"
                  >
                    <span>NEXT FOCUS LIMITS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PERFORMANCE TARGETS */}
            {step === 'targets' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#ff453a]" /> Configure Focus Limits & Preferences
                  </h3>
                  <p className="text-xs text-white/50">
                    Establish your maximum deep-work limits. CrunchTime AI will allocate break intervals accordingly.
                  </p>
                </div>

                <div className="space-y-6 pt-2">
                  {/* Daily Focus Limit */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] text-white/50 font-mono font-black uppercase tracking-wider">
                        DAILY INTENSIVE FOCUS TARGET CAPACITY
                      </label>
                      <span className="font-mono text-xs text-[#ff453a] font-bold bg-[#ff453a]/10 border border-[#ff453a]/30 px-2 py-0.5">
                        {dailyFocusHours} HOURS PER DAY
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-white/30">2H</span>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        step="1"
                        value={dailyFocusHours}
                        onChange={(e) => setDailyFocusHours(parseInt(e.target.value))}
                        className="w-full accent-[#ff453a] bg-vivid-dark h-2 rounded-none outline-none appearance-none border border-vivid-border cursor-pointer"
                      />
                      <span className="text-xs font-mono text-white/30">12H</span>
                    </div>
                    <p className="text-[10px] text-white/40 font-mono italic leading-relaxed">
                      *Note: The brain can sustain a maximum of 4-6 hours of truly deep, high-cognitive workload per day. Pace yourself!
                    </p>
                  </div>

                  {/* Work Mode preference */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-white/50 font-mono font-black uppercase tracking-wider">
                      PRIMARY COGNITIVE WORKFLOW PATTERN
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Solo */}
                      <button
                        type="button"
                        onClick={() => setWorkMode('solo')}
                        className={`flex items-center gap-3 p-4 border transition duration-200 text-left ${
                          workMode === 'solo'
                            ? 'bg-white text-black border-transparent'
                            : 'bg-vivid-dark border-vivid-border text-white hover:border-white/40'
                        }`}
                      >
                        <Clock className="w-5 h-5 shrink-0 text-[#ff453a]" />
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider block">SOLO ISOLATION</span>
                          <span className={`text-[9px] block ${workMode === 'solo' ? 'text-black/60' : 'text-white/40'}`}>
                            Uninterrupted, high-friction individual blocks.
                          </span>
                        </div>
                      </button>

                      {/* Collaborative */}
                      <button
                        type="button"
                        onClick={() => setWorkMode('collaborative')}
                        className={`flex items-center gap-3 p-4 border transition duration-200 text-left ${
                          workMode === 'collaborative'
                            ? 'bg-white text-black border-transparent'
                            : 'bg-vivid-dark border-vivid-border text-white hover:border-white/40'
                        }`}
                      >
                        <Users className="w-5 h-5 shrink-0 text-[#ff453a]" />
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider block">TEAM ALIGNMENT</span>
                          <span className={`text-[9px] block ${workMode === 'collaborative' ? 'text-black/60' : 'text-white/40'}`}>
                            Staggered meetings, team handovers, rapid updates.
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-5 border-t border-vivid-border/30">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="bg-transparent hover:bg-white/5 text-white/60 hover:text-white border border-vivid-border font-black px-5 py-3.5 uppercase text-xs tracking-widest flex items-center gap-2 transition duration-200 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>BACK</span>
                  </button>
                  <button
                    type="submit"
                    className="bg-[#ff453a] hover:bg-[#e03a30] text-white font-black px-7 py-3.5 uppercase text-xs tracking-widest flex items-center gap-2 transition duration-200 glow-red border border-transparent cursor-pointer"
                  >
                    <span>INITIALIZE COCKPIT INTEGRATION</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Security / Quality verification footer */}
        <div className="flex items-center gap-2.5 justify-center text-center font-mono text-[9px] text-white/35 uppercase">
          <Shield className="w-3.5 h-3.5 text-[#ff453a]" /> SECURE CALIBRATION ENGINE ONLINE // 100% OFFLINE-COMPATIBLE PERSISTENCE
        </div>
      </div>
    </div>
  );
}
