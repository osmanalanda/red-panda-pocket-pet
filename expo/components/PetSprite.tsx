import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { PetMood } from "@/types/pet";

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

export default React.memo(function PetSprite({ mood, level, testID }: PetSpriteProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const earWiggle = useRef(new Animated.Value(0)).current;

  const face = useMemo(() => MOOD_FACES[mood], [mood]);

  useEffect(() => {
    if (mood === "ecstatic" || mood === "happy") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      const wiggle = Animated.loop(
        Animated.sequence([
          Animated.timing(earWiggle, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(earWiggle, {
            toValue: -1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(earWiggle, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
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
          Animated.timing(bounceAnim, {
            toValue: 5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
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

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        {
          transform: [
            { scale: pulseAnim },
            { translateY: bounceAnim },
          ],
        },
      ]}
    >
      <View style={styles.petBody}>
        <Animated.View style={[styles.earLeft, { transform: [{ rotate: earRotate }] }]}>
          <View style={styles.earInner} />
        </Animated.View>
        <Animated.View style={[styles.earRight, { transform: [{ rotate: earRotate }] }]}>
          <View style={styles.earInner} />
        </Animated.View>

        <View style={styles.face}>
          <View style={styles.eyeRow}>
            <View style={styles.eyeContainer}>
              <Text style={styles.eyeText}>{face.eyes}</Text>
            </View>
            <View style={styles.eyeContainer}>
              <Text style={styles.eyeText}>{face.eyes}</Text>
            </View>
          </View>

          <View style={styles.nose} />

          <Text style={styles.mouth}>{face.mouth}</Text>

          {face.cheeks && (
            <View style={styles.cheekRow}>
              <View style={styles.cheek} />
              <View style={styles.cheek} />
            </View>
          )}
        </View>

        <View style={styles.stripe1} />
        <View style={styles.stripe2} />
      </View>

      <View style={styles.tailContainer}>
        <View style={styles.tail}>
          <View style={styles.tailStripe} />
          <View style={styles.tailStripe2} />
        </View>
      </View>

      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>Lv.{level}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 220,
  },
  petBody: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#D84315",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#BF360C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  earLeft: {
    position: "absolute",
    top: -12,
    left: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D84315",
    zIndex: 1,
  },
  earRight: {
    position: "absolute",
    top: -12,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D84315",
    zIndex: 1,
  },
  earInner: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF8A65",
  },
  face: {
    width: 100,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  eyeRow: {
    flexDirection: "row",
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
    flexDirection: "row",
    gap: 50,
    position: "absolute",
    bottom: 18,
  },
  cheek: {
    width: 16,
    height: 10,
    borderRadius: 8,
    backgroundColor: "#FFAB91",
    opacity: 0.7,
  },
  stripe1: {
    position: "absolute",
    top: 20,
    left: 8,
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#BF360C",
    transform: [{ rotate: "-20deg" }],
  },
  stripe2: {
    position: "absolute",
    top: 20,
    right: 8,
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#BF360C",
    transform: [{ rotate: "20deg" }],
  },
  tailContainer: {
    position: "absolute",
    bottom: 15,
    right: 10,
  },
  tail: {
    width: 50,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D84315",
    transform: [{ rotate: "25deg" }],
  },
  tailStripe: {
    position: "absolute",
    top: 4,
    left: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#BF360C",
  },
  tailStripe2: {
    position: "absolute",
    top: 4,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#BF360C",
  },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "#7E57C2",
    paddingHorizontal: 12,
    paddingVertical: 4,
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
});
