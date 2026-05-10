import { useEffect, useState } from "react";

export function useFeed() {
  const [feedItems, setFeedItems] = useState<any[]>([]);

  const [likedActionIds, setLikedActionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  async function fetchFeed() {
    try {
      const res = await fetch("/api/feed");
      const data = await res.json();
      setFeedItems(data.posts || []);

      setLikedActionIds(data.likedActionIds || []);
    } finally {
      setLoading(false);
    }
  }

  const toggleLike = async (actionId: string) => {
    try {
      const response = await fetch("/api/feed/like", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          actionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to toggle like");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to toggle like");
    }
  };

  return {
    feedItems,
    likedActionIds,
    loading,
    toggleLike,
  };
}
