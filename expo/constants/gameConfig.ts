import { Achievement, ShopItem } from "@/types/pet";

export const DECAY_RATE_PER_MINUTE = 0.15;
export const MAX_STAT = 100;
export const MIN_STAT = 0;

export const BASE_XP_PER_LEVEL = 100;
export const XP_GROWTH_FACTOR = 1.4;

export const FEED_XP = 10;
export const FEED_COINS = 5;
export const FEED_HUNGER_RESTORE = 20;

export const PLAY_XP = 15;
export const PLAY_COINS = 8;
export const PLAY_HAPPINESS_RESTORE = 25;

export function xpForLevel(level: number): number {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_GROWTH_FACTOR, level - 1));
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "apple",
    name: "Apple",
    emoji: "🍎",
    description: "A fresh, juicy apple",
    price: 10,
    hungerRestore: 15,
    happinessRestore: 5,
    xpBonus: 5,
    category: "food",
  },
  {
    id: "bamboo",
    name: "Bamboo",
    emoji: "🎋",
    description: "Red Panda's favorite snack!",
    price: 25,
    hungerRestore: 35,
    happinessRestore: 15,
    xpBonus: 15,
    category: "food",
  },
  {
    id: "cake",
    name: "Honey Cake",
    emoji: "🍰",
    description: "A sweet treat for special days",
    price: 50,
    hungerRestore: 50,
    happinessRestore: 25,
    xpBonus: 30,
    category: "food",
  },
  {
    id: "berries",
    name: "Mixed Berries",
    emoji: "🫐",
    description: "Antioxidant-rich berry mix",
    price: 15,
    hungerRestore: 20,
    happinessRestore: 10,
    xpBonus: 8,
    category: "food",
  },
  {
    id: "sushi",
    name: "Sushi Roll",
    emoji: "🍣",
    description: "Premium sushi platter",
    price: 75,
    hungerRestore: 60,
    happinessRestore: 30,
    xpBonus: 40,
    category: "food",
  },
  {
    id: "ball",
    name: "Bouncy Ball",
    emoji: "⚽",
    description: "A fun ball to chase around",
    price: 20,
    hungerRestore: 0,
    happinessRestore: 30,
    xpBonus: 10,
    category: "toy",
  },
  {
    id: "yarn",
    name: "Yarn Ball",
    emoji: "🧶",
    description: "Soft and colorful yarn to play with",
    price: 15,
    hungerRestore: 0,
    happinessRestore: 20,
    xpBonus: 8,
    category: "toy",
  },
  {
    id: "puzzle",
    name: "Puzzle Box",
    emoji: "🧩",
    description: "Stimulates the mind, big XP bonus!",
    price: 60,
    hungerRestore: 0,
    happinessRestore: 20,
    xpBonus: 50,
    category: "toy",
  },
  {
    id: "teddy",
    name: "Teddy Bear",
    emoji: "🧸",
    description: "A cuddly companion",
    price: 40,
    hungerRestore: 0,
    happinessRestore: 45,
    xpBonus: 15,
    category: "toy",
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_feed",
    name: "First Meal",
    description: "Feed your pet for the first time",
    emoji: "🍽️",
    condition: (s) => s.totalFeeds >= 1,
  },
  {
    id: "feed_10",
    name: "Snack Master",
    description: "Feed your pet 10 times",
    emoji: "🍕",
    condition: (s) => s.totalFeeds >= 10,
  },
  {
    id: "feed_50",
    name: "Gourmet Chef",
    description: "Feed your pet 50 times",
    emoji: "👨‍🍳",
    condition: (s) => s.totalFeeds >= 50,
  },
  {
    id: "first_play",
    name: "Playtime!",
    description: "Play with your pet for the first time",
    emoji: "🎮",
    condition: (s) => s.totalPlays >= 1,
  },
  {
    id: "play_10",
    name: "Fun Friend",
    description: "Play with your pet 10 times",
    emoji: "🎉",
    condition: (s) => s.totalPlays >= 10,
  },
  {
    id: "play_50",
    name: "Party Animal",
    description: "Play with your pet 50 times",
    emoji: "🎊",
    condition: (s) => s.totalPlays >= 50,
  },
  {
    id: "level_5",
    name: "Rising Star",
    description: "Reach level 5",
    emoji: "⭐",
    condition: (s) => s.level >= 5,
  },
  {
    id: "level_10",
    name: "Panda Pro",
    description: "Reach level 10",
    emoji: "🌟",
    condition: (s) => s.level >= 10,
  },
  {
    id: "level_25",
    name: "Legendary Keeper",
    description: "Reach level 25",
    emoji: "👑",
    condition: (s) => s.level >= 25,
  },
  {
    id: "coins_100",
    name: "Piggy Bank",
    description: "Earn 100 coins total",
    emoji: "🐷",
    condition: (s) => s.totalCoinsEarned >= 100,
  },
  {
    id: "coins_500",
    name: "Rich Panda",
    description: "Earn 500 coins total",
    emoji: "💰",
    condition: (s) => s.totalCoinsEarned >= 500,
  },
  {
    id: "coins_2000",
    name: "Treasure Hunter",
    description: "Earn 2000 coins total",
    emoji: "💎",
    condition: (s) => s.totalCoinsEarned >= 2000,
  },
  {
    id: "full_stats",
    name: "Perfect Care",
    description: "Max out both hunger and happiness",
    emoji: "💖",
    condition: (s) => s.hunger >= 100 && s.happiness >= 100,
  },
  {
    id: "week_old",
    name: "One Week Together",
    description: "Keep your pet for 7 days",
    emoji: "📅",
    condition: (s) => Date.now() - s.createdAt >= 7 * 24 * 60 * 60 * 1000,
  },
];
