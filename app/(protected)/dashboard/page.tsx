"use client";

import React, { useEffect, useState } from "react";
import {
  PlusSquare,
  Trees,
  Droplets,
  Zap,
  Flame,
  Rss,
  Trophy,
  Timer,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/hooks/useDashboard";
import { actions } from "@/constants/Actions";
import { COOLDOWNS } from "@/constants/GameConfig";

// Format remaining cooldown ms into readable string
function formatCooldown(ms: number): string {
  if (ms <= 0) return "READY";
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { userData, recentActions, stats, progression, cooldowns, loading } =
    useDashboard();

  // Live countdown timers
  const [liveCooldowns, setLiveCooldowns] = useState<
    Record<string, { available: boolean; remainingMs: number }>
  >({});

  useEffect(() => {
    if (Object.keys(cooldowns).length > 0) {
      setLiveCooldowns(cooldowns);
    }
  }, [cooldowns]);

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCooldowns((prev) => {
        const updated = { ...prev };
        let anyActive = false;
        for (const key in updated) {
          if (!updated[key].available && updated[key].remainingMs > 0) {
            updated[key] = {
              ...updated[key],
              remainingMs: Math.max(0, updated[key].remainingMs - 1000),
            };
            if (updated[key].remainingMs <= 0) {
              updated[key] = { available: true, remainingMs: 0 };
            } else {
              anyActive = true;
            }
          }
        }
        if (!anyActive) clearInterval(interval);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldowns]);

  const xp = progression?.xpProgress;
  const dailyPercent = progression
    ? Math.min(
        Math.round((progression.dailyXp / progression.dailyXpCap) * 100),
        100
      )
    : 0;

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="text-center font-black uppercase text-2xl py-20">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
      {/* ═══════ HEADER ═══════ */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-block border-2 border-black bg-yellow-300 px-3 py-1 text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {xp?.currentLevel.emoji} Lv.{progression?.level || 1} —{" "}
            {xp?.currentLevel.title || "Seedling"}
          </div>
          {(progression?.currentStreak || 0) > 0 && (
            <div className="inline-flex items-center gap-1 border-2 border-black bg-orange-400 px-3 py-1 text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Flame size={12} className="text-white" />
              {progression?.currentStreak} Day Streak
            </div>
          )}
        </div>

        <h1 className="text-4xl font-black uppercase italic sm:text-6xl tracking-tighter leading-none">
          NAMASTE,{" "}
          <span className="text-emerald-600 underline decoration-black decoration-4 underline-offset-4 italic">
            {userData?.user_metadata?.username ||
              userData?.user_metadata?.name ||
              "PLAYER"}
            !
          </span>
        </h1>
      </section>

      {/* ═══════ LEVEL PROGRESSION CARD ═══════ */}
      <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{xp?.currentLevel.emoji}</span>
              <h3 className="text-2xl font-black uppercase italic tracking-tight">
                Level {progression?.level || 1}
              </h3>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              {xp?.currentLevel.title}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black italic text-emerald-600">
              {progression?.totalXp?.toLocaleString() || 0}{" "}
              <span className="text-lg text-black not-italic">XP</span>
            </div>
            {xp?.nextLevel && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {xp.xpNeededForNext - xp.xpInCurrentLevel} XP to{" "}
                {xp.nextLevel.title}
              </p>
            )}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative h-6 border-4 border-black bg-slate-100 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${xp?.progressPercent || 0}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest z-10">
            {xp?.progressPercent || 0}%
            {xp?.nextLevel && (
              <span className="ml-2 text-slate-500">
                → Lv.{xp.nextLevel.level}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ STATS GRID ═══════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="border-4 border-black p-4 bg-orange-100 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-3 flex items-center justify-between">
            <Flame size={20} className="text-orange-600" />
            <span className="text-[9px] uppercase font-black opacity-60 tracking-tighter">
              Streak
            </span>
          </div>
          <div className="text-2xl font-black uppercase tracking-tighter">
            {progression?.currentStreak || 0} Days
          </div>
          <div className="text-[9px] font-bold text-slate-500 uppercase mt-1">
            Best: {progression?.longestStreak || 0}
          </div>
        </div>

        {/* Daily XP */}
        <div className="border-4 border-black p-4 bg-violet-100 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-3 flex items-center justify-between">
            <Zap size={20} className="text-violet-600" />
            <span className="text-[9px] uppercase font-black opacity-60 tracking-tighter">
              Daily XP
            </span>
          </div>
          <div className="text-2xl font-black uppercase tracking-tighter">
            {progression?.dailyXp || 0}/{progression?.dailyXpCap || 200}
          </div>
          {/* Mini progress bar */}
          <div className="mt-2 h-2 border-2 border-black bg-white overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                dailyPercent >= 100 ? "bg-red-500" : "bg-violet-500"
              }`}
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
        </div>

        {/* Trees */}
        <div className="border-4 border-black p-4 bg-emerald-100 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-3 flex items-center justify-between">
            <Trees size={20} className="text-emerald-600" />
            <span className="text-[9px] uppercase font-black opacity-60 tracking-tighter">
              Trees
            </span>
          </div>
          <div className="text-2xl font-black uppercase tracking-tighter">
            {stats.trees}
          </div>
        </div>

        {/* Water */}
        <div className="border-4 border-black p-4 bg-blue-100 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-3 flex items-center justify-between">
            <Droplets size={20} className="text-blue-600" />
            <span className="text-[9px] uppercase font-black opacity-60 tracking-tighter">
              Water
            </span>
          </div>
          <div className="text-2xl font-black uppercase tracking-tighter">
            {stats.water}L
          </div>
        </div>
      </section>

      {/* ═══════ COOLDOWN TIMERS ═══════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b-4 border-black pb-2">
          <Timer size={20} />
          <h3 className="text-xl font-black uppercase italic">
            Action Cooldowns
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => {
            const cd = liveCooldowns[action.id];
            const isAvailable = cd?.available !== false;
            const remaining = cd?.remainingMs || 0;
            const cooldownHours = COOLDOWNS[action.id] || 1;

            return (
              <div
                key={action.id}
                className={`border-3 border-black p-3 text-center transition-all ${
                  isAvailable
                    ? "bg-emerald-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-slate-200 opacity-70"
                }`}
              >
                <div className="text-2xl mb-1">{action.emoji}</div>
                <div className="text-[9px] font-black uppercase tracking-tighter mb-2 leading-tight">
                  {action.label}
                </div>
                {isAvailable ? (
                  <div className="text-[10px] font-black text-emerald-600 uppercase border-2 border-emerald-600 px-2 py-0.5 inline-block">
                    Ready
                  </div>
                ) : (
                  <div className="text-[10px] font-black text-red-600 uppercase">
                    {formatCooldown(remaining)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ RECENT ACTIVITY + QUICK ACTIONS ═══════ */}
      <section className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b-4 border-black pb-2">
            <h3 className="text-xl font-black uppercase italic">
              Personal Ledger
            </h3>
          </div>

          <div className="space-y-3">
            {recentActions.length === 0 ? (
              <div className="border-4 border-black border-dashed p-6 text-center text-slate-500 font-bold italic">
                No actions logged yet. Time to level up!
              </div>
            ) : (
              recentActions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  <div className="flex gap-3 items-center">
                    <div className="bg-emerald-100 p-2 border-2 border-black">
                      <Trees size={16} />
                    </div>
                    <div>
                      <p className="uppercase font-black text-xs leading-none mb-1">
                        {item.title || item.type}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                        {new Date(item.created_at).toLocaleDateString()} •{" "}
                        {item.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-emerald-600 font-black text-md italic">
                    +{item.points}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="border-4 border-black bg-orange-400 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:sticky lg:top-10 space-y-4">
            <h4 className="text-lg font-black uppercase mb-1 leading-tight">
              Your impact is visible.
            </h4>
            <p className="text-[11px] font-bold leading-tight italic text-orange-950">
              Check the <strong>FEED</strong> to see what other warriors across
              India are doing right now.
            </p>

            {/* Quick Stats */}
            <div className="border-2 border-black bg-white/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase">
                  Quick Stats
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-lg font-black italic">
                    {progression?.totalXp || 0}
                  </div>
                  <div className="text-[8px] font-bold uppercase">Total XP</div>
                </div>
                <div>
                  <div className="text-lg font-black italic">
                    Lv.{progression?.level || 1}
                  </div>
                  <div className="text-[8px] font-bold uppercase">Level</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/add-action")}
                className="flex w-full items-center justify-center gap-2 border-2 border-black bg-black p-3 text-xs font-black text-white hover:bg-emerald-600 transition-colors"
              >
                LOG NEW ACTION
                <PlusSquare size={16} />
              </button>
              <button
                onClick={() => router.push("/feed")}
                className="flex w-full items-center justify-center gap-2 border-2 border-black bg-white p-3 text-xs font-black text-black hover:bg-yellow-300 transition-colors"
              >
                VIEW GLOBAL FEED
                <Rss size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}