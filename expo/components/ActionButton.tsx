import React, { useRef, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface ActionButtonProps {
  label: string;
  emoji: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  size?: "normal" | "large";
  testID?: string;
}

export default React.memo(function ActionButton({
  label,
  emoji,
  onPress,
  color = Colors.primary,
  disabled = false,
  size = "normal",
  testID,
}: ActionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [onPress]);

  const isLarge = size === "large";

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        testID={testID}
        style={[
          styles.button,
          isLarge && styles.buttonLarge,
          { backgroundColor: color },
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.emoji, isLarge && styles.emojiLarge]}>{emoji}</Text>
        <Text style={[styles.label, isLarge && styles.labelLarge]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonLarge: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 20,
  },
  emojiLarge: {
    fontSize: 26,
  },
  label: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.textOnPrimary,
  },
  labelLarge: {
    fontSize: 18,
  },
});
