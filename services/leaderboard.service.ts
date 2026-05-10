import { supabaseServer } from "@/lib/supabase/admin";
import { getLevelFromXP } from "@/constants/GameConfig";

export interface Leader {
  rank: number;
  id: string;
  name: string;
  points: number;
  level: number;
  levelTitle: string;
  levelEmoji: string;
  city: string;
}

export async function getLeaderboard() {
  // Use profiles.total_xp directly — much faster than aggregating actions
  const { data: profiles, error } = await supabaseServer
    .from("profiles")
    .select("id, username, full_name, origin, total_xp, level")
    .order("total_xp", { ascending: false })
    .limit(100);

  if (error || !profiles) {
    throw new Error(error?.message || "Failed to fetch leaderboard");
  }

  const leaders: Leader[] = profiles
    .filter((p) => (p.total_xp || 0) > 0)
    .map((p, index) => {
      const name = p.username || p.full_name || "Eco Warrior";
      const totalXp = p.total_xp || 0;
      const levelInfo = getLevelFromXP(totalXp);

      return {
        rank: index + 1,
        id: p.id,
        name,
        points: totalXp,
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        levelEmoji: levelInfo.emoji,
        city: p.origin || "Earth",
      };
    });

  return leaders;
}
