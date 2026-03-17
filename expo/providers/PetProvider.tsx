import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { PetState, PetMood, ShopItem, DailyQuestProgress, MiniGameResult } from "@/types/pet";
import {
  DECAY_RATE_PER_MINUTE,
  MAX_STAT,
  MIN_STAT,
  FEED_XP,
  FEED_COINS,
  FEED_HUNGER_RESTORE,
  PLAY_XP,
  PLAY_COINS,
  PLAY_HAPPINESS_RESTORE,
  MINI_GAME_COIN_PER_SCORE,
  MINI_GAME_XP_PER_SCORE,
  WASH_CLEANLINESS_RESTORE,
  WASH_XP,
  WASH_COINS,
  PET_HAPPINESS_RESTORE,
  PET_XP,
  PET_COINS,
  TICKLE_HAPPINESS_RESTORE,
  TICKLE_XP,
  TICKLE_COINS,
  xpForLevel,
  ACHIEVEMENTS,
  getTodaysDailyQuests,
  DAILY_QUESTS,
} from "@/constants/gameConfig";

const STORAGE_KEY = "pandapal_pet_state";

function getStartOfDay(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const DEFAULT_STATE: PetState = {
  name: "Kiki",
  hunger: 80,
  happiness: 80,
  cleanliness: 80,
  xp: 0,
  level: 1,
  coins: 55,
  totalFeeds: 0,
  totalPlays: 0,
  totalWashes: 0,
  totalPets: 0,
  totalCoinsEarned: 55,
  totalMiniGamesPlayed: 0,
  memoryGameHighScore: 0,
  lastUpdateTime: Date.now(),
  inventory: [],
  activeAccessories: [],
  achievements: [],
  dailyQuests: [],
  dailyQuestsLastReset: 0,
  createdAt: Date.now(),
};

function applyDecay(state: PetState): PetState {
  const now = Date.now();
  const elapsed = (now - state.lastUpdateTime) / 60000;
  if (elapsed < 0.5) return state;

  const decay = elapsed * DECAY_RATE_PER_MINUTE;
  return {
    ...state,
    hunger: Math.max(MIN_STAT, state.hunger - decay),
    happiness: Math.max(MIN_STAT, state.happiness - decay * 0.8),
    cleanliness: Math.max(MIN_STAT, state.cleanliness - decay * 0.6),
    lastUpdateTime: now,
  };
}

function resetDailyQuestsIfNeeded(state: PetState): PetState {
  const todayStart = getStartOfDay();
  if (state.dailyQuestsLastReset >= todayStart) return state;

  const todaysQuests = getTodaysDailyQuests();
  const freshProgress: DailyQuestProgress[] = todaysQuests.map((q) => ({
    questId: q.id,
    progress: 0,
    claimed: false,
  }));

  return {
    ...state,
    dailyQuests: freshProgress,
    dailyQuestsLastReset: todayStart,
  };
}

function getMood(hunger: number, happiness: number): PetMood {
  const avg = (hunger + happiness) / 2;
  if (avg >= 85) return "ecstatic";
  if (avg >= 65) return "happy";
  if (avg >= 45) return "neutral";
  if (hunger < 20) return "hungry";
  if (avg >= 25) return "sad";
  return "miserable";
}

function checkNewAchievements(state: PetState): string[] {
  const newAchievements: string[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!state.achievements.includes(achievement.id) && achievement.condition(state)) {
      newAchievements.push(achievement.id);
    }
  }
  return newAchievements;
}

function advanceQuestProgress(
  quests: DailyQuestProgress[],
  type: string,
  amount: number = 1
): DailyQuestProgress[] {
  const todaysQuests = getTodaysDailyQuests();
  return quests.map((qp) => {
    const questDef = todaysQuests.find((q) => q.id === qp.questId);
    if (!questDef || questDef.type !== type || qp.claimed) return qp;
    return { ...qp, progress: Math.min(qp.progress + amount, questDef.target) };
  });
}

export const [PetProvider, usePet] = createContextHook(() => {
  const [petState, setPetState] = useState<PetState>(DEFAULT_STATE);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [newAchievementName, setNewAchievementName] = useState<string | null>(null);
  const [isLaughing, setIsLaughing] = useState<boolean>(false);
  const decayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadQuery = useQuery({
    queryKey: ["pet_state"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PetState;
        const migrated: PetState = {
          ...DEFAULT_STATE,
          ...parsed,
          cleanliness: parsed.cleanliness ?? 80,
          totalWashes: parsed.totalWashes ?? 0,
          totalPets: parsed.totalPets ?? 0,
          memoryGameHighScore: parsed.memoryGameHighScore ?? 0,
          activeAccessories: parsed.activeAccessories ?? [],
          totalMiniGamesPlayed: parsed.totalMiniGamesPlayed ?? 0,
          dailyQuests: parsed.dailyQuests ?? [],
          dailyQuestsLastReset: parsed.dailyQuestsLastReset ?? 0,
        };
        let state = applyDecay(migrated);
        state = resetDailyQuestsIfNeeded(state);
        return state;
      }
      const fresh = { ...DEFAULT_STATE, lastUpdateTime: Date.now(), createdAt: Date.now() };
      return resetDailyQuestsIfNeeded(fresh);
    },
    staleTime: Infinity,
  });

  const saveMutation = useMutation({
    mutationFn: async (state: PetState) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    },
  });

  useEffect(() => {
    if (loadQuery.data && !isReady) {
      setPetState(loadQuery.data);
      setIsReady(true);
    }
  }, [loadQuery.data, isReady]);

  const saveMutateRef = useRef(saveMutation.mutate);
  saveMutateRef.current = saveMutation.mutate;

  useEffect(() => {
    if (!isReady) return;
    saveMutateRef.current(petState);
  }, [petState, isReady]);

  useEffect(() => {
    if (!isReady) return;
    decayIntervalRef.current = setInterval(() => {
      setPetState((prev) => {
        let decayed = applyDecay(prev);
        decayed = resetDailyQuestsIfNeeded(decayed);
        if (decayed.hunger < 15 && prev.hunger >= 15) {
          setToastMessage("Kiki is getting hungry! 🍎");
        }
        if (decayed.happiness < 15 && prev.happiness >= 15) {
          setToastMessage("Kiki feels lonely... 🥺");
        }
        if (decayed.cleanliness < 15 && prev.cleanliness >= 15) {
          setToastMessage("Kiki needs a bath! 🛁");
        }
        return decayed;
      });
    }, 30000);

    return () => {
      if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);
    };
  }, [isReady]);

  const addXpAndCheckLevel = useCallback((state: PetState, xpGain: number): PetState => {
    let newXp = state.xp + xpGain;
    let newLevel = state.level;
    let leveled = false;

    while (newXp >= xpForLevel(newLevel)) {
      newXp -= xpForLevel(newLevel);
      newLevel++;
      leveled = true;
    }

    if (leveled) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }

    return { ...state, xp: newXp, level: newLevel };
  }, []);

  const processAchievements = useCallback((state: PetState): PetState => {
    const newIds = checkNewAchievements(state);
    if (newIds.length > 0) {
      const first = ACHIEVEMENTS.find((a) => a.id === newIds[0]);
      if (first) {
        setNewAchievementName(`${first.emoji} ${first.name}`);
        setTimeout(() => setNewAchievementName(null), 3000);
      }
      return { ...state, achievements: [...state.achievements, ...newIds] };
    }
    return state;
  }, []);

  const feed = useCallback(() => {
    setPetState((prev) => {
      if (prev.hunger >= MAX_STAT) {
        setToastMessage("Kiki is already full! 😊");
        return prev;
      }
      let next: PetState = {
        ...prev,
        hunger: Math.min(MAX_STAT, prev.hunger + FEED_HUNGER_RESTORE),
        coins: prev.coins + FEED_COINS,
        totalFeeds: prev.totalFeeds + 1,
        totalCoinsEarned: prev.totalCoinsEarned + FEED_COINS,
        lastUpdateTime: Date.now(),
        dailyQuests: advanceQuestProgress(prev.dailyQuests, "feed"),
      };
      next = addXpAndCheckLevel(next, FEED_XP);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const play = useCallback(() => {
    setPetState((prev) => {
      if (prev.happiness >= MAX_STAT) {
        setToastMessage("Kiki is already super happy! 🎉");
        return prev;
      }
      let next: PetState = {
        ...prev,
        happiness: Math.min(MAX_STAT, prev.happiness + PLAY_HAPPINESS_RESTORE),
        coins: prev.coins + PLAY_COINS,
        totalPlays: prev.totalPlays + 1,
        totalCoinsEarned: prev.totalCoinsEarned + PLAY_COINS,
        lastUpdateTime: Date.now(),
        dailyQuests: advanceQuestProgress(prev.dailyQuests, "play"),
      };
      next = addXpAndCheckLevel(next, PLAY_XP);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const wash = useCallback(() => {
    setPetState((prev) => {
      if (prev.cleanliness >= MAX_STAT) {
        setToastMessage("Kiki is already sparkling clean! ✨");
        return prev;
      }
      let next: PetState = {
        ...prev,
        cleanliness: Math.min(MAX_STAT, prev.cleanliness + WASH_CLEANLINESS_RESTORE),
        coins: prev.coins + WASH_COINS,
        totalWashes: prev.totalWashes + 1,
        totalCoinsEarned: prev.totalCoinsEarned + WASH_COINS,
        lastUpdateTime: Date.now(),
      };
      next = addXpAndCheckLevel(next, WASH_XP);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const petKiki = useCallback(() => {
    setPetState((prev) => {
      let next: PetState = {
        ...prev,
        happiness: Math.min(MAX_STAT, prev.happiness + PET_HAPPINESS_RESTORE),
        coins: prev.coins + PET_COINS,
        totalPets: prev.totalPets + 1,
        totalCoinsEarned: prev.totalCoinsEarned + PET_COINS,
        lastUpdateTime: Date.now(),
      };
      next = addXpAndCheckLevel(next, PET_XP);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const tickle = useCallback(() => {
    setIsLaughing(true);
    setTimeout(() => setIsLaughing(false), 2000);
    setPetState((prev) => {
      let next: PetState = {
        ...prev,
        happiness: Math.min(MAX_STAT, prev.happiness + TICKLE_HAPPINESS_RESTORE),
        coins: prev.coins + TICKLE_COINS,
        totalCoinsEarned: prev.totalCoinsEarned + TICKLE_COINS,
        lastUpdateTime: Date.now(),
      };
      next = addXpAndCheckLevel(next, TICKLE_XP);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const toggleAccessory = useCallback((accessoryId: string) => {
    setPetState((prev) => {
      const isActive = prev.activeAccessories.includes(accessoryId);
      const hasItem = prev.inventory.some((i) => i.id === accessoryId);
      if (!hasItem && !isActive) {
        setToastMessage("You don't own this accessory! 🛒");
        return prev;
      }
      const newActive = isActive
        ? prev.activeAccessories.filter((id) => id !== accessoryId)
        : [...prev.activeAccessories, accessoryId];
      setToastMessage(isActive ? "Accessory removed!" : "Accessory equipped! ✨");
      return { ...prev, activeAccessories: newActive };
    });
  }, []);

  const useItem = useCallback((item: ShopItem) => {
    setPetState((prev) => {
      const invItem = prev.inventory.find((i) => i.id === item.id);
      if (!invItem || invItem.quantity <= 0) {
        setToastMessage("You don't have this item! 🛒");
        return prev;
      }

      const isAccessory = item.category === "accessory";
      if (isAccessory) {
        const isActive = prev.activeAccessories.includes(item.id);
        const newActive = isActive
          ? prev.activeAccessories.filter((id) => id !== item.id)
          : [...prev.activeAccessories, item.id];
        setToastMessage(isActive ? `Removed ${item.emoji} ${item.name}` : `Equipped ${item.emoji} ${item.name}!`);
        return { ...prev, activeAccessories: newActive };
      }

      let next: PetState = {
        ...prev,
        hunger: Math.min(MAX_STAT, prev.hunger + item.hungerRestore),
        happiness: Math.min(MAX_STAT, prev.happiness + item.happinessRestore),
        inventory: prev.inventory
          .map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0),
        lastUpdateTime: Date.now(),
        dailyQuests: advanceQuestProgress(prev.dailyQuests, "use_item"),
      };
      next = addXpAndCheckLevel(next, item.xpBonus);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const buyItem = useCallback((item: ShopItem) => {
    setPetState((prev) => {
      if (prev.coins < item.price) {
        setToastMessage("Not enough coins! 💰");
        return prev;
      }
      const existing = prev.inventory.find((i) => i.id === item.id);
      const newInventory = existing
        ? prev.inventory.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev.inventory, { id: item.id, quantity: 1 }];

      setToastMessage(`Bought ${item.emoji} ${item.name}!`);
      return {
        ...prev,
        coins: prev.coins - item.price,
        inventory: newInventory,
        dailyQuests: advanceQuestProgress(prev.dailyQuests, "buy_item"),
      };
    });
  }, []);

  const claimMiniGameReward = useCallback((result: MiniGameResult) => {
    setPetState((prev) => {
      const coinsEarned = result.score * MINI_GAME_COIN_PER_SCORE;
      const xpEarned = result.score * MINI_GAME_XP_PER_SCORE;

      let next: PetState = {
        ...prev,
        coins: prev.coins + coinsEarned,
        happiness: Math.min(MAX_STAT, prev.happiness + Math.min(result.score * 2, 30)),
        totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
        totalMiniGamesPlayed: prev.totalMiniGamesPlayed + 1,
        lastUpdateTime: Date.now(),
        dailyQuests: advanceQuestProgress(prev.dailyQuests, "mini_game"),
      };
      next = addXpAndCheckLevel(next, xpEarned);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const claimMemoryGameReward = useCallback((pairs: number, timeBonus: boolean) => {
    setPetState((prev) => {
      const coinsEarned = pairs * 3 + (timeBonus ? 15 : 0);
      const xpEarned = pairs * 4 + (timeBonus ? 20 : 0);

      let next: PetState = {
        ...prev,
        coins: prev.coins + coinsEarned,
        happiness: Math.min(MAX_STAT, prev.happiness + Math.min(pairs * 3, 30)),
        totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
        totalMiniGamesPlayed: prev.totalMiniGamesPlayed + 1,
        memoryGameHighScore: Math.max(prev.memoryGameHighScore, pairs),
        lastUpdateTime: Date.now(),
        dailyQuests: advanceQuestProgress(prev.dailyQuests, "mini_game"),
      };
      next = addXpAndCheckLevel(next, xpEarned);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const claimDailyQuest = useCallback((questId: string) => {
    setPetState((prev) => {
      const qp = prev.dailyQuests.find((q) => q.questId === questId);
      if (!qp || qp.claimed) return prev;

      const todaysQuests = getTodaysDailyQuests();
      const questDef = todaysQuests.find((q) => q.id === questId);
      if (!questDef) {
        const allQuestsDef = DAILY_QUESTS.find((q) => q.id === questId);
        if (!allQuestsDef || qp.progress < allQuestsDef.target) return prev;

        let next: PetState = {
          ...prev,
          coins: prev.coins + allQuestsDef.rewardCoins,
          totalCoinsEarned: prev.totalCoinsEarned + allQuestsDef.rewardCoins,
          dailyQuests: prev.dailyQuests.map((q) =>
            q.questId === questId ? { ...q, claimed: true } : q
          ),
        };
        next = addXpAndCheckLevel(next, allQuestsDef.rewardXp);
        setToastMessage(`Quest complete! +${allQuestsDef.rewardCoins}🪙 +${allQuestsDef.rewardXp}XP`);
        return next;
      }

      if (qp.progress < questDef.target) return prev;

      let next: PetState = {
        ...prev,
        coins: prev.coins + questDef.rewardCoins,
        totalCoinsEarned: prev.totalCoinsEarned + questDef.rewardCoins,
        dailyQuests: prev.dailyQuests.map((q) =>
          q.questId === questId ? { ...q, claimed: true } : q
        ),
      };
      next = addXpAndCheckLevel(next, questDef.rewardXp);
      setToastMessage(`Quest complete! +${questDef.rewardCoins}🪙 +${questDef.rewardXp}XP`);
      return next;
    });
  }, [addXpAndCheckLevel]);

  const dismissToast = useCallback(() => setToastMessage(null), []);

  const mood = useMemo<PetMood>(() => {
    if (isLaughing) return "laughing";
    return getMood(petState.hunger, petState.happiness);
  }, [petState.hunger, petState.happiness, isLaughing]);

  const xpProgress = useMemo(() => {
    const needed = xpForLevel(petState.level);
    return needed > 0 ? petState.xp / needed : 0;
  }, [petState.xp, petState.level]);

  const xpNeeded = useMemo(() => xpForLevel(petState.level), [petState.level]);

  return useMemo(
    () => ({
      petState,
      mood,
      xpProgress,
      xpNeeded,
      isReady,
      isLaughing,
      toastMessage,
      showLevelUp,
      newAchievementName,
      feed,
      play,
      wash,
      petKiki,
      tickle,
      toggleAccessory,
      useItem,
      buyItem,
      claimMiniGameReward,
      claimMemoryGameReward,
      claimDailyQuest,
      dismissToast,
    }),
    [
      petState,
      mood,
      xpProgress,
      xpNeeded,
      isReady,
      isLaughing,
      toastMessage,
      showLevelUp,
      newAchievementName,
      feed,
      play,
      wash,
      petKiki,
      tickle,
      toggleAccessory,
      useItem,
      buyItem,
      claimMiniGameReward,
      claimMemoryGameReward,
      claimDailyQuest,
      dismissToast,
    ]
  );
});
