import { supabaseServer } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { COOLDOWNS, DAILY_XP_CAP, getXPProgress } from "@/constants/GameConfig";

export async function getDashboardStats(userId: string) {
  const supabase = await createClient();

  // ─── Profile Data (level, XP, streaks) ───
  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("level, total_xp, daily_xp, daily_xp_date, current_streak, longest_streak, last_action_date")
    .eq("id", userId)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error(profileError.message);
  }

  // ─── Actions Data ───
  const { data: actionsData, error } = await supabase
    .from("actions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const recentActions = actionsData.slice(0, 5);

  // ─── Category Stats ───
  let treesCount = 0;
  let waterPoints = 0;
  let energyPoints = 0;

  actionsData.forEach((action: any) => {
    if (action.type === "plantedTree") treesCount++;
    if (action.type === "savedWater" || action.type === "wateredPlant") waterPoints += action.points;
    if (action.type === "cycled" || action.type === "recycledWaste") energyPoints += action.points;
  });

  // ─── Daily XP ───
  const today = new Date().toISOString().split("T")[0];
  let dailyXp = profile?.daily_xp || 0;
  if (profile?.daily_xp_date !== today) {
    dailyXp = 0; // Reset on new day
  }

  // ─── Cooldown Status ───
  const cooldowns: Record<string, { available: boolean; remainingMs: number }> = {};
  const now = Date.now();

  for (const [actionType, cooldownHours] of Object.entries(COOLDOWNS)) {
    const { data: latest } = await supabaseServer
      .from("actions")
      .select("created_at")
      .eq("user_id", userId)
      .eq("type", actionType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      const lastTime = new Date(latest.created_at).getTime();
      const cooldownMs = cooldownHours * 60 * 60 * 1000;
      const elapsed = now - lastTime;
      if (elapsed < cooldownMs) {
        cooldowns[actionType] = { available: false, remainingMs: cooldownMs - elapsed };
      } else {
        cooldowns[actionType] = { available: true, remainingMs: 0 };
      }
    } else {
      cooldowns[actionType] = { available: true, remainingMs: 0 };
    }
  }

  // ─── Level Progress ───
  const totalXp = profile?.total_xp || 0;
  const xpProgress = getXPProgress(totalXp);

  return {
    recentActions,
    stats: {
      trees: treesCount,
      water: waterPoints,
      energy: energyPoints,
    },
    progression: {
      level: profile?.level || 1,
      totalXp,
      dailyXp,
      dailyXpCap: DAILY_XP_CAP,
      currentStreak: profile?.current_streak || 0,
      longestStreak: profile?.longest_streak || 0,
      lastActionDate: profile?.last_action_date || null,
      xpProgress,
    },
    cooldowns,
  };
}
