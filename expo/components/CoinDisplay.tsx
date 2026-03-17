import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface CoinDisplayProps {
  coins: number;
  testID?: string;
}

export default React.memo(function CoinDisplay({ coins, testID }: CoinDisplayProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.emoji}>🪙</Text>
      <Text style={styles.amount}>{coins.toLocaleString()}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 213, 79, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  emoji: {
    fontSize: 18,
  },
  amount: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: Colors.coinDark,
  },
});
