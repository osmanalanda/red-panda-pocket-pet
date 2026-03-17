import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { EvolutionStage } from "@/types/pet";

interface AccessoryOverlayProps {
  activeAccessories: string[];
  stage: EvolutionStage;
  bodySize: number;
}

interface AccessoryPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  emoji: string;
  fontSize: number;
  rotate?: string;
}

const ACCESSORY_POSITIONS: Record<string, Record<EvolutionStage, AccessoryPosition>> = {
  bow_tie: {
    baby: { top: 68, left: -8, emoji: "🎀", fontSize: 22, rotate: "0deg" },
    teen: { top: 88, left: -10, emoji: "🎀", fontSize: 26, rotate: "0deg" },
    adult: { top: 102, left: -12, emoji: "🎀", fontSize: 30, rotate: "0deg" },
  },
  crown: {
    baby: { top: -30, left: 20, emoji: "👑", fontSize: 28, rotate: "-5deg" },
    teen: { top: -36, left: 28, emoji: "👑", fontSize: 34, rotate: "-5deg" },
    adult: { top: -40, left: 34, emoji: "👑", fontSize: 38, rotate: "-5deg" },
  },
  scarf: {
    baby: { top: 60, left: -14, emoji: "🧣", fontSize: 24, rotate: "10deg" },
    teen: { top: 78, left: -16, emoji: "🧣", fontSize: 28, rotate: "10deg" },
    adult: { top: 92, left: -18, emoji: "🧣", fontSize: 32, rotate: "10deg" },
  },
};

export default React.memo(function AccessoryOverlay({
  activeAccessories,
  stage,
  bodySize,
}: AccessoryOverlayProps) {
  const accessories = useMemo(() => {
    return activeAccessories
      .filter((id) => ACCESSORY_POSITIONS[id])
      .map((id) => ({
        id,
        position: ACCESSORY_POSITIONS[id][stage],
      }));
  }, [activeAccessories, stage]);

  if (accessories.length === 0) return null;

  return (
    <View
      style={[
        styles.overlay,
        {
          width: bodySize + 40,
          height: bodySize + 40,
        },
      ]}
      pointerEvents="none"
    >
      {accessories.map((acc) => (
        <View
          key={acc.id}
          style={[
            styles.accessoryItem,
            {
              top: acc.position.top,
              left: acc.position.left,
              right: acc.position.right,
              bottom: acc.position.bottom,
            },
          ]}
        >
          <Text
            style={[
              styles.accessoryEmoji,
              {
                fontSize: acc.position.fontSize,
                transform: [{ rotate: acc.position.rotate ?? "0deg" }],
              },
            ]}
          >
            {acc.position.emoji}
          </Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: "absolute" as const,
    zIndex: 10,
  },
  accessoryItem: {
    position: "absolute" as const,
    zIndex: 11,
  },
  accessoryEmoji: {
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
});
