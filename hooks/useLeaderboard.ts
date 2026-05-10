import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Leader } from '@/services/leaderboard.service';

export function useLeaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<Leader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const [res, { data: { user } }] = await Promise.all([
          fetch('/api/leaderboard'),
          supabase.auth.getUser()
        ]);

        const data: Leader[] = await res.json();
        setLeaders(data || []);

        if (user && data) {
          const userRankInfo = data.find(l => l.id === user.id);
          if (userRankInfo) setCurrentUserRank(userRankInfo);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return {
    leaders,
    currentUserRank,
    loading
  };
}
