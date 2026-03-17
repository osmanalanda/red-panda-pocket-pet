import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { PetMood, EvolutionStage } from "@/types/pet";
import { getEvolutionStage } from "@/constants/gameConfig";
import AccessoryOverlay from "@/components/AccessoryOverlay";

interface PetSpriteProps {
  mood: PetMood;
  level: number;
  activeAccessories?: string[];
  showHearts?: boolean;
  testID?: string;
}

const MOOD_FACES: Record<PetMood, { eyes: string; mouth: string; cheeks: boolean }> = {
  ecstatic: { eyes: "✨", mouth: "😄", cheeks: true },
  happy: { eyes: "◕", mouth: "◡", cheeks: true },
  neutral: { eyes: "●", mouth: "―", cheeks: false },
  sad: { eyes: "◔", mouth: "╥", cheeks: false },
  hungry: { eyes: "◕", mouth: "○", cheeks: false },
  miserable: { eyes: "x", mouth: "﹏", cheeks: false },
  laughing: { eyes: "≧", mouth: "▽", cheeks: true },
};

const STAGE_SIZES: Record<EvolutionStage, {
  body: number; face: number; ear: number; container: number;
  eyePatchW: number; eyePatchH: number; snout: number;
}> = {
  baby: { body: 120, face: 82, ear: 30, container: 200, eyePatchW: 26, eyePatchH: 22, snout: 28 },
  teen: { body: 150, face: 106, ear: 38, container: 240, eyePatchW: 32, eyePatchH: 28, snout: 34 },
  adult: { body: 175, face: 124, ear: 44, container: 280, eyePatchW: 38, eyePatchH: 32, snout: 40 },
};

const STAGE_COLORS: Record<EvolutionStage, {
  body: string; dark: string; inner: string; badge: string;
  belly: string; patch: string; nose: string;
}> = {
  baby: {
    body: "#D4623A", dark: "#8B3A1F", inner: "#FFB89A", badge: "#AB47BC",
    belly: "#F5DCC8", patch: "#2D1B11", nose: "#1A1A1A",
  },
  teen: {
    body: "#C0502A", dark: "#7A2E15", inner: "#FFA07A", badge: "#7E57C2",
    belly: "#F0D0B0", patch: "#231510", nose: "#1A1A1A",
  },
  adult: {
    body: "#A84420", dark: "#6B2812", inner: "#FF8C60", badge: "#5E35B1",
    belly: "#ECC8A8", patch: "#1A0E08", nose: "#0D0D0D",
  },
};

export default React.memo(function PetSprite({
  mood,
  level,
  activeAccessories = [],
  showHearts = false,
  testID,
}: PetSpriteProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const earWiggle = useRef(new Animated.Value(0)).current;
  const sadnessOverlay = useRef(new Animated.Value(0)).current;
  const laughShake = useRef(new Animated.Value(0)).current;
  const heartAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const face = useMemo(() => MOOD_FACES[mood], [mood]);
  const stage = useMemo(() => getEvolutionStage(level), [level]);
  const sizes = useMemo(() => STAGE_SIZES[stage], [stage]);
  const colors = useMemo(() => STAGE_COLORS[stage], [stage]);
  const isSad = mood === "sad" || mood === "miserable" || mood === "hungry";
  const isLaughing = mood === "laughing";

  useEffect(() => {
    if (showHearts) {
      heartAnims.forEach((anim, i) => {
        anim.setValue(0);
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [showHearts, heartAnims]);

  useEffect(() => {
    if (isLaughing) {
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(laughShake, { toValue: 4, duration: 80, useNativeDriver: true }),
          Animated.timing(laughShake, { toValue: -4, duration: 80, useNativeDriver: true }),
          Animated.timing(laughShake, { toValue: 3, duration: 60, useNativeDriver: true }),
          Animated.timing(laughShake, { toValue: -3, duration: 60, useNativeDriver: true }),
          Animated.timing(laughShake, { toValue: 0, duration: 40, useNativeDriver: true }),
          Animated.delay(200),
        ])
      );
      shake.start();
      return () => shake.stop();
    }
    laughShake.setValue(0);
  }, [isLaughing, laughShake]);

  useEffect(() => {
    Animated.timing(sadnessOverlay, {
      toValue: isSad ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isSad, sadnessOverlay]);

  useEffect(() => {
    if (mood === "ecstatic" || mood === "happy" || mood === "laughing") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
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
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  const stageLabel = stage === "baby" ? "Baby" : stage === "teen" ? "Teen" : "Adult";

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        {
          width: sizes.container,
          height: sizes.container + 20,
          transform: [
            { scale: pulseAnim },
            { translateY: bounceAnim },
            { translateX: laughShake },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.petBody,
          {
            width: sizes.body,
            height: sizes.body * 1.05,
            borderRadius: sizes.body / 2,
            backgroundColor: colors.body,
            shadowColor: colors.dark,
          },
        ]}
      >
        <View style={[styles.furTexture1, { backgroundColor: colors.dark, opacity: 0.15 }]} />
        <View style={[styles.furTexture2, { backgroundColor: colors.dark, opacity: 0.1 }]} />
        <View style={[styles.furTexture3, { backgroundColor: colors.inner, opacity: 0.12 }]} />

        <Animated.View
          style={[
            styles.earLeft,
            {
              width: sizes.ear,
              height: sizes.ear * 1.2,
              borderTopLeftRadius: sizes.ear / 2,
              borderTopRightRadius: sizes.ear / 2,
              borderBottomLeftRadius: sizes.ear / 3,
              borderBottomRightRadius: sizes.ear / 3,
              backgroundColor: colors.dark,
              transform: [{ rotate: earRotate }, { rotate: "-15deg" }],
            },
          ]}
        >
          <View
            style={[
              styles.earInnerRealistic,
              {
                width: sizes.ear - 14,
                height: (sizes.ear - 14) * 1.1,
                borderTopLeftRadius: (sizes.ear - 14) / 2,
                borderTopRightRadius: (sizes.ear - 14) / 2,
                borderBottomLeftRadius: (sizes.ear - 14) / 3,
                borderBottomRightRadius: (sizes.ear - 14) / 3,
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
              height: sizes.ear * 1.2,
              borderTopLeftRadius: sizes.ear / 2,
              borderTopRightRadius: sizes.ear / 2,
              borderBottomLeftRadius: sizes.ear / 3,
              borderBottomRightRadius: sizes.ear / 3,
              backgroundColor: colors.dark,
              transform: [{ rotate: earRotate }, { rotate: "15deg" }],
            },
          ]}
        >
          <View
            style={[
              styles.earInnerRealistic,
              {
                width: sizes.ear - 14,
                height: (sizes.ear - 14) * 1.1,
                borderTopLeftRadius: (sizes.ear - 14) / 2,
                borderTopRightRadius: (sizes.ear - 14) / 2,
                borderBottomLeftRadius: (sizes.ear - 14) / 3,
                borderBottomRightRadius: (sizes.ear - 14) / 3,
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
              height: sizes.face * 0.85,
              borderRadius: sizes.face / 2,
              backgroundColor: colors.belly,
            },
          ]}
        >
          <View style={styles.eyePatchRow}>
            <View
              style={[
                styles.eyePatch,
                {
                  width: sizes.eyePatchW,
                  height: sizes.eyePatchH,
                  borderRadius: sizes.eyePatchW / 2,
                  backgroundColor: colors.patch,
                },
              ]}
            >
              <Text style={[styles.eyeText, stage === "adult" && styles.eyeTextLarge]}>
                {face.eyes}
              </Text>
            </View>
            <View
              style={[
                styles.eyePatch,
                {
                  width: sizes.eyePatchW,
                  height: sizes.eyePatchH,
                  borderRadius: sizes.eyePatchW / 2,
                  backgroundColor: colors.patch,
                },
              ]}
            >
              <Text style={[styles.eyeText, stage === "adult" && styles.eyeTextLarge]}>
                {face.eyes}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.snout,
              {
                width: sizes.snout,
                height: sizes.snout * 0.7,
                borderRadius: sizes.snout / 2,
                backgroundColor: colors.belly,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <View style={[styles.noseRealistic, { backgroundColor: colors.nose }]} />
            <Text style={styles.mouth}>{face.mouth}</Text>
          </View>

          {face.cheeks && (
            <View style={styles.cheekRow}>
              <View style={[styles.cheek, { backgroundColor: colors.inner }]} />
              <View style={[styles.cheek, { backgroundColor: colors.inner }]} />
            </View>
          )}

          {isLaughing && (
            <View style={styles.laughLines}>
              <Text style={styles.laughEmoji}>😆</Text>
            </View>
          )}
        </View>

        <View style={[styles.bellyPatch, {
          backgroundColor: colors.belly,
          width: sizes.body * 0.55,
          height: sizes.body * 0.35,
          borderRadius: sizes.body * 0.28,
          bottom: -sizes.body * 0.05,
        }]} />

        <View style={[styles.pawLeft, { backgroundColor: colors.dark }]} />
        <View style={[styles.pawRight, { backgroundColor: colors.dark }]} />
      </View>

      <View style={styles.tailContainer}>
        <View style={[styles.tailRealistic, { backgroundColor: colors.body }]}>
          <View style={[styles.tailRing1, { backgroundColor: colors.dark }]} />
          <View style={[styles.tailRing2, { backgroundColor: colors.dark }]} />
          <View style={[styles.tailTip, { backgroundColor: colors.dark }]} />
        </View>
      </View>

      <AccessoryOverlay
        activeAccessories={activeAccessories}
        stage={stage}
        bodySize={sizes.body}
      />

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
              outputRange: [0, 0.25],
            }),
          },
        ]}
      />

      {isSad && (
        <View style={styles.sadIndicator}>
          <Text style={styles.sadEmoji}>💧</Text>
        </View>
      )}

      {showHearts && heartAnims.map((anim, i) => (
        <Animated.View
          key={`heart-${i}`}
          pointerEvents="none"
          style={[
            styles.heartFloat,
            {
              left: sizes.container * 0.3 + i * 30,
              opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
              transform: [{
                translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }),
              }],
            },
          ]}
        >
          <Text style={styles.heartEmoji}>❤️</Text>
        </Animated.View>
      ))}

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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: "visible",
  },
  furTexture1: {
    position: "absolute" as const,
    top: 12,
    left: 8,
    width: 30,
    height: 4,
    borderRadius: 2,
    transform: [{ rotate: "-25deg" }],
  },
  furTexture2: {
    position: "absolute" as const,
    top: 12,
    right: 8,
    width: 30,
    height: 4,
    borderRadius: 2,
    transform: [{ rotate: "25deg" }],
  },
  furTexture3: {
    position: "absolute" as const,
    top: 20,
    left: 20,
    width: 18,
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: "-10deg" }],
  },
  earLeft: {
    position: "absolute" as const,
    top: -18,
    left: 10,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  earRight: {
    position: "absolute" as const,
    top: -18,
    right: 10,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  earInnerRealistic: {
    position: "absolute" as const,
    top: 8,
  },
  face: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    paddingTop: 4,
  },
  eyePatchRow: {
    flexDirection: "row" as const,
    gap: 18,
    marginBottom: 2,
  },
  eyePatch: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eyeText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  eyeTextLarge: {
    fontSize: 18,
  },
  snout: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
    paddingTop: 2,
  },
  noseRealistic: {
    width: 12,
    height: 8,
    borderRadius: 6,
    marginBottom: 1,
  },
  mouth: {
    fontSize: 13,
    color: "#37474F",
    marginTop: -3,
  },
  cheekRow: {
    flexDirection: "row" as const,
    gap: 44,
    position: "absolute" as const,
    bottom: 14,
  },
  cheek: {
    width: 16,
    height: 10,
    borderRadius: 8,
    opacity: 0.6,
  },
  laughLines: {
    position: "absolute" as const,
    top: -10,
    right: -10,
  },
  laughEmoji: {
    fontSize: 20,
  },
  bellyPatch: {
    position: "absolute" as const,
    zIndex: 0,
  },
  pawLeft: {
    position: "absolute" as const,
    bottom: -6,
    left: 20,
    width: 22,
    height: 14,
    borderRadius: 11,
    zIndex: 3,
  },
  pawRight: {
    position: "absolute" as const,
    bottom: -6,
    right: 20,
    width: 22,
    height: 14,
    borderRadius: 11,
    zIndex: 3,
  },
  tailContainer: {
    position: "absolute" as const,
    bottom: 30,
    right: 5,
  },
  tailRealistic: {
    width: 55,
    height: 22,
    borderRadius: 11,
    transform: [{ rotate: "20deg" }],
    overflow: "hidden",
  },
  tailRing1: {
    position: "absolute" as const,
    top: 2,
    left: 8,
    width: 8,
    height: 18,
    borderRadius: 4,
    opacity: 0.7,
  },
  tailRing2: {
    position: "absolute" as const,
    top: 2,
    left: 22,
    width: 8,
    height: 18,
    borderRadius: 4,
    opacity: 0.5,
  },
  tailTip: {
    position: "absolute" as const,
    top: 3,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.8,
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
  heartFloat: {
    position: "absolute" as const,
    top: 10,
  },
  heartEmoji: {
    fontSize: 20,
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
