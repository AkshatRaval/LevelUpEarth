import { supabaseServer } from "@/lib/supabase/admin";
import { getXPProgress } from "@/constants/GameConfig";

export async function getProfile(userId: string) {
  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error(profileError.message);
  }

  const { data: actionsData, error: actionsError } = await supabaseServer
    .from("actions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (actionsError) {
    throw new Error(actionsError.message);
  }

  const totalPoints = actionsData?.reduce((acc, curr) => acc + (curr.points || 0), 0) || 0;

  // XP progress from profile
  const totalXp = profile?.total_xp || 0;
  const xpProgress = getXPProgress(totalXp);

  return {
    profile: profile || null,
    history: actionsData || [],
    stats: {
      totalPoints,
      actionsCount: actionsData?.length || 0,
    },
    progression: {
      level: profile?.level || 1,
      totalXp,
      currentStreak: profile?.current_streak || 0,
      longestStreak: profile?.longest_streak || 0,
      xpProgress,
    },
  };
}

export async function updateAvatar(userId: string, file: File) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}-${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabaseServer.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabaseServer.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabaseServer.from("profiles").upsert({
    id: userId,
    avatar_url: avatarUrl,
  });

  if (updateError) throw new Error(updateError.message);

  return { avatarUrl };
}
