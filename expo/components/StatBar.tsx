import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Colors from "@/constants/colors";

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  _colorDark: string;
  emoji: string;
  testID?: string;
}

export default React.memo(function StatBar({
  label,
  value,
  maxValue,
  color,
  _colorDark,
  emoji,
  testID,
}: StatBarProps) {
  const animWidth = useRef(new Animated.Value(value / maxValue)).current;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: value / maxValue,
      useNativeDriver: false,
      tension: 40,
      friction: 12,
    }).start();
  }, [value, maxValue, animWidth]);

  const percentage = Math.round((value / maxValue) * 100);
  const isLow = percentage < 20;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.labelRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, isLow && styles.valueDanger]}>
          {percentage}%
        </Text>
      </View>
      <View style={styles.trackOuter}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: isLow ? Colors.danger : color,
                width: animWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          >
            <View style={[styles.fillShine, { backgroundColor: isLow ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.35)" }]} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  valueDanger: {
    color: Colors.danger,
  },
  trackOuter: {
    borderRadius: 10,
    padding: 2,
    backgroundColor: Colors.shadowLight,
  },
  track: {
    height: 14,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 8,
    justifyContent: "center",
  },
  fillShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
