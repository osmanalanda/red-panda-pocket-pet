import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePet } from "@/providers/PetProvider";
import TapGame from "@/components/TapGame";
import MemoryGame from "@/components/MemoryGame";
import RewardsModal from "@/components/RewardsModal";
import { MEMORY_GAME_TIME_BONUS_THRESHOLD } from "@/constants/gameConfig";

type GameMode = "select" | "tap" | "memory";

export default function MiniGameScreen() {
  const insets = useSafeAreaInsets();
  const { claimMiniGameReward, claimMemoryGameReward } = usePet();
  const [gameMode, setGameMode] = useState<GameMode>("select");
  const [gameScore, setGameScore] = useState<number | null>(null);
  const [showRewards, setShowRewards] = useState<boolean>(false);
  const [memoryResult, setMemoryResult] = useState<{ pairs: number; time: number } | null>(null);

  const handleTapGameEnd = useCallback((score: number) => {
    setGameScore(score);
    setShowRewards(true);
  }, []);

  const handleMemoryGameEnd = useCallback((pairs: number, timeSeconds: number) => {
    setMemoryResult({ pairs, time: timeSeconds });
    setGameScore(pairs);
    setShowRewards(true);
  }, []);

  const handleClaim = useCallback(() => {
    if (gameMode === "tap" && gameScore !== null) {
      claimMiniGameReward({ score: gameScore, coinsEarned: 0, xpEarned: 0 });
    } else if (gameMode === "memory" && memoryResult) {
      const timeBonus = memoryResult.time <= MEMORY_GAME_TIME_BONUS_THRESHOLD;
      claimMemoryGameReward(memoryResult.pairs, timeBonus);
    }
    setShowRewards(false);
    router.back();
  }, [gameMode, gameScore, memoryResult, claimMiniGameReward, claimMemoryGameReward]);

  const handleCancel = useCallback(() => {
    if (gameMode === "select") {
      router.back();
    } else {
      setGameMode("select");
      setGameScore(null);
      setMemoryResult(null);
    }
  }, [gameMode]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.backgroundLight, Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFill}
      />

      {gameMode === "select" ? (
        <View style={[styles.selectorContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.selectorHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.selectorTitle}>Mini Games</Text>
            <View style={styles.backButton} />
          </View>

          <Text style={styles.selectorSubtitle}>Choose a game to play!</Text>

          <View style={styles.gameCards}>
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => setGameMode("tap")}
              activeOpacity={0.8}
            >
              <View style={[styles.gameCardIcon, { backgroundColor: "#FFF3E0" }]}>
                <Text style={styles.gameCardEmoji}>🎯</Text>
              </View>
              <Text style={styles.gameCardTitle}>Tap Rush</Text>
              <Text style={styles.gameCardDesc}>Tap targets as fast as you can before time runs out!</Text>
              <View style={styles.gameCardReward}>
                <Text style={styles.rewardText}>🪙 2/tap  ⚡ 3 XP/tap</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => setGameMode("memory")}
              activeOpacity={0.8}
            >
              <View style={[styles.gameCardIcon, { backgroundColor: "#E8F5E9" }]}>
                <Text style={styles.gameCardEmoji}>🧠</Text>
              </View>
              <Text style={styles.gameCardTitle}>Memory Match</Text>
              <Text style={styles.gameCardDesc}>Match all 8 pairs of panda-themed cards!</Text>
              <View style={styles.gameCardReward}>
                <Text style={styles.rewardText}>🪙 3/pair  ⚡ 4 XP/pair</Text>
              </View>
              <View style={styles.timeBonusBadge}>
                <Text style={styles.timeBonusText}>⏱️ Under 60s = bonus!</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
          ]}
        >
          {gameMode === "tap" && (
            <TapGame onGameEnd={handleTapGameEnd} onCancel={handleCancel} />
          )}
          {gameMode === "memory" && (
            <MemoryGame onGameEnd={handleMemoryGameEnd} onCancel={handleCancel} />
          )}
        </View>
      )}

      <RewardsModal
        visible={showRewards}
        score={gameScore ?? 0}
        onClaim={handleClaim}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  selectorContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  selectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectorTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  selectorSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
    textAlign: "center",
    marginBottom: 28,
  },
  gameCards: {
    gap: 16,
  },
  gameCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  gameCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  gameCardEmoji: {
    fontSize: 28,
  },
  gameCardTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  gameCardDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
    lineHeight: 20,
    marginBottom: 12,
  },
  gameCardReward: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  rewardText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  timeBonusBadge: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  timeBonusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#F57F17",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
