"use client";

import React from "react";
import { Trophy, Medal, Star } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function LeaderboardPage() {
  const { leaders, currentUserRank, loading } = useLeaderboard();

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <section className="space-y-2 border-b-4 border-black pb-6 text-center">
        <div className="inline-block border-2 border-black bg-yellow-300 px-3 py-1 text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mx-auto mb-4">
          Top Rankings
        </div>
        <h1 className="text-4xl font-black uppercase italic sm:text-6xl tracking-tighter leading-none">
          THE{" "}
          <span className="text-emerald-600 underline decoration-black decoration-4 underline-offset-4 italic">
            LEADERBOARD
          </span>
        </h1>
        <p className="font-bold text-slate-700 italic mt-4">
          Compete with the best. Level up earth.
        </p>
      </section>

      {leaders.length === 0 ? (
        <div className="border-4 border-black border-dashed p-10 text-center font-bold text-slate-500 italic">
          Leaderboard is calculating...
        </div>
      ) : (
        <>
          {/* Podium (Top 3) */}
          <section className="grid grid-cols-3 gap-2 sm:gap-6 items-end mt-12 mb-16">
            {/* Rank 2 */}
            {top3[1] && (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black text-2xl z-10 relative">
                    {top3[1].name[0].toUpperCase()}
                  </div>
                  <div className="absolute -top-3 -right-3 bg-white rounded-full border-2 border-black p-1">
                    <Medal size={20} className="text-slate-400" />
                  </div>
                </div>
                <div className="w-full bg-blue-100 border-x-4 border-t-4 border-black h-24 flex flex-col items-center justify-center p-2 text-center">
                  <span className="font-black text-xl">2ND</span>
                  <span className="text-[10px] font-bold uppercase truncate w-full">
                    {top3[1].name}
                  </span>
                  <span className="text-xs font-black text-emerald-600 italic">
                    {top3[1].points.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">
                    {top3[1].levelEmoji} {top3[1].levelTitle}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {top3[0] && (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-300 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black text-3xl z-10 relative">
                    {top3[0].name[0].toUpperCase()}
                  </div>
                  <div className="absolute -top-4 -right-4 bg-white rounded-full border-2 border-black p-1">
                    <Trophy size={28} className="text-yellow-500" />
                  </div>
                </div>
                <div className="w-full bg-yellow-100 border-x-4 border-t-4 border-black h-32 flex flex-col items-center justify-center p-2 text-center shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.1)]">
                  <span className="font-black text-2xl">1ST</span>
                  <span className="text-[10px] font-bold uppercase truncate w-full">
                    {top3[0].name}
                  </span>
                  <span className="text-sm font-black text-emerald-600 italic">
                    {top3[0].points.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                    {top3[0].levelEmoji} {top3[0].levelTitle}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black text-2xl z-10 relative">
                    {top3[2].name[0].toUpperCase()}
                  </div>
                  <div className="absolute -top-3 -right-3 bg-white rounded-full border-2 border-black p-1">
                    <Medal size={20} className="text-orange-600" />
                  </div>
                </div>
                <div className="w-full bg-orange-100 border-x-4 border-t-4 border-black h-20 flex flex-col items-center justify-center p-2 text-center">
                  <span className="font-black text-xl">3RD</span>
                  <span className="text-[10px] font-bold uppercase truncate w-full">
                    {top3[2].name}
                  </span>
                  <span className="text-xs font-black text-emerald-600 italic">
                    {top3[2].points.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">
                    {top3[2].levelEmoji} {top3[2].levelTitle}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* List View */}
          <section className="space-y-4">
            {rest.map((leader) => (
              <div
                key={leader.rank}
                className="flex items-center justify-between border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 font-black text-xl italic flex items-center justify-center text-slate-400">
                    #{leader.rank}
                  </div>
                  <div className="w-12 h-12 bg-slate-100 border-2 border-black flex items-center justify-center font-black">
                    {leader.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tight leading-none">
                      {leader.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {leader.levelEmoji} {leader.levelTitle} • {leader.city}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black italic text-emerald-600 flex items-center justify-end gap-1">
                    {leader.points.toLocaleString()}{" "}
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />
                  </div>
                  <div className="text-[9px] uppercase font-bold tracking-widest">
                    XP
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Personal Rank */}
          {currentUserRank && (
            <section className="mt-8 border-4 border-black bg-emerald-500 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-black uppercase text-xl italic">
                    Your Current Rank
                  </h4>
                  <p className="font-bold text-sm">
                    #{currentUserRank.rank} Globally
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-black text-3xl">
                    {currentUserRank.points.toLocaleString()} XP
                  </div>
                  <p className="text-xs font-bold uppercase mt-1 text-emerald-100">
                    {currentUserRank.levelEmoji} {currentUserRank.levelTitle}
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
