"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, Lock, Mail, User, ArrowRight } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useToast } from "@/components/ToastContext";

export default function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSignup = async () => {
    if (!email || !password) {
      showToast("Fields missing! We need the details to save the planet. 🌍", "error");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) {
      showToast(error.message, "error");
    } else {
      router.push("/onboarding");
      showToast("Signed Up Successfully!! Welcome to the movement. 🌱", "success");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCF5] p-6">
      <div className="w-full max-w-md border-4 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:p-10">
        
        {/* HEADER */}
        <div className="mb-8 space-y-2">
          <div className="inline-block border-2 border-black bg-emerald-400 px-3 py-1 text-xs font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Join the Squad
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Create Account</h1>
          <p className="font-bold text-slate-600">Enter your details to start earning PedhPoints.</p>
        </div>

        {/* FORM */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase italic">Username</label>
            <div className="relative">
              <input
                type="text"
                placeholder="eco_warrior"
                className="w-full border-4 border-black bg-white p-4 font-bold outline-none transition-all focus:bg-emerald-50 focus:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                onChange={(e) => setUsername(e.target.value)}
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase italic">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border-4 border-black bg-white p-4 font-bold outline-none transition-all focus:bg-emerald-50 focus:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase italic">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full border-4 border-black bg-white p-4 font-bold outline-none transition-all focus:bg-emerald-50 focus:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>

          <button
            onClick={handleSignup}
            className="group flex w-full items-center justify-center gap-3 border-4 border-black bg-black py-4 text-xl font-black text-white transition-all hover:bg-emerald-600 hover:shadow-[6px_6px_0px_0px_rgba(251,146,60,1)] active:translate-y-1"
          >
            SIGN UP NOW
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t-2 border-slate-200"></div>
            <span className="mx-4 flex-shrink font-mono text-xs font-bold uppercase text-slate-400">OR</span>
            <div className="flex-grow border-t-2 border-slate-200"></div>
          </div>

          <button
            onClick={() => showToast("Google Sign Up coming soon!", "info")}
            className="flex w-full items-center justify-center gap-3 border-4 border-black bg-white py-4 font-black transition-all hover:bg-slate-50 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
          >
            <FaGoogle size={20} /> GOOGLE SIGN UP
          </button>
        </div>

        {/* FOOTER */}
        <p className="mt-8 text-center font-bold text-slate-600">
          Already a member?{" "}
          <button 
            onClick={() => router.push("/login")}
            className="text-emerald-600 underline decoration-4 underline-offset-4 hover:text-black"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}