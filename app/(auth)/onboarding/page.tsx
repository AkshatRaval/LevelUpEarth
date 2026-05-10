"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf, Trees, Droplets, MapPin, User, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastContext";

export default function Onboarding() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    origin: "",
    interests: [] as string[]
  });

  const availableInterests = [
    "Tree Planting", "Ocean Cleanup", "Recycling", "Energy Conservation", "Sustainable Travel", "Composting"
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
         setUser(user);
      } else {
         router.push('/login');
      }
    });
  }, []);

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.fullName || !formData.origin)) {
       showToast("We need your name and location to proceed.", "error");
       return;
    }
    if (step === 2 && formData.interests.length === 0) {
       showToast("Pick at least one interest to help us customize your experience.", "error");
       return;
    }
    setStep(prev => prev + 1);
  };

  const finishOnboarding = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: formData.fullName,
      origin: formData.origin,
      interests: formData.interests,
      onboarded: true,
      username: user.user_metadata?.username || formData.fullName.split(' ')[0]
    });

    setLoading(false);

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Profile created. Let's get to work.", "success");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCF5] p-6 text-slate-900">
      <div className="w-full max-w-2xl border-4 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:p-12 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-2 bg-slate-200 w-full">
           <div 
             className="h-full bg-emerald-500 transition-all duration-500" 
             style={{ width: `${(step / 3) * 100}%` }}
           />
        </div>

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
           <div className="animate-in fade-in slide-in-from-right-8 space-y-8 mt-4">
              <div className="space-y-2">
                <div className="inline-block border-2 border-black bg-emerald-400 px-3 py-1 text-xs font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Step 1 of 3
                </div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Who are you?</h1>
                <p className="font-bold text-slate-600">Every hero needs a name and an origin story.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase italic">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g., Ravi Kumar"
                      className="w-full border-4 border-black bg-white p-4 font-bold outline-none transition-all focus:bg-emerald-50 focus:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black uppercase italic">City / Origin</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="e.g., Mumbai, India"
                      className="w-full border-4 border-black bg-white p-4 font-bold outline-none transition-all focus:bg-emerald-50 focus:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                    />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="group flex w-full items-center justify-between border-4 border-black bg-black px-6 py-4 text-xl font-black text-white transition-all hover:bg-emerald-600 hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:translate-y-1"
              >
                NEXT STEP
                <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        )}

        {/* STEP 2: INTERESTS */}
        {step === 2 && (
           <div className="animate-in fade-in slide-in-from-right-8 space-y-8 mt-4">
              <div className="space-y-2">
                <div className="inline-block border-2 border-black bg-blue-400 px-3 py-1 text-xs font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Step 2 of 3
                </div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Your Mission</h1>
                <p className="font-bold text-slate-600">What environmental causes are you willing to fight for?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {availableInterests.map(interest => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                       <button 
                         key={interest}
                         onClick={() => toggleInterest(interest)}
                         className={`border-4 border-black p-4 text-left transition-all font-black uppercase text-sm ${
                           isSelected ? 'bg-blue-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white hover:bg-blue-50 text-slate-600'
                         }`}
                       >
                          {interest}
                       </button>
                    )
                 })}
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setStep(1)} className="border-4 border-black p-4 hover:bg-slate-100 font-black uppercase">
                    BACK
                 </button>
                 <button
                   onClick={handleNext}
                   className="group flex-1 flex items-center justify-between border-4 border-black bg-black px-6 py-4 text-xl font-black text-white transition-all hover:bg-blue-500 hover:shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] active:translate-y-1"
                 >
                   ALMOST THERE
                   <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
           </div>
        )}

        {/* STEP 3: BRIEFING (From Original) */}
        {step === 3 && (
           <div className="animate-in fade-in slide-in-from-right-8 space-y-8 mt-4">
              <div className="text-center space-y-4">
                <div className="inline-block border-2 border-black bg-orange-400 px-4 py-1 text-sm font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Step 3 of 3 • Briefing
                </div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                  READY TO <br /> <span className="text-emerald-600 underline decoration-black decoration-4 underline-offset-4">LEVEL UP?</span>
                </h1>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 border-4 border-black bg-emerald-50 p-3">
                   <div className="bg-emerald-500 border-2 border-black p-2 flex-shrink-0">
                      <Trees size={20} className="text-white" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black uppercase italic">1. Take Action</h3>
                      <p className="text-xs font-bold text-slate-700">Plant a tree, save water, or cycle to work. Real impact starts offline.</p>
                   </div>
                </div>

                <div className="flex items-start gap-4 border-4 border-black bg-blue-50 p-3">
                   <div className="bg-blue-500 border-2 border-black p-2 flex-shrink-0">
                      <Leaf size={20} className="text-white" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black uppercase italic">2. Log The Proof</h3>
                      <p className="text-xs font-bold text-slate-700">Snap a photo and upload it. Words mean nothing without verification.</p>
                   </div>
                </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setStep(2)} className="border-4 border-black p-4 hover:bg-slate-100 font-black uppercase">
                    BACK
                 </button>
                 <button
                   onClick={finishOnboarding}
                   disabled={loading}
                   className="group flex-1 flex items-center justify-between border-4 border-black bg-black px-6 py-4 text-xl font-black text-white transition-all hover:bg-emerald-600 hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:translate-y-1 disabled:opacity-50"
                 >
                   {loading ? "SAVING..." : "START MY FIRST MISSION"}
                   {!loading && <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />}
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
