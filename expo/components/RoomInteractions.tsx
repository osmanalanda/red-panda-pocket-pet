import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface RoomInteractionsProps {
  onWash: () => void;
  onTickle: () => void;
  onPet: () => void;
}

export default function RoomInteractions({
  onWash,
  onTickle,
  onPet,
}: RoomInteractionsProps) {
  const [activeMode, setActiveMode] = useState<"none" | "wash" | "tickle" | "pet">("none");
  const [washProgress, setWashProgress] = useState<number>(0);
  const [tapCount, setTapCount] = useState<number>(0);
  const washFillAnim = useRef(new Animated.Value(0)).current;
  const spongeX = useRef(new Animated.Value(0)).current;
  const spongeY = useRef(new Animated.Value(0)).current;
  const bubbleAnims = useRef<Animated.Value[]>([]).current;
  const tickleShake = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const tapCountRef = useRef<number>(0);
  const washProgressRef = useRef<number>(0);

  const resetMode = useCallback(() => {
    setActiveMode("none");
    setWashProgress(0);
    setTapCount(0);
    tapCountRef.current = 0;
    washProgressRef.current = 0;
    washFillAnim.setValue(0);
  }, [washFillAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        spongeX.setValue(gestureState.moveX - SCREEN_WIDTH / 2);
        spongeY.setValue(gestureState.moveY - 300);

        washProgressRef.current = Math.min(washProgressRef.current + 0.8, 100);
        setWashProgress(washProgressRef.current);

        Animated.timing(washFillAnim, {
          toValue: washProgressRef.current / 100,
          duration: 50,
          useNativeDriver: false,
        }).start();

        if (washProgressRef.current % 10 < 1) {
          spawnBubble();
        }

        if (washProgressRef.current >= 100) {
          if (Platform.OS !== "web") {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          onWash();
          setTimeout(resetMode, 500);
        }
      },
      onPanResponderRelease: () => {
        Animated.spring(spongeX, { toValue: 0, useNativeDriver: true }).start();
        Animated.spring(spongeY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const spawnBubble = useCallback(() => {
    const anim = new Animated.Value(0);
    bubbleAnims.push(anim);
    Animated.timing(anim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      const idx = bubbleAnims.indexOf(anim);
      if (idx > -1) bubbleAnims.splice(idx, 1);
    });
  }, [bubbleAnims]);

  const handleTickleTap = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    tapCountRef.current += 1;
    setTapCount(tapCountRef.current);

    Animated.sequence([
      Animated.timing(tickleShake, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(tickleShake, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(tickleShake, { toValue: 5, duration: 40, useNativeDriver: true }),
      Animated.timing(tickleShake, { toValue: -5, duration: 40, useNativeDriver: true }),
      Animated.timing(tickleShake, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();

    if (tapCountRef.current >= 8) {
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onTickle();
      setTimeout(resetMode, 1000);
    }
  }, [onTickle, resetMode, tickleShake]);

  const handleLongPress = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.2, useNativeDriver: true, tension: 100 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPet();
  }, [onPet, heartScale]);

  if (activeMode === "none") {
    return (
      <View style={styles.modeSelector}>
        <Text style={styles.modeTitle}>Interact with Kiki</Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[styles.modeButton, styles.washButton]}
            onPress={() => setActiveMode("wash")}
          >
            <Text style={styles.modeEmoji}>🧽</Text>
            <Text style={styles.modeLabel}>Wash</Text>
            <Text style={styles.modeHint}>Drag to scrub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, styles.tickleButton]}
            onPress={() => setActiveMode("tickle")}
          >
            <Text style={styles.modeEmoji}>😆</Text>
            <Text style={styles.modeLabel}>Tickle</Text>
            <Text style={styles.modeHint}>Tap rapidly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, styles.petButton]}
            onPress={() => setActiveMode("pet")}
          >
            <Text style={styles.modeEmoji}>🤗</Text>
            <Text style={styles.modeLabel}>Pet</Text>
            <Text style={styles.modeHint}>Long press</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (activeMode === "wash") {
    return (
      <View style={styles.interactionArea}>
        <View style={styles.interactionHeader}>
          <Text style={styles.interactionTitle}>🧽 Wash Kiki</Text>
          <TouchableOpacity onPress={resetMode} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.interactionHint}>Drag the sponge over Kiki!</Text>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: washFillAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: Colors.cleanliness,
              },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>{Math.round(washProgress)}%</Text>

        <View style={styles.washArea} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.sponge,
              {
                transform: [
                  { translateX: spongeX },
                  { translateY: spongeY },
                ],
              },
            ]}
          >
            <Text style={styles.spongeEmoji}>🧽</Text>
          </Animated.View>

          {bubbleAnims.map((anim, i) => (
            <Animated.View
              key={`bubble-${i}`}
              style={[
                styles.bubble,
                {
                  left: Math.random() * 200 + 30,
                  opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
                  transform: [{
                    translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }),
                  }],
                },
              ]}
            >
              <Text style={styles.bubbleText}>🫧</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }

  if (activeMode === "tickle") {
    return (
      <View style={styles.interactionArea}>
        <View style={styles.interactionHeader}>
          <Text style={styles.interactionTitle}>😆 Tickle Kiki</Text>
          <TouchableOpacity onPress={resetMode} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.interactionHint}>Tap rapidly to make Kiki laugh!</Text>

        <View style={styles.tapCounter}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={`tap-${i}`}
              style={[
                styles.tapDot,
                i < tapCount && styles.tapDotActive,
              ]}
            />
          ))}
        </View>

        <Animated.View style={{ transform: [{ translateX: tickleShake }] }}>
          <TouchableOpacity
            style={styles.tickleTarget}
            onPress={handleTickleTap}
            activeOpacity={0.6}
          >
            <Text style={styles.tickleTargetEmoji}>👆</Text>
            <Text style={styles.tickleTargetText}>Tap!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  if (activeMode === "pet") {
    return (
      <View style={styles.interactionArea}>
        <View style={styles.interactionHeader}>
          <Text style={styles.interactionTitle}>🤗 Pet Kiki</Text>
          <TouchableOpacity onPress={resetMode} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.interactionHint}>Long press to pet Kiki gently</Text>

        <Animated.View style={{ transform: [{ scale: heartScale.interpolate({
          inputRange: [0, 1, 1.2],
          outputRange: [1, 1, 1.2],
        }) }] }}>
          <TouchableOpacity
            style={styles.petTarget}
            onLongPress={handleLongPress}
            delayLongPress={500}
            activeOpacity={0.7}
          >
            <Text style={styles.petTargetEmoji}>❤️</Text>
            <Text style={styles.petTargetText}>Hold to pet</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  modeSelector: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  modeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  washButton: {
    backgroundColor: "#E3F2FD",
  },
  tickleButton: {
    backgroundColor: "#FFF3E0",
  },
  petButton: {
    backgroundColor: "#FCE4EC",
  },
  modeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  modeHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  interactionArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  interactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  interactionTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "700" as const,
  },
  interactionHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontWeight: "500" as const,
  },
  progressContainer: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
    textAlign: "right",
    marginBottom: 12,
  },
  washArea: {
    height: 180,
    backgroundColor: "rgba(227, 242, 253, 0.5)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(33, 150, 243, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  sponge: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  spongeEmoji: {
    fontSize: 40,
  },
  bubble: {
    position: "absolute",
    top: 80,
  },
  bubbleText: {
    fontSize: 18,
  },
  tapCounter: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  tapDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E0E0E0",
  },
  tapDotActive: {
    backgroundColor: Colors.primary,
  },
  tickleTarget: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  tickleTargetEmoji: {
    fontSize: 36,
  },
  tickleTargetText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginTop: 4,
  },
  petTarget: {
    alignSelf: "center",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FCE4EC",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EC407A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  petTargetEmoji: {
    fontSize: 40,
  },
  petTargetText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#EC407A",
    marginTop: 4,
  },
});
