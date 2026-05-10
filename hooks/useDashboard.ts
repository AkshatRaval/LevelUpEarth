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
  dailyXp: number;
  dailyXpCap: number;
  currentStreak: number;
  longestStreak: number;
  lastActionDate: string | null;
  xpProgress: XPProgress;
}

interface CooldownStatus {
  available: boolean;
  remainingMs: number;
}

export function useDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [stats, setStats] = useState({ trees: 0, water: 0, energy: 0 });
  const [progression, setProgression] = useState<Progression | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, CooldownStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        if (data.success) {
          setUserData(data.user);
          setRecentActions(data.recentActions || []);
          if (data.stats) {
            setStats(data.stats);
          }
          if (data.progression) {
            setProgression(data.progression);
          }
          if (data.cooldowns) {
            setCooldowns(data.cooldowns);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return {
    userData,
    recentActions,
    stats,
    progression,
    cooldowns,
    loading,
  };
}
