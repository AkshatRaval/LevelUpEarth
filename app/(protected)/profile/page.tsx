"use client";

import React from "react";
import { useProfile } from "@/hooks/useProfile";
import {
  Trophy,
  Calendar,
  MapPin,
  Zap,
  Settings,
  Camera,
  Loader2,
  Flame,
  TrendingUp,
  Target,
  Star,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";
import { LEVELS } from "@/constants/GameConfig";

export default function ProfilePage() {
  const {
    user,
    stats,
    history,
    progression,
    loading,
    uploading,
    uploadAvatar,
  } = useProfile();
  const router = useRouter();
  const { showToast } = useToast();

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }
      const file = e.target.files[0];
      await uploadAvatar(file);
      showToast("Avatar updated successfully!", "success");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  if (loading || !user) return null;

  const xp = progression?.xpProgress;
  const currentLevel = xp?.currentLevel;
  const nextLevel = xp?.nextLevel;

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      {/* ═══════ IDENTITY CARD ═══════ */}
      <section className="relative border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={() => showToast("Settings panel coming soon!", "info")}
          className="absolute top-4 right-4 border-2 border-black p-2 hover:bg-slate-100 transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 bg-emerald-100 border-4 border-black flex items-center justify-center font-black text-6xl text-emerald-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              {user.profile?.avatar_url ? (
                <img
                  src={user.profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                (
                  user.profile?.username?.[0] ||
                  user.user_metadata?.username?.[0] ||
                  user.email?.[0] ||
                  "E"
                ).toUpperCase()
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-yellow-300 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 cursor-pointer">
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Identity Info */}
          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-orange-400 px-3 py-1 text-[10px] uppercase font-black tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-1">
              <span className="text-base leading-none">
                {currentLevel?.emoji || "🌱"}
              </span>
              Lv.{progression?.level || 1}: {currentLevel?.title || "Seedling"}
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              {user.profile?.username ||
                user.profile?.full_name ||
                user.user_metadata?.username ||
                "Eco Warrior"}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {user.profile?.origin || "Earth"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Joined{" "}
                {new Date(user.created_at).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ XP Progress Bar ═══ */}
        <div className="mt-6 pt-6 border-t-4 border-black border-dashed">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">
              XP Progress
            </span>
            <span className="text-sm font-black italic text-emerald-600">
              {progression?.totalXp?.toLocaleString() || 0} XP
            </span>
          </div>
          <div className="relative h-5 border-4 border-black bg-slate-100 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-700"
              style={{ width: `${xp?.progressPercent || 0}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase tracking-widest z-10">
              {xp?.progressPercent || 0}%
              {nextLevel && (
                <span className="ml-2 text-slate-500">
                  → {nextLevel.title}
                </span>
              )}
            </div>
          </div>
          {nextLevel && (
            <p className="text-[10px] font-bold text-slate-400 mt-1 text-right uppercase tracking-widest">
              {(xp?.xpNeededForNext || 0) - (xp?.xpInCurrentLevel || 0)} XP to
              Level {nextLevel.level}
            </p>
          )}
        </div>
      </section>

      {/* ═══════ STATS GRID ═══════ */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border-4 border-black bg-emerald-500 p-5 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
          <Trophy size={22} className="mb-2 text-yellow-300" />
          <div className="text-3xl font-black italic">
            {stats.totalPoints.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest">
            Total Points
          </div>
        </div>

        <div className="border-4 border-black bg-blue-500 p-5 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
          <Zap size={22} className="mb-2 text-yellow-300" />
          <div className="text-3xl font-black italic">
            {stats.actionsCount}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest">
            Missions Done
          </div>
        </div>

        <div className="border-4 border-black bg-orange-500 p-5 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
          <Flame size={22} className="mb-2 text-yellow-300" />
          <div className="text-3xl font-black italic">
            {progression?.currentStreak || 0}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest">
            Day Streak
          </div>
          <div className="text-[9px] font-bold uppercase mt-1 text-orange-200">
            Best: {progression?.longestStreak || 0}
          </div>
        </div>

        <div className="border-4 border-black bg-violet-500 p-5 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
          <Award size={22} className="mb-2 text-yellow-300" />
          <div className="text-3xl font-black italic">
            Lv.{progression?.level || 1}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest">
            {currentLevel?.title || "Seedling"}
          </div>
        </div>
      </section>

      {/* ═══════ LEVEL ROADMAP ═══════ */}
      <section className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 mb-5">
          <Target size={20} />
          <h2 className="text-xl font-black uppercase italic">Level Roadmap</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {LEVELS.map((lvl) => {
            const isCurrentLevel = lvl.level === (progression?.level || 1);
            const isUnlocked = (progression?.totalXp || 0) >= lvl.minXP;

            return (
              <div
                key={lvl.level}
                className={`relative border-3 border-black p-3 text-center transition-all ${
                  isCurrentLevel
                    ? "bg-emerald-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
                    : isUnlocked
                    ? "bg-emerald-50"
                    : "bg-slate-100 opacity-50"
                }`}
              >
                {isCurrentLevel && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 border-2 border-black px-1.5 py-0.5 text-[8px] font-black uppercase text-black">
                    YOU
                  </div>
                )}
                <div className="text-2xl mb-1">{lvl.emoji}</div>
                <div
                  className={`text-[10px] font-black uppercase leading-tight ${
                    isCurrentLevel ? "text-white" : ""
                  }`}
                >
                  Lv.{lvl.level}
                </div>
                <div
                  className={`text-[9px] font-bold leading-tight mt-0.5 ${
                    isCurrentLevel ? "text-emerald-100" : "text-slate-500"
                  }`}
                >
                  {lvl.title}
                </div>
                <div
                  className={`text-[8px] font-bold mt-1 ${
                    isCurrentLevel ? "text-emerald-200" : "text-slate-400"
                  }`}
                >
                  {lvl.minXP.toLocaleString()} XP
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ MISSION LOG ═══════ */}
      <section className="space-y-4 pt-6 border-t-4 border-black border-dashed">
        <h2 className="text-2xl font-black uppercase italic mb-6">
          Mission Log
        </h2>

        {history.length === 0 ? (
          <div className="border-4 border-black border-dashed bg-slate-50 p-10 text-center">
            <h3 className="text-xl font-black uppercase text-slate-400">
              No missions logged
            </h3>
            <p className="font-bold text-slate-500 mt-2">
              Time to get off the couch and level up earth.
            </p>
            <button
              onClick={() => router.push("/add-action")}
              className="mt-6 border-4 border-black bg-black text-white px-6 py-3 font-black uppercase hover:bg-emerald-500 transition-colors"
            >
              Log First Action
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {history.map((action) => (
              <div
                key={action.id}
                className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex hover:-translate-y-0.5 transition-transform"
              >
                <div className="w-1/3 bg-slate-200 border-r-4 border-black relative overflow-hidden group">
                  {action.proof_url ? (
                    <img
                      src={action.proof_url.replace(
                        "/storage/v1/object/public/proofs/",
                        "/storage/v1/object/public/action-proofs/"
                      )}
                      alt="Proof"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-slate-400 opacity-50 uppercase text-xs p-2 text-center">
                      No Image
                    </div>
                  )}
                </div>
                <div className="w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 px-2 py-1 border-2 border-black">
                        {action.type}
                      </span>
                      <span className="text-lg font-black text-emerald-600 italic">
                        +{action.points}
                      </span>
                    </div>
                    <h3 className="font-black text-lg uppercase leading-tight line-clamp-2">
                      {action.title || action.type}
                    </h3>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mt-4">
                    {new Date(action.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
