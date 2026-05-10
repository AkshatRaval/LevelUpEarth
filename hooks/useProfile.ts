import { useState, useEffect } from "react";

interface XPProgress {
  currentLevel: { level: number; title: string; emoji: string; minXP: number };
  nextLevel: { level: number; title: string; emoji: string; minXP: number } | null;
  progressPercent: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
}

interface Progression {
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  xpProgress: XPProgress;
}

export function useProfile() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalPoints: 0, actionsCount: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProfileData = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data.success) {
        setUser({ ...data.user, profile: data.profile });
        setHistory(data.history || []);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.progression) {
          setProgression(data.progression);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to upload avatar");
      }

      setUser((prev: any) => ({
        ...prev,
        profile: { ...prev?.profile, avatar_url: data.avatarUrl },
      }));

      return data.avatarUrl;
    } finally {
      setUploading(false);
    }
  };

  return {
    user,
    stats,
    history,
    progression,
    loading,
    uploading,
    uploadAvatar,
    refetch: fetchProfileData,
  };
}
