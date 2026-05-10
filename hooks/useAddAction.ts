import { useState } from "react";

interface ActionResult {
  success: boolean;
  message: string;
  xp?: {
    awarded: number;
    dailyUsed: number;
    dailyCap: number;
    totalXp: number;
  };
  level?: {
    current: { level: number; title: string; emoji: string };
    didLevelUp: boolean;
    oldLevel: number;
  };
  streak?: {
    current: number;
    longest: number;
  };
}

export function useAddAction() {
  const [loading, setLoading] = useState(false);

  const submitAction = async (
    type: string,
    title: string,
    description: string,
    file: File
  ): Promise<ActionResult> => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("photo", file, file.name);

      const response = await fetch("/api/feature/add-action", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit action");
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitAction,
    loading,
  };
}
