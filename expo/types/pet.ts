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
  lastUpdateTime: number;
  inventory: InventoryItem[];
  achievements: string[];
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
  category: "food" | "toy";
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (state: PetState) => boolean;
}

export type PetMood = "ecstatic" | "happy" | "neutral" | "sad" | "hungry" | "miserable";
