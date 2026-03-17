import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { PetMood, EvolutionStage } from "@/types/pet";
import { getEvolutionStage } from "@/constants/gameConfig";

interface PetSpriteProps {
  mood: PetMood;
  level: number;
  testID?: string;
}

const MOOD_FACES: Record<PetMood, { eyes: string; mouth: string; cheeks: boolean }> = {
  ecstatic: { eyes: "✨", mouth: "😄", cheeks: true },
  happy: { eyes: "◕", mouth: "◡", cheeks: true },
  neutral: { eyes: "●", mouth: "―", cheeks: false },
  sad: { eyes: "◔", mouth: "╥", cheeks: false },
  hungry: { eyes: "◕", mouth: "○", cheeks: false },
  miserable: { eyes: "x", mouth: "﹏", cheeks: false },
};

const STAGE_SIZES: Record<EvolutionStage, { body: number; face: number; ear: number; container: number }> = {
  baby: { body: 110, face: 78, ear: 28, container: 180 },
  teen: { body: 140, face: 100, ear: 36, container: 220 },
  adult: { body: 165, face: 118, ear: 42, container: 260 },
};

const STAGE_COLORS: Record<EvolutionStage, { body: string; dark: string; inner: string; badge: string }> = {
  baby: { body: "#E57373", dark: "#C62828", inner: "#FFAB91", badge: "#AB47BC" },
  teen: { body: "#D84315", dark: "#BF360C", inner: "#FF8A65", badge: "#7E57C2" },
  adult: { body: "#BF360C", dark: "#8E2400", inner: "#FF7043", badge: "#5E35B1" },
};

export default React.memo(function PetSprite({ mood, level, testID }: PetSpriteProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const earWiggle = useRef(new Animated.Value(0)).current;
  const sadnessOverlay = useRef(new Animated.Value(0)).current;

  const face = useMemo(() => MOOD_FACES[mood], [mood]);
  const stage = useMemo(() => getEvolutionStage(level), [level]);
  const sizes = useMemo(() => STAGE_SIZES[stage], [stage]);
  const colors = useMemo(() => STAGE_COLORS[stage], [stage]);
  const isSad = mood === "sad" || mood === "miserable" || mood === "hungry";

  useEffect(() => {
    Animated.timing(sadnessOverlay, {
      toValue: isSad ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isSad, sadnessOverlay]);

  useEffect(() => {
    if (mood === "ecstatic" || mood === "happy") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();

      const wiggle = Animated.loop(
        Animated.sequence([
          Animated.timing(earWiggle, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(earWiggle, { toValue: -1, duration: 800, useNativeDriver: true }),
          Animated.timing(earWiggle, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
      wiggle.start();

      return () => {
        pulse.stop();
        wiggle.stop();
      };
    } else {
      pulseAnim.setValue(1);
      earWiggle.setValue(0);
    }
  }, [mood, pulseAnim, earWiggle]);

  useEffect(() => {
    if (mood === "sad" || mood === "miserable") {
      const bob = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 5, duration: 2000, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      );
      bob.start();
      return () => bob.stop();
    }
    bounceAnim.setValue(0);
  }, [mood, bounceAnim]);

  const earRotate = earWiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-5deg", "0deg", "5deg"],
  });

  const stageLabel = stage === "baby" ? "Baby" : stage === "teen" ? "Teen" : "Adult";

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        {
          width: sizes.container,
          height: sizes.container,
          transform: [{ scale: pulseAnim }, { translateY: bounceAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.petBody,
          {
            width: sizes.body,
            height: sizes.body,
            borderRadius: sizes.body / 2,
            backgroundColor: colors.body,
            shadowColor: colors.dark,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.earLeft,
            {
              width: sizes.ear,
              height: sizes.ear,
              borderRadius: sizes.ear / 2,
              backgroundColor: colors.body,
              transform: [{ rotate: earRotate }],
            },
          ]}
        >
          <View
            style={[
              styles.earInner,
              {
                width: sizes.ear - 12,
                height: sizes.ear - 12,
                borderRadius: (sizes.ear - 12) / 2,
                backgroundColor: colors.inner,
              },
            ]}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.earRight,
            {
              width: sizes.ear,
              height: sizes.ear,
              borderRadius: sizes.ear / 2,
              backgroundColor: colors.body,
              transform: [{ rotate: earRotate }],
            },
          ]}
        >
          <View
            style={[
              styles.earInner,
              {
                width: sizes.ear - 12,
                height: sizes.ear - 12,
                borderRadius: (sizes.ear - 12) / 2,
                backgroundColor: colors.inner,
              },
            ]}
          />
        </Animated.View>

        <View
          style={[
            styles.face,
            {
              width: sizes.face,
              height: sizes.face * 0.9,
              borderRadius: sizes.face / 2,
            },
          ]}
        >
          <View style={styles.eyeRow}>
            <View style={styles.eyeContainer}>
              <Text style={[styles.eyeText, stage === "adult" && styles.eyeTextLarge]}>{face.eyes}</Text>
            </View>
            <View style={styles.eyeContainer}>
              <Text style={[styles.eyeText, stage === "adult" && styles.eyeTextLarge]}>{face.eyes}</Text>
            </View>
          </View>

          <View style={styles.nose} />
          <Text style={styles.mouth}>{face.mouth}</Text>

          {face.cheeks && (
            <View style={styles.cheekRow}>
              <View style={[styles.cheek, { backgroundColor: colors.inner }]} />
              <View style={[styles.cheek, { backgroundColor: colors.inner }]} />
            </View>
          )}
        </View>

        <View style={[styles.stripe1, { backgroundColor: colors.dark }]} />
        <View style={[styles.stripe2, { backgroundColor: colors.dark }]} />

        {stage === "adult" && (
          <>
            <View style={[styles.stripe3, { backgroundColor: colors.dark }]} />
            <View style={[styles.stripe4, { backgroundColor: colors.dark }]} />
          </>
        )}
      </View>

      <View style={styles.tailContainer}>
        <View style={[styles.tail, { backgroundColor: colors.body }]}>
          <View style={[styles.tailStripe, { backgroundColor: colors.dark }]} />
          <View style={[styles.tailStripe2, { backgroundColor: colors.dark }]} />
        </View>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.sadnessOverlay,
          {
            width: sizes.body + 20,
            height: sizes.body + 20,
            borderRadius: (sizes.body + 20) / 2,
            opacity: sadnessOverlay.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      />

      {isSad && (
        <View style={styles.sadIndicator}>
          <Text style={styles.sadEmoji}>💧</Text>
        </View>
      )}

      <View style={[styles.levelBadge, { backgroundColor: colors.badge }]}>
        <Text style={styles.levelText}>Lv.{level}</Text>
        <Text style={styles.stageText}>{stageLabel}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  petBody: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  earLeft: {
    position: "absolute" as const,
    top: -12,
    left: 15,
    zIndex: 1,
  },
  earRight: {
    position: "absolute" as const,
    top: -12,
    right: 15,
    zIndex: 1,
  },
  earInner: {
    position: "absolute" as const,
    top: 6,
    left: 6,
  },
  face: {
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  eyeRow: {
    flexDirection: "row" as const,
    gap: 24,
    marginBottom: 4,
  },
  eyeContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  eyeText: {
    fontSize: 18,
    color: "#37474F",
  },
  eyeTextLarge: {
    fontSize: 22,
  },
  nose: {
    width: 10,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#37474F",
    marginBottom: 2,
  },
  mouth: {
    fontSize: 16,
    color: "#37474F",
    marginTop: -2,
  },
  cheekRow: {
    flexDirection: "row" as const,
    gap: 50,
    position: "absolute" as const,
    bottom: 18,
  },
  cheek: {
    width: 16,
    height: 10,
    borderRadius: 8,
    opacity: 0.7,
  },
  stripe1: {
    position: "absolute" as const,
    top: 20,
    left: 8,
    width: 20,
    height: 6,
    borderRadius: 3,
    transform: [{ rotate: "-20deg" }],
  },
  stripe2: {
    position: "absolute" as const,
    top: 20,
    right: 8,
    width: 20,
    height: 6,
    borderRadius: 3,
    transform: [{ rotate: "20deg" }],
  },
  stripe3: {
    position: "absolute" as const,
    top: 38,
    left: 4,
    width: 16,
    height: 5,
    borderRadius: 3,
    transform: [{ rotate: "-15deg" }],
  },
  stripe4: {
    position: "absolute" as const,
    top: 38,
    right: 4,
    width: 16,
    height: 5,
    borderRadius: 3,
    transform: [{ rotate: "15deg" }],
  },
  tailContainer: {
    position: "absolute" as const,
    bottom: 25,
    right: 10,
  },
  tail: {
    width: 50,
    height: 20,
    borderRadius: 10,
    transform: [{ rotate: "25deg" }],
  },
  tailStripe: {
    position: "absolute" as const,
    top: 4,
    left: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tailStripe2: {
    position: "absolute" as const,
    top: 4,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sadnessOverlay: {
    position: "absolute" as const,
    backgroundColor: "#5C6BC0",
  },
  sadIndicator: {
    position: "absolute" as const,
    top: 5,
    right: 25,
  },
  sadEmoji: {
    fontSize: 22,
  },
  levelBadge: {
    position: "absolute" as const,
    bottom: 0,
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  levelText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800" as const,
  },
  stageText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "600" as const,
  },
});
