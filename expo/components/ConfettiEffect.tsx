import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CONFETTI_COUNT = 30;
const CONFETTI_COLORS = [
  "#FF8A65",
  "#FFD54F",
  "#66BB6A",
  "#7E57C2",
  "#F48FB1",
  "#4FC3F7",
  "#FF7043",
  "#AED581",
];

interface ConfettiPiece {
  x: number;
  color: string;
  size: number;
  rotation: number;
}

interface ConfettiEffectProps {
  visible: boolean;
}

export default React.memo(function ConfettiEffect({ visible }: ConfettiEffectProps) {
  const animations = useRef<Animated.Value[]>(
    Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(0))
  ).current;

  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: CONFETTI_COUNT }, () => ({
        x: Math.random() * SCREEN_WIDTH,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      })),
    []
  );

  useEffect(() => {
    if (visible) {
      animations.forEach((anim) => anim.setValue(0));
      const anims = animations.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          delay: i * 30,
          useNativeDriver: true,
        })
      );
      Animated.stagger(20, anims).start();
    }
  }, [visible, animations]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece, i) => {
        const translateY = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [-50, SCREEN_HEIGHT + 50],
        });
        const translateX = animations[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 120],
        });
        const rotate = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${piece.rotation + 720}deg`],
        });
        const opacity = animations[i].interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 1, 0],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                left: piece.x,
                width: piece.size,
                height: piece.size * 1.5,
                backgroundColor: piece.color,
                borderRadius: piece.size / 4,
                transform: [{ translateY }, { translateX }, { rotate }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  piece: {
    position: "absolute",
    top: 0,
  },
});
