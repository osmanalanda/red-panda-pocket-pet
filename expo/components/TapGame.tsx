import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import Colors from "@/constants/colors";
import { MINI_GAME_DURATION } from "@/constants/gameConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAME_AREA_WIDTH = SCREEN_WIDTH - 40;
const GAME_AREA_HEIGHT = 400;
const TARGET_SIZE = 60;

interface TapTarget {
  id: number;
  x: number;
  y: number;
  emoji: string;
  opacity: Animated.Value;
  scale: Animated.Value;
}

const TARGET_EMOJIS = ["🎋", "🍎", "🫐", "🍰", "🧸", "⭐", "💎", "🌸"];

interface TapGameProps {
  onGameEnd: (score: number) => void;
  onCancel: () => void;
}

export default function TapGame({ onGameEnd, onCancel }: TapGameProps) {
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(MINI_GAME_DURATION / 1000);
  const [targets, setTargets] = useState<TapTarget[]>([]);
  const [gamePhase, setGamePhase] = useState<"countdown" | "playing" | "ended">("countdown");
  const [countdown, setCountdown] = useState<number>(3);

  const targetIdRef = useRef<number>(0);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef<number>(0);

  const progressAnim = useRef(new Animated.Value(1)).current;
  const scorePopAnim = useRef(new Animated.Value(1)).current;

  const onGameEndRef = useRef(onGameEnd);
  onGameEndRef.current = onGameEnd;

  const cleanup = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
  }, []);

  const spawnTarget = useCallback(() => {
    const id = targetIdRef.current++;
    const x = Math.random() * (GAME_AREA_WIDTH - TARGET_SIZE);
    const y = Math.random() * (GAME_AREA_HEIGHT - TARGET_SIZE - 20) + 10;
    const emoji = TARGET_EMOJIS[Math.floor(Math.random() * TARGET_EMOJIS.length)];
    const opacity = new Animated.Value(0);
    const scale = new Animated.Value(0.3);

    const target: TapTarget = { id, x, y, emoji, opacity, scale };

    setTargets((prev) => [...prev.slice(-8), target]);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setTargets((prev) => prev.filter((t) => t.id !== id));
      });
    }, 2200);
  }, []);

  const endGame = useCallback(() => {
    cleanup();
    setGamePhase("ended");
    setTargets([]);
    setTimeout(() => onGameEndRef.current(scoreRef.current), 300);
  }, [cleanup]);

  const startGame = useCallback(() => {
    setGamePhase("playing");
    setTimeLeft(MINI_GAME_DURATION / 1000);
    scoreRef.current = 0;

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: MINI_GAME_DURATION,
      useNativeDriver: false,
    }).start();

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnTimerRef.current = setInterval(() => {
      spawnTarget();
    }, 900);
  }, [progressAnim, endGame, spawnTarget]);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
      cleanup();
    };
  }, [startGame, cleanup]);

  const handleTap = useCallback((targetId: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== targetId));
    setScore((prev) => {
      const newScore = prev + 1;
      scoreRef.current = newScore;
      return newScore;
    });

    Animated.sequence([
      Animated.timing(scorePopAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(scorePopAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
  }, [scorePopAnim]);

  if (gamePhase === "countdown") {
    return (
      <View style={styles.container}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>Get Ready!</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownHint}>Tap the items as fast as you can!</Text>
        </View>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerEmoji}>⏱️</Text>
          <Text style={[styles.timerText, timeLeft <= 5 && styles.timerDanger]}>
            {timeLeft}s
          </Text>
        </View>
        <Animated.View style={[styles.scoreContainer, { transform: [{ scale: scorePopAnim }] }]}>
          <Text style={styles.scoreEmoji}>⭐</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </Animated.View>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.gameArea}>
        {targets.map((target) => (
          <Animated.View
            key={target.id}
            style={[
              styles.targetWrapper,
              {
                left: target.x,
                top: target.y,
                opacity: target.opacity,
                transform: [{ scale: target.scale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.target}
              onPress={() => handleTap(target.id)}
              activeOpacity={0.6}
            >
              <Text style={styles.targetEmoji}>{target.emoji}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {gamePhase === "ended" && (
          <View style={styles.gameOverOverlay}>
            <Text style={styles.gameOverText}>Time's Up!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownLabel: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  countdownNumber: {
    fontSize: 80,
    fontWeight: "900" as const,
    color: Colors.primary,
  },
  countdownHint: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 20,
    fontWeight: "500" as const,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  timerEmoji: {
    fontSize: 18,
  },
  timerText: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  timerDanger: {
    color: Colors.danger,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  scoreEmoji: {
    fontSize: 18,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  gameArea: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(200,230,201,0.6)",
    minHeight: GAME_AREA_HEIGHT,
  },
  targetWrapper: {
    position: "absolute",
  },
  target: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  targetEmoji: {
    fontSize: 28,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: "900" as const,
    color: Colors.primary,
  },
});
