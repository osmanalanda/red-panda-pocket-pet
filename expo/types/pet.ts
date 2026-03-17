export interface PetState {
  name: string;
  hunger: number;
  happiness: number;
  xp: number;
  level: number;
  coins: number;
  totalFeeds: number;
  totalPlays: number;
  totalCoinsEarned: number;
  totalMiniGamesPlayed: number;
  lastUpdateTime: number;
  inventory: InventoryItem[];
  achievements: string[];
  dailyQuests: DailyQuestProgress[];
  dailyQuestsLastReset: number;
  createdAt: number;
}

export interface InventoryItem {
  id: string;
  quantity: number;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  hungerRestore: number;
  happinessRestore: number;
  xpBonus: number;
  category: "food" | "toy" | "accessory";
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (state: PetState) => boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  type: "feed" | "play" | "mini_game" | "buy_item" | "use_item";
}

export interface DailyQuestProgress {
  questId: string;
  progress: number;
  claimed: boolean;
}

export interface MiniGameResult {
  score: number;
  coinsEarned: number;
  xpEarned: number;
}

export type PetMood = "ecstatic" | "happy" | "neutral" | "sad" | "hungry" | "miserable";

export type EvolutionStage = "baby" | "teen" | "adult";
