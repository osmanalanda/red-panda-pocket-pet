import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { usePet } from "@/providers/PetProvider";
import TapGame from "@/components/TapGame";
import RewardsModal from "@/components/RewardsModal";

export default function MiniGameScreen() {
  const insets = useSafeAreaInsets();
  const { claimMiniGameReward } = usePet();
  const [gameScore, setGameScore] = useState<number | null>(null);
  const [showRewards, setShowRewards] = useState<boolean>(false);

  const handleGameEnd = useCallback((score: number) => {
    setGameScore(score);
    setShowRewards(true);
  }, []);

  const handleClaim = useCallback(() => {
    if (gameScore !== null) {
      claimMiniGameReward({ score: gameScore, coinsEarned: 0, xpEarned: 0 });
    }
    setShowRewards(false);
    router.back();
  }, [gameScore, claimMiniGameReward]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.backgroundLight, Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <TapGame onGameEnd={handleGameEnd} onCancel={handleCancel} />
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
