import { supabaseServer } from "@/lib/supabase/admin";
import {
  COOLDOWNS,
  POINTS,
  DAILY_XP_CAP,
  getLevelFromXP,
} from "@/constants/GameConfig";

export async function createAction(
  userId: string,
  type: string,
  title: string,
  description: string,
  photo: File
) {
  // ─── 1. Fetch user profile for daily XP & streak data ───
  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("total_xp, daily_xp, daily_xp_date, current_streak, longest_streak, last_action_date, level")
    .eq("id", userId)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error(profileError.message);
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  let currentDailyXp = profile?.daily_xp || 0;
  const dailyXpDate = profile?.daily_xp_date;

  // Reset daily XP if it's a new day
  if (dailyXpDate !== today) {
    currentDailyXp = 0;
  }

  // ─── 2. Check Daily XP Cap ───
  if (currentDailyXp >= DAILY_XP_CAP) {
    throw new Error(
      `Daily XP limit reached (${DAILY_XP_CAP} XP). Come back tomorrow! 🌙`
    );
  }

  // ─── 3. Cooldown Check ───
  const { data: latestAction } = await supabaseServer
    .from("actions")
    .select("created_at")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestAction) {
    const lastActionTime = new Date(latestAction.created_at).getTime();
    const now = Date.now();
    const cooldownHours = COOLDOWNS[type] || 1;
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const elapsed = now - lastActionTime;

    if (elapsed < cooldownMs) {
      const remainingMs = cooldownMs - elapsed;
      const minutesLeft = Math.ceil(remainingMs / 60000);
      throw new Error(
        `Cooldown active for ${type}. Wait ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}. ⏳`
      );
    }
  }

  // ─── 4. Upload Photo ───
  const bytes = await photo.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${photo.name}`;

  const { error: uploadError } = await supabaseServer.storage
    .from("action-proofs")
    .upload(fileName, buffer, {
      contentType: photo.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabaseServer.storage
    .from("action-proofs")
    .getPublicUrl(fileName);

  // ─── 5. Calculate Points (respect daily cap) ───
  const basePoints = POINTS[type] || 5;
  const remainingDailyXp = DAILY_XP_CAP - currentDailyXp;
  const awardedPoints = Math.min(basePoints, remainingDailyXp);

  // ─── 6. Insert Action ───
  const { data, error } = await supabaseServer
    .from("actions")
    .insert({
      user_id: userId,
      type,
      title,
      description,
      proof_url: publicUrl,
      points: awardedPoints,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // ─── 7. Update Profile: XP, Streak, Level ───
  const newTotalXp = (profile?.total_xp || 0) + awardedPoints;
  const newDailyXp = currentDailyXp + awardedPoints;
  const oldLevel = profile?.level || 1;
  const newLevelInfo = getLevelFromXP(newTotalXp);

  // Streak calculation
  let newStreak = profile?.current_streak || 0;
  let newLongestStreak = profile?.longest_streak || 0;
  const lastActionDate = profile?.last_action_date;

  if (lastActionDate !== today) {
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActionDate === yesterdayStr) {
      // Consecutive day → extend streak
      newStreak += 1;
    } else {
      // Streak broken or first action ever
      newStreak = 1;
    }

    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak;
    }
  }
  // If lastActionDate === today, streak stays the same (already counted today)

  const { error: updateError } = await supabaseServer
    .from("profiles")
    .upsert({
      id: userId,
      total_xp: newTotalXp,
      daily_xp: newDailyXp,
      daily_xp_date: today,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_action_date: today,
      level: newLevelInfo.level,
    });

  if (updateError) {
    throw new Error(updateError.message);
  }

  // ─── 8. Build Response ───
  const didLevelUp = newLevelInfo.level > oldLevel;

  return {
    imageUrl: publicUrl,
    action: data,
    xp: {
      awarded: awardedPoints,
      dailyUsed: newDailyXp,
      dailyCap: DAILY_XP_CAP,
      totalXp: newTotalXp,
    },
    level: {
      current: newLevelInfo,
      didLevelUp,
      oldLevel,
    },
    streak: {
      current: newStreak,
      longest: newLongestStreak,
    },
  };
}