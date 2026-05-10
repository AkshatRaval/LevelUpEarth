import { supabaseServer } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getFeed() {
  // Authenticated User
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Feed Posts
  const { data: posts, error } = await supabaseServer
    .from("actions")
    .select(
      `
      *,
      profiles (
        username,
        full_name,
        avatar_url,
        origin
      )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // User Likes
  let likedActionIds: string[] = [];

  if (user) {
    const { data: likes, error: likesError } = await supabaseServer
      .from("likes")
      .select("action_id")
      .eq("user_id", user.id);

    if (likesError) {
      throw new Error(likesError.message);
    }

    likedActionIds = likes?.map((like) => like.action_id) || [];
  }

  // Return Combined Feed Data
  return {
    posts,
    likedActionIds,
  };
}

export async function toggleActionLike(actionId: string, userId: string) {
  // Check Existing Like
  const { data: existingLike, error: checkError } = await supabaseServer
    .from("likes")
    .select("id")
    .eq("action_id", actionId)
    .eq("user_id", userId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error(checkError.message);
  }

  // Unlike
  if (existingLike) {
    const { error } = await supabaseServer
      .from("likes")
      .delete()
      .eq("action_id", actionId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      liked: false,
    };
  }

  // Like
  const { error } = await supabaseServer.from("likes").insert({
    action_id: actionId,
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    liked: true,
  };
}
