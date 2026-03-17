import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import Colors from "@/constants/colors";
import { MINI_GAME_COIN_PER_SCORE, MINI_GAME_XP_PER_SCORE } from "@/constants/gameConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface RewardsModalProps {
  visible: boolean;
  score: number;
  onClaim: () => void;
}

export default React.memo(function RewardsModal({ visible, score, onClaim }: RewardsModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;

  const coinsEarned = score * MINI_GAME_COIN_PER_SCORE;
  const xpEarned = score * MINI_GAME_XP_PER_SCORE;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      coinAnim.setValue(0);
      xpAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        Animated.stagger(200, [
          Animated.spring(coinAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
          Animated.spring(xpAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
        ]).start();
      });
    }
  }, [visible, scaleAnim, opacityAnim, coinAnim, xpAnim]);

  if (!visible) return null;

  const gradeEmoji = score >= 15 ? "🏆" : score >= 10 ? "🌟" : score >= 5 ? "⭐" : "👍";
  const gradeText = score >= 15 ? "Amazing!" : score >= 10 ? "Great Job!" : score >= 5 ? "Nice!" : "Good Try!";

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Pressable style={styles.overlay} onPress={() => {}}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.gradeEmoji}>{gradeEmoji}</Text>
          <Text style={styles.gradeText}>{gradeText}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>

          <View style={styles.rewardsRow}>
            <Animated.View
              style={[
                styles.rewardCard,
                {
                  transform: [{ scale: coinAnim }],
                  opacity: coinAnim,
                },
              ]}
            >
              <Text style={styles.rewardEmoji}>🪙</Text>
              <Text style={styles.rewardValue}>+{coinsEarned}</Text>
              <Text style={styles.rewardLabel}>Coins</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.rewardCard,
                {
                  transform: [{ scale: xpAnim }],
                  opacity: xpAnim,
                },
              ]}
            >
              <Text style={styles.rewardEmoji}>⚡</Text>
              <Text style={styles.rewardValue}>+{xpEarned}</Text>
              <Text style={styles.rewardLabel}>XP</Text>
            </Animated.View>
          </View>

          <TouchableOpacity style={styles.claimButton} onPress={onClaim} activeOpacity={0.8}>
            <Text style={styles.claimText}>Claim Rewards</Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 30,
    width: SCREEN_WIDTH - 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  gradeEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  gradeText: {
    fontSize: 28,
    fontWeight: "900" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "900" as const,
    color: Colors.primary,
    marginBottom: 24,
  },
  rewardsRow: {
    flexDirection: "row" as const,
    gap: 16,
    marginBottom: 28,
  },
  rewardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rewardEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  claimButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  claimText: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#FFF",
  },
});
