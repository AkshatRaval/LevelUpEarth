"use client";

import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { actions } from "@/constants/Actions";
import { COOLDOWNS, DAILY_XP_CAP, POINTS } from "@/constants/GameConfig";
import {
  Camera,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Zap,
  Timer,
  Sparkles,
  X,
} from "lucide-react";
import { useToast } from "@/components/ToastContext";
import { useAddAction } from "@/hooks/useAddAction";

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

const AddAction = () => {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<
    Record<string, { available: boolean; remainingMs: number }>
  >({});
  const [dailyXp, setDailyXp] = useState(0);
  const [dailyXpCap, setDailyXpCap] = useState(DAILY_XP_CAP);
  const [levelUpInfo, setLevelUpInfo] = useState<any>(null);

  const { submitAction, loading } = useAddAction();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { showToast } = useToast();

  // Fetch cooldowns and daily XP on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (data.success) {
          if (data.cooldowns) setCooldowns(data.cooldowns);
          if (data.progression) {
            setDailyXp(data.progression.dailyXp || 0);
            setDailyXpCap(data.progression.dailyXpCap || DAILY_XP_CAP);
          }
        }
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    }
    fetchStatus();
  }, []);

  // Live cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitAction = async () => {
    const file = fileInputRef.current?.files?.[0];

    if (!type || !file || !title) {
      showToast(
        "Hold up! Select an action, write a title, and upload a photo first. 📸",
        "error"
      );
      return;
    }

    // Check cooldown locally
    const cd = cooldowns[type];
    if (cd && !cd.available) {
      showToast(
        `This action is on cooldown. Wait ${formatCooldown(cd.remainingMs)}. ⏳`,
        "error"
      );
      return;
    }

    // Check daily XP
    if (dailyXp >= dailyXpCap) {
      showToast(`Daily XP limit reached (${dailyXpCap} XP). Come back tomorrow! 🌙`, "error");
      return;
    }

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const result = await submitAction(type, title, description, compressedFile);

      // Check for level up
      if (result.level?.didLevelUp) {
        setLevelUpInfo(result.level);
      } else {
        showToast(
          `Impact logged! +${result.xp?.awarded || 0} XP earned. 🌱`,
          "success"
        );
      }

      // Update local state
      if (result.xp) {
        setDailyXp(result.xp.dailyUsed);
      }

      // Set cooldown for this action
      const cooldownHours = COOLDOWNS[type] || 1;
      setCooldowns((prev) => ({
        ...prev,
        [type]: {
          available: false,
          remainingMs: cooldownHours * 60 * 60 * 1000,
        },
      }));

      setType("");
      setTitle("");
      setDescription("");
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Something went sideways. Try again!", "error");
    }
  };

  const dailyPercent = Math.min(Math.round((dailyXp / dailyXpCap) * 100), 100);

  return (
    <main className="min-h-screen bg-[#FDFCF5] p-4 pb-20 sm:p-8">
      <div className="mx-auto max-w-4xl">
        {/* ═══ LEVEL UP CELEBRATION MODAL ═══ */}
        {levelUpInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="relative border-4 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full text-center animate-[bounce_0.5s_ease-out]">
              <button
                onClick={() => {
                  setLevelUpInfo(null);
                  showToast("Action logged successfully! 🌱", "success");
                }}
                className="absolute top-3 right-3 border-2 border-black p-1 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
              <div className="text-6xl mb-4">
                {levelUpInfo.current?.emoji || "🎉"}
              </div>
              <h2 className="text-3xl font-black uppercase italic mb-2">
                LEVEL UP!
              </h2>
              <p className="text-lg font-bold mb-1">
                You reached{" "}
                <span className="text-emerald-600 font-black">
                  Level {levelUpInfo.current?.level}
                </span>
              </p>
              <p className="text-2xl font-black italic text-emerald-600 mb-4">
                {levelUpInfo.current?.title}
              </p>
              <div className="border-t-4 border-black border-dashed pt-4 mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  From Level {levelUpInfo.oldLevel} → Level{" "}
                  {levelUpInfo.current?.level}
                </p>
              </div>
              <button
                onClick={() => {
                  setLevelUpInfo(null);
                  router.push("/dashboard");
                }}
                className="mt-6 w-full border-4 border-black bg-emerald-500 py-3 font-black text-white uppercase hover:bg-emerald-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                VIEW DASHBOARD
              </button>
            </div>
          </div>
        )}

        {/* HEADER SECTION */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-block border-2 border-black bg-orange-400 px-4 py-1 text-xs font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Action Logger v2.0
            </div>
            {/* Daily XP Badge */}
            <div
              className={`inline-flex items-center gap-1.5 border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                dailyPercent >= 100
                  ? "bg-red-300"
                  : dailyPercent >= 75
                  ? "bg-yellow-300"
                  : "bg-violet-300"
              }`}
            >
              <Zap size={12} />
              {dailyXp}/{dailyXpCap} XP Today
            </div>
          </div>

          <h1 className="text-5xl font-black uppercase italic tracking-tighter sm:text-7xl">
            LOG YOUR <span className="text-emerald-600">IMPACT.</span>
          </h1>
          <p className="max-w-xl text-lg font-bold text-slate-700">
            Every tree, every drop, every effort. Don't just do it—prove it and
            earn your points.
          </p>

          {/* Daily XP Progress Bar */}
          <div className="max-w-xl">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1">
              <span>Daily XP</span>
              <span
                className={
                  dailyPercent >= 100 ? "text-red-600" : "text-slate-500"
                }
              >
                {dailyPercent >= 100
                  ? "LIMIT REACHED"
                  : `${dailyXpCap - dailyXp} XP remaining`}
              </span>
            </div>
            <div className="h-3 border-3 border-black bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  dailyPercent >= 100 ? "bg-red-500" : "bg-violet-500"
                }`}
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT: ACTION SELECTION */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                1
              </div>
              <h2 className="text-2xl font-black uppercase italic">
                Pick Your Move
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {actions.map((action) => {
                const isSelected = type === action.id;
                const cd = cooldowns[action.id];
                const isOnCooldown = cd?.available === false;
                const points = POINTS[action.id] || 5;

                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (isOnCooldown) {
                        showToast(
                          `${action.label} is on cooldown. Wait ${formatCooldown(cd!.remainingMs)}. ⏳`,
                          "error"
                        );
                        return;
                      }
                      setType(action.id);
                    }}
                    className={`
                      group relative overflow-hidden border-4 border-black p-5 text-left transition-all
                      ${
                        isOnCooldown
                          ? "bg-slate-200 cursor-not-allowed opacity-60"
                          : isSelected
                          ? "bg-emerald-500 shadow-none translate-x-1 translate-y-1"
                          : "bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{action.emoji}</span>
                      <div className="flex items-center gap-2">
                        {isOnCooldown && (
                          <div className="flex items-center gap-1 border-2 border-black bg-red-100 px-2 py-0.5 text-[9px] font-black text-red-700 uppercase">
                            <Timer size={10} />
                            {formatCooldown(cd!.remainingMs)}
                          </div>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="text-white" size={24} />
                        )}
                      </div>
                    </div>
                    <h3
                      className={`text-lg font-black uppercase ${
                        isSelected ? "text-white" : "text-black"
                      }`}
                    >
                      {action.label}
                    </h3>
                    <p
                      className={`mt-1 text-xs font-bold leading-tight ${
                        isSelected ? "text-emerald-100" : "text-slate-500"
                      }`}
                    >
                      {action.impact}
                    </p>
                    <div
                      className={`mt-2 inline-block text-[10px] font-black uppercase tracking-widest ${
                        isSelected
                          ? "text-yellow-200"
                          : isOnCooldown
                          ? "text-slate-400"
                          : "text-emerald-600"
                      }`}
                    >
                      +{points} XP
                    </div>
                  </button>
                );
              })}
            </div>

            {/* TEXT DETAILS */}
            <div className="space-y-4 pt-4 border-t-4 border-black border-dashed">
              <h2 className="text-xl font-black uppercase italic">
                Action Details
              </h2>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase">
                  Title (Required)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Planted a Neem sapling at the park"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-4 border-black bg-white p-3 font-bold outline-none focus:bg-emerald-50 focus:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Share a bit more about the experience..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border-4 border-black bg-white p-3 font-bold outline-none focus:bg-emerald-50 focus:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: UPLOAD & PREVIEW */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                2
              </div>
              <h2 className="text-2xl font-black uppercase italic">
                The Proof
              </h2>
            </div>

            <div className="group relative">
              <input
                type="file"
                accept="image/*"
                id="photo-upload"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className={`
                  flex min-h-[300px] cursor-pointer flex-col items-center justify-center border-4 border-black border-dashed transition-all
                  ${
                    preview
                      ? "bg-white p-2"
                      : "bg-slate-100 hover:bg-emerald-50"
                  }
                  shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                `}
              >
                {preview ? (
                  <div className="relative h-full w-full">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-[280px] w-full object-cover border-2 border-black"
                    />
                    <div className="absolute -right-2 -top-2 border-2 border-black bg-yellow-400 p-1 font-black text-xs uppercase">
                      Ready to log
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
                      <Camera size={40} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase tracking-tight">
                        Capture Evidence
                      </p>
                      <p className="text-sm font-bold text-slate-500 italic">
                        Click to open camera/gallery
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmitAction}
              disabled={loading || dailyPercent >= 100}
              className={`
                group mt-8 flex w-full items-center justify-center gap-3 border-4 border-black bg-black py-6 text-2xl font-black text-white transition-all
                ${
                  loading || dailyPercent >= 100
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-emerald-600 hover:shadow-[8px_8px_0px_0px_rgba(251,146,60,1)]"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  UPLOADING...
                </>
              ) : dailyPercent >= 100 ? (
                <>
                  XP LIMIT REACHED
                  <Zap size={24} />
                </>
              ) : (
                <>
                  LOG ACTION
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center font-mono text-[10px] uppercase font-bold text-slate-400">
              By submitting, you agree to the PedhPoints community guidelines.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddAction;