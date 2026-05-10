"use client";

import { supabase } from "@/lib/supabase/client";
import { ArrowRight, Leaf, Trees, Droplets, Zap, Globe, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  const handleCTA = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    router.push(user ? "/dashboard" : "/login");
  };

  return (
    <main className="min-h-screen bg-[#FDFCF5] text-slate-900 selection:bg-emerald-200">

      {/* STICKY NAV - Brutalist Style */}
      <nav className="sticky top-0 z-50 border-b-4 border-black bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-emerald-500 border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-px group-hover:translate-y-px group-hover:shadow-none transition-all">
              <Image
                src="/logo.png"
                alt="Level Up Earth Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">Level Up Earth</span>
          </div>

          <button
            onClick={handleCTA}
            className="border-2 border-black bg-orange-400 px-6 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:bg-orange-500"
          >
            OPEN APP
          </button>
        </div>
      </nav>

      {/* HERO SECTION - Asymmetrical & Bold */}
      <section className="relative border-b-4 border-black bg-emerald-50 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-block border-2 border-black bg-white px-4 py-1 font-mono text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🇮🇳 India's Green Revolution
            </div>
            <h1 className="text-6xl font-black leading-[0.9] sm:text-8xl tracking-tighter">
              DO GOOD.<br />
              <span className="text-emerald-600 underline decoration-orange-400 decoration-8 underline-offset-8">GET REWARDED.</span>
            </h1>
            <p className="max-w-xl text-xl font-medium leading-relaxed text-slate-700 italic border-l-4 border-emerald-500 pl-4">
              Level Up Earth isn't just an app—it's a movement. Track every sapling planted and every drop of water saved. Real proof, real impact, real points.
            </p>
            <div className="flex flex-wrap gap-6">
              <button
                onClick={handleCTA}
                className="group flex items-center gap-3 border-4 border-black bg-black px-10 py-5 text-xl font-black text-white hover:bg-emerald-600 transition-colors shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]"
              >
                JOIN THE MISSION
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Abstract Hero Visual (No generic stock photos) */}
          <div className="flex-1 relative">
            <div className="relative z-10 border-4 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="grid grid-cols-2 gap-4">
                <ImpactCard icon={<Trees />} label="12k+" sub="Trees Planted" color="bg-green-100" />
                <ImpactCard icon={<Droplets />} label="500k" sub="Liters Saved" color="bg-blue-100" />
                <ImpactCard icon={<Zap />} label="9k" sub="CO2 Reduced" color="bg-yellow-100" />
                <ImpactCard icon={<Sparkles />} label="1M+" sub="Impact Points" color="bg-purple-100" />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 -z-10 h-full w-full border-4 border-dashed border-slate-300" />
          </div>
        </div>
      </section>

      {/* WHY SECTION - Horizontal Scroll style or Tiled */}
      <section className="bg-white py-24 border-b-4 border-black">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-black uppercase mb-16 underline decoration-emerald-500 decoration-4">The Level Up Earth Manifesto</h2>
          <div className="grid gap-0 border-4 border-black md:grid-cols-3">
            <FeatureTile
              title="Action First"
              desc="We don't do 'thoughts and prayers'. Upload photo proof of your eco-action and get verified by the community."
              step="01"
            />
            <FeatureTile
              title="Gamified Earth"
              desc="Level up your 'Eco-Rank'. Compete with your city to see who's making India greener one day at a time."
              step="02"
              className="border-y-4 md:border-y-0 md:border-x-4 border-black bg-emerald-50"
            />
            <FeatureTile
              title="Local Impact"
              desc="Designed specifically for the Indian landscape—addressing our water tables, our heatwaves, and our soil."
              step="03"
            />
          </div>
        </div>
      </section>

      {/* CALL TO ACTION - High Contrast */}
      <section className="bg-orange-400 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="border-4 border-black bg-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-5xl font-black leading-tight uppercase">India is waiting for you.</h2>
            <p className="mt-6 text-xl font-bold text-slate-800">
              Join thousands of Indians turning daily habits into planetary healing.
              No more excuses, just actions.
            </p>
            <button
              onClick={handleCTA}
              className="mt-10 border-4 border-black bg-black px-12 py-6 text-2xl font-black text-white hover:bg-emerald-600 hover:-translate-y-1 transition-all"
            >
              GET STARTED NOW
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-black py-12 text-white">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="font-mono text-sm uppercase tracking-widest italic text-emerald-400">
            Built in Bharat • For the Planet
          </p>
          <div className="flex gap-8 font-bold uppercase text-sm">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

// Sub-components for cleaner code
const ImpactCard = ({ icon, label, sub, color }: any) => (
  <div className={`border-2 border-black p-4 ${color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
    <div className="mb-2 text-slate-900">{icon}</div>
    <div className="text-2xl font-black">{label}</div>
    <div className="text-xs font-bold uppercase text-slate-600 leading-none">{sub}</div>
  </div>
);

const FeatureTile = ({ title, desc, step, className = "" }: any) => (
  <div className={`p-10 flex flex-col gap-6 ${className}`}>
    <span className="font-mono text-6xl font-black opacity-10">{step}</span>
    <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
    <p className="text-lg font-medium leading-snug text-slate-700">{desc}</p>
  </div>
);

export default Home;