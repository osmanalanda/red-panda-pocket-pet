import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Colors from "@/constants/colors";

interface XPBarProps {
  xp: number;
  xpNeeded: number;
  level: number;
  progress: number;
  testID?: string;
}

export default React.memo(function XPBar({ xp, xpNeeded, level, progress, testID }: XPBarProps) {
  const animWidth = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: progress,
      useNativeDriver: false,
      tension: 40,
      friction: 12,
    }).start();
  }, [progress, animWidth]);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelLabel}>LV</Text>
          <Text style={styles.levelNum}>{level}</Text>
        </View>
        <Text style={styles.xpText}>
          {xp} / {xpNeeded} XP
        </Text>
      </View>
      <View style={styles.trackOuter}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: animWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          >
            <View style={styles.fillShine} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 10,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.xp,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.7)",
  },
  levelNum: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: "#FFF",
  },
  xpText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  trackOuter: {
    borderRadius: 8,
    padding: 2,
    backgroundColor: "rgba(126, 87, 194, 0.1)",
  },
  track: {
    height: 10,
    borderRadius: 6,
    backgroundColor: "#E8E0F0",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: Colors.xp,
  },
  fillShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
});
