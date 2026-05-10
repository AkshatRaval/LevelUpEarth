// ─── Cooldowns (in hours) ───
export const COOLDOWNS: Record<string, number> = {
  plantedTree: 2,
  wateredPlant: 0.25,
  savedWater: 1,
  cycled: 0.5,
  recycledWaste: 1,
  cleanedArea: 1.5,
};

// ─── Points per action type ───
export const POINTS: Record<string, number> = {
  plantedTree: 50,
  wateredPlant: 10,
  savedWater: 20,
  cycled: 15,
  recycledWaste: 25,
  cleanedArea: 30,
};

// ─── Daily XP Cap ───
export const DAILY_XP_CAP = 200;

// ─── Level Progression ───
export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  emoji: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1,  title: "Seedling",        minXP: 0,     emoji: "🌱" },
  { level: 2,  title: "Sprout",          minXP: 100,   emoji: "🌿" },
  { level: 3,  title: "Sapling",         minXP: 300,   emoji: "🪴" },
  { level: 4,  title: "Green Warrior",   minXP: 600,   emoji: "⚔️" },
  { level: 5,  title: "Eco Champion",    minXP: 1000,  emoji: "🏅" },
  { level: 6,  title: "Nature Guardian", minXP: 1500,  emoji: "🛡️" },
  { level: 7,  title: "Earth Protector", minXP: 2500,  emoji: "🌍" },
  { level: 8,  title: "Planet Savior",   minXP: 4000,  emoji: "🚀" },
  { level: 9,  title: "Global Legend",   minXP: 6000,  emoji: "👑" },
  { level: 10, title: "Earth Master",    minXP: 10000, emoji: "✨" },
];

// ─── Helpers ───
export function getLevelFromXP(totalXP: number): LevelInfo {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.minXP) {
      current = lvl;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevel(currentLevel: number): LevelInfo | null {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel);
  if (idx === -1 || idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

export function getXPProgress(totalXP: number): {
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  progressPercent: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
} {
  const currentLevel = getLevelFromXP(totalXP);
  const nextLevel = getNextLevel(currentLevel.level);

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progressPercent: 100,
      xpInCurrentLevel: totalXP - currentLevel.minXP,
      xpNeededForNext: 0,
    };
  }

  const xpInCurrentLevel = totalXP - currentLevel.minXP;
  const xpNeededForNext = nextLevel.minXP - currentLevel.minXP;
  const progressPercent = Math.min(
    Math.round((xpInCurrentLevel / xpNeededForNext) * 100),
    100
  );

  return {
    currentLevel,
    nextLevel,
    progressPercent,
    xpInCurrentLevel,
    xpNeededForNext,
  };
}
