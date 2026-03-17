import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { ACHIEVEMENTS } from "@/constants/gameConfig";
import { usePet } from "@/providers/PetProvider";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { petState } = usePet();

  const unlockedCount = useMemo(
    () => petState.achievements.length,
    [petState.achievements]
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.backgroundLight, Colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>
          {unlockedCount} / {ACHIEVEMENTS.length} unlocked
        </Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = petState.achievements.includes(achievement.id);
            return (
              <View
                key={achievement.id}
                style={[
                  styles.badgeCard,
                  unlocked && styles.badgeCardUnlocked,
                ]}
              >
                <View
                  style={[
                    styles.emojiCircle,
                    unlocked && styles.emojiCircleUnlocked,
                  ]}
                >
                  <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>
                    {unlocked ? achievement.emoji : "🔒"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.badgeName,
                    !unlocked && styles.badgeNameLocked,
                  ]}
                  numberOfLines={1}
                >
                  {achievement.name}
                </Text>
                <Text
                  style={[
                    styles.badgeDesc,
                    !unlocked && styles.badgeDescLocked,
                  ]}
                  numberOfLines={2}
                >
                  {achievement.description}
                </Text>
                {unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedText}>Unlocked</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.accentDark,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.accentDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeCard: {
    width: "47%",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    opacity: 0.55,
  },
  badgeCardUnlocked: {
    opacity: 1,
    borderWidth: 2,
    borderColor: Colors.accentDark,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  emojiCircleUnlocked: {
    backgroundColor: "rgba(255, 193, 7, 0.15)",
  },
  emoji: {
    fontSize: 26,
  },
  emojiLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: Colors.textLight,
  },
  badgeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  badgeDescLocked: {
    color: Colors.textLight,
  },
  unlockedBadge: {
    marginTop: 8,
    backgroundColor: Colors.accentDark,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  unlockedText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
