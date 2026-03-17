import { Achievement, ShopItem, DailyQuest } from "@/types/pet";

export const DECAY_RATE_PER_MINUTE = 0.225;
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

export const MINI_GAME_DURATION = 15000;
export const MINI_GAME_SPAWN_INTERVAL = 900;
export const MINI_GAME_COIN_PER_SCORE = 2;
export const MINI_GAME_XP_PER_SCORE = 3;

export const WASH_CLEANLINESS_RESTORE = 25;
export const WASH_XP = 8;
export const WASH_COINS = 3;

export const PET_HAPPINESS_RESTORE = 10;
export const PET_XP = 5;
export const PET_COINS = 2;

export const TICKLE_HAPPINESS_RESTORE = 15;
export const TICKLE_XP = 10;
export const TICKLE_COINS = 4;

export const MEMORY_GAME_PAIRS = 8;
export const MEMORY_GAME_COIN_PER_PAIR = 3;
export const MEMORY_GAME_XP_PER_PAIR = 4;
export const MEMORY_GAME_TIME_BONUS_THRESHOLD = 60;
export const MEMORY_GAME_TIME_BONUS_COINS = 15;
export const MEMORY_GAME_TIME_BONUS_XP = 20;

export const ACCESSORY_ITEMS = ["bow_tie", "crown", "scarf"] as const;

export function xpForLevel(level: number): number {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_GROWTH_FACTOR, level - 1));
}

export function getEvolutionStage(level: number): "baby" | "teen" | "adult" {
  if (level >= 10) return "adult";
  if (level >= 5) return "teen";
  return "baby";
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
  {
    id: "bow_tie",
    name: "Bow Tie",
    emoji: "🎀",
    description: "A dapper red bow tie",
    price: 80,
    hungerRestore: 0,
    happinessRestore: 15,
    xpBonus: 20,
    category: "accessory",
  },
  {
    id: "crown",
    name: "Golden Crown",
    emoji: "👑",
    description: "Fit for royalty",
    price: 150,
    hungerRestore: 0,
    happinessRestore: 30,
    xpBonus: 50,
    category: "accessory",
  },
  {
    id: "scarf",
    name: "Cozy Scarf",
    emoji: "🧣",
    description: "Keeps Kiki warm and stylish",
    price: 60,
    hungerRestore: 0,
    happinessRestore: 20,
    xpBonus: 15,
    category: "accessory",
  },
];

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: "feed_3",
    title: "Hungry Helper",
    description: "Feed Kiki 3 times",
    emoji: "🍎",
    target: 3,
    rewardCoins: 20,
    rewardXp: 25,
    type: "feed",
  },
  {
    id: "play_3",
    title: "Playful Pal",
    description: "Play with Kiki 3 times",
    emoji: "🎾",
    target: 3,
    rewardCoins: 20,
    rewardXp: 25,
    type: "play",
  },
  {
    id: "mini_game_1",
    title: "Game Time!",
    description: "Complete a mini-game",
    emoji: "🎯",
    target: 1,
    rewardCoins: 30,
    rewardXp: 35,
    type: "mini_game",
  },
  {
    id: "feed_5",
    title: "Chef's Kiss",
    description: "Feed Kiki 5 times",
    emoji: "👨‍🍳",
    target: 5,
    rewardCoins: 35,
    rewardXp: 40,
    type: "feed",
  },
  {
    id: "play_5",
    title: "Best Friend",
    description: "Play with Kiki 5 times",
    emoji: "💕",
    target: 5,
    rewardCoins: 35,
    rewardXp: 40,
    type: "play",
  },
  {
    id: "buy_1",
    title: "Shopaholic",
    description: "Buy an item from the shop",
    emoji: "🛒",
    target: 1,
    rewardCoins: 15,
    rewardXp: 20,
    type: "buy_item",
  },
  {
    id: "use_2",
    title: "Item Master",
    description: "Use 2 items from inventory",
    emoji: "✨",
    target: 2,
    rewardCoins: 25,
    rewardXp: 30,
    type: "use_item",
  },
  {
    id: "mini_game_2",
    title: "Gaming Pro",
    description: "Complete 2 mini-games",
    emoji: "🏆",
    target: 2,
    rewardCoins: 45,
    rewardXp: 50,
    type: "mini_game",
  },
];

export function getTodaysDailyQuests(): DailyQuest[] {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...DAILY_QUESTS].sort((a, b) => {
    const hashA = (seed * 31 + a.id.charCodeAt(0)) % 1000;
    const hashB = (seed * 31 + b.id.charCodeAt(0)) % 1000;
    return hashA - hashB;
  });
  return shuffled.slice(0, 3);
}

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
  {
    id: "mini_game_5",
    name: "Gamer Panda",
    description: "Play 5 mini-games",
    emoji: "🎯",
    condition: (s) => s.totalMiniGamesPlayed >= 5,
  },
  {
    id: "mini_game_20",
    name: "Arcade Master",
    description: "Play 20 mini-games",
    emoji: "🕹️",
    condition: (s) => s.totalMiniGamesPlayed >= 20,
  },
  {
    id: "first_wash",
    name: "Squeaky Clean",
    description: "Wash your pet for the first time",
    emoji: "🧽",
    condition: (s) => s.totalWashes >= 1,
  },
  {
    id: "wash_10",
    name: "Bath Master",
    description: "Wash your pet 10 times",
    emoji: "🛁",
    condition: (s) => s.totalWashes >= 10,
  },
  {
    id: "first_pet",
    name: "Gentle Touch",
    description: "Pet Kiki for the first time",
    emoji: "🤗",
    condition: (s) => s.totalPets >= 1,
  },
  {
    id: "pet_20",
    name: "Cuddle Expert",
    description: "Pet Kiki 20 times",
    emoji: "💞",
    condition: (s) => s.totalPets >= 20,
  },
  {
    id: "memory_master",
    name: "Memory Master",
    description: "Score 8 pairs in Memory Match",
    emoji: "🧠",
    condition: (s) => s.memoryGameHighScore >= 8,
  },
];
