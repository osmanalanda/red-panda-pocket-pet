import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { PetState, PetMood, ShopItem } from "@/types/pet";
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
  xpForLevel,
  ACHIEVEMENTS,
} from "@/constants/gameConfig";

const STORAGE_KEY = "pandapal_pet_state";

const DEFAULT_STATE: PetState = {
  name: "Kiki",
  hunger: 80,
  happiness: 80,
  xp: 0,
  level: 1,
  coins: 50,
  totalFeeds: 0,
  totalPlays: 0,
  totalCoinsEarned: 50,
  lastUpdateTime: Date.now(),
  inventory: [],
  achievements: [],
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
    lastUpdateTime: now,
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

export const [PetProvider, usePet] = createContextHook(() => {
  const [petState, setPetState] = useState<PetState>(DEFAULT_STATE);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [newAchievementName, setNewAchievementName] = useState<string | null>(null);
  const decayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadQuery = useQuery({
    queryKey: ["pet_state"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PetState;
        return applyDecay(parsed);
      }
      return { ...DEFAULT_STATE, lastUpdateTime: Date.now(), createdAt: Date.now() };
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
        const decayed = applyDecay(prev);
        if (decayed.hunger < 15 && prev.hunger >= 15) {
          setToastMessage("Your panda is getting hungry! 🍎");
        }
        if (decayed.happiness < 15 && prev.happiness >= 15) {
          setToastMessage("Your panda feels lonely... 🥺");
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
        setToastMessage("Your panda is already full! 😊");
        return prev;
      }
      let next = {
        ...prev,
        hunger: Math.min(MAX_STAT, prev.hunger + FEED_HUNGER_RESTORE),
        coins: prev.coins + FEED_COINS,
        totalFeeds: prev.totalFeeds + 1,
        totalCoinsEarned: prev.totalCoinsEarned + FEED_COINS,
        lastUpdateTime: Date.now(),
      };
      next = addXpAndCheckLevel(next, FEED_XP);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const play = useCallback(() => {
    setPetState((prev) => {
      if (prev.happiness >= MAX_STAT) {
        setToastMessage("Your panda is already super happy! 🎉");
        return prev;
      }
      let next = {
        ...prev,
        happiness: Math.min(MAX_STAT, prev.happiness + PLAY_HAPPINESS_RESTORE),
        coins: prev.coins + PLAY_COINS,
        totalPlays: prev.totalPlays + 1,
        totalCoinsEarned: prev.totalCoinsEarned + PLAY_COINS,
        lastUpdateTime: Date.now(),
      };
      next = addXpAndCheckLevel(next, PLAY_XP);
      next = processAchievements(next);
      return next;
    });
  }, [addXpAndCheckLevel, processAchievements]);

  const useItem = useCallback((item: ShopItem) => {
    setPetState((prev) => {
      const invItem = prev.inventory.find((i) => i.id === item.id);
      if (!invItem || invItem.quantity <= 0) {
        setToastMessage("You don't have this item! 🛒");
        return prev;
      }
      let next = {
        ...prev,
        hunger: Math.min(MAX_STAT, prev.hunger + item.hungerRestore),
        happiness: Math.min(MAX_STAT, prev.happiness + item.happinessRestore),
        inventory: prev.inventory.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        ).filter((i) => i.quantity > 0),
        lastUpdateTime: Date.now(),
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
      };
    });
  }, []);

  const dismissToast = useCallback(() => setToastMessage(null), []);

  const mood = useMemo<PetMood>(
    () => getMood(petState.hunger, petState.happiness),
    [petState.hunger, petState.happiness]
  );

  const xpProgress = useMemo(() => {
    const needed = xpForLevel(petState.level);
    return needed > 0 ? petState.xp / needed : 0;
  }, [petState.xp, petState.level]);

  const xpNeeded = useMemo(() => xpForLevel(petState.level), [petState.level]);

  return useMemo(() => ({
    petState,
    mood,
    xpProgress,
    xpNeeded,
    isReady,
    toastMessage,
    showLevelUp,
    newAchievementName,
    feed,
    play,
    useItem,
    buyItem,
    dismissToast,
  }), [petState, mood, xpProgress, xpNeeded, isReady, toastMessage, showLevelUp, newAchievementName, feed, play, useItem, buyItem, dismissToast]);
});
