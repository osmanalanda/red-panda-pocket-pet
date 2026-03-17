import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { usePet } from "@/providers/PetProvider";
import PetSprite from "@/components/PetSprite";
import StatBar from "@/components/StatBar";
import XPBar from "@/components/XPBar";
import CoinDisplay from "@/components/CoinDisplay";
import ActionButton from "@/components/ActionButton";
import ConfettiEffect from "@/components/ConfettiEffect";
import Toast from "@/components/Toast";
import DailyQuests from "@/components/DailyQuests";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    petState,
    mood,
    xpProgress,
    xpNeeded,
    isReady,
    toastMessage,
    showLevelUp,
    newAchievementName,
    feed,
    play,
    dismissToast,
  } = usePet();

  const feedBounce = useRef(new Animated.Value(1)).current;
  const playBounce = useRef(new Animated.Value(1)).current;

  const handleFeed = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Animated.sequence([
      Animated.timing(feedBounce, { toValue: 1.2, duration: 120, useNativeDriver: true }),
      Animated.spring(feedBounce, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
    feed();
  }, [feed, feedBounce]);

  const handlePlay = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Animated.sequence([
      Animated.timing(playBounce, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(playBounce, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
    play();
  }, [play, playBounce]);

  const handleMiniGame = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/mini-game");
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading your panda...</Text>
      </View>
    );
  }

  const moodLabel = mood === "ecstatic" ? "Ecstatic! 🤩" :
    mood === "happy" ? "Happy 😊" :
    mood === "neutral" ? "Okay 😐" :
    mood === "hungry" ? "Hungry! 😣" :
    mood === "sad" ? "Sad 😢" : "Miserable 😭";

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.backgroundLight, Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFill}
      />

      <ConfettiEffect visible={showLevelUp} />

      <Toast
        message={newAchievementName ? `Achievement Unlocked: ${newAchievementName}` : toastMessage}
        onDismiss={dismissToast}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello, Keeper!</Text>
            <Text style={styles.petName}>{petState.name}</Text>
          </View>
          <CoinDisplay coins={petState.coins} testID="coin-display" />
        </View>

        <View style={styles.petSection}>
          <View style={styles.moodBubble}>
            <Text style={styles.moodText}>{moodLabel}</Text>
          </View>
          <PetSprite mood={mood} level={petState.level} testID="pet-sprite" />
          {showLevelUp && (
            <Animated.View style={styles.levelUpBanner}>
              <Text style={styles.levelUpText}>🎉 Level Up! 🎉</Text>
              <Text style={styles.levelUpSubtext}>Level {petState.level}</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.card}>
          <XPBar
            xp={petState.xp}
            xpNeeded={xpNeeded}
            level={petState.level}
            progress={xpProgress}
            testID="xp-bar"
          />
        </View>

        <View style={styles.card}>
          <StatBar
            label="Hunger"
            value={petState.hunger}
            maxValue={100}
            color={Colors.hunger}
            _colorDark={Colors.hungerDark}
            emoji="🍖"
            testID="hunger-bar"
          />
          <StatBar
            label="Happiness"
            value={petState.happiness}
            maxValue={100}
            color={Colors.happiness}
            _colorDark={Colors.happinessDark}
            emoji="💕"
            testID="happiness-bar"
          />
        </View>

        <View style={styles.actionsRow}>
          <Animated.View style={[styles.actionWrapper, { transform: [{ scale: feedBounce }] }]}>
            <ActionButton
              label="Feed"
              emoji="🍎"
              onPress={handleFeed}
              color={Colors.primary}
              size="large"
              testID="feed-button"
            />
          </Animated.View>
          <Animated.View style={[styles.actionWrapper, { transform: [{ scale: playBounce }] }]}>
            <ActionButton
              label="Play"
              emoji="🎾"
              onPress={handlePlay}
              color={Colors.secondary}
              size="large"
              testID="play-button"
            />
          </Animated.View>
        </View>

        <View style={styles.miniGameRow}>
          <ActionButton
            label="Mini Game"
            emoji="🎯"
            onPress={handleMiniGame}
            color="#5C6BC0"
            size="large"
            testID="mini-game-button"
          />
        </View>

        <DailyQuests />

        <View style={styles.statsGridSpacing} />

        <View style={styles.statsGrid}>
          <View style={styles.statTile}>
            <Text style={styles.statTileValue}>{petState.totalFeeds}</Text>
            <Text style={styles.statTileLabel}>Feeds</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statTileValue}>{petState.totalPlays}</Text>
            <Text style={styles.statTileLabel}>Plays</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statTileValue}>{petState.totalMiniGamesPlayed}</Text>
            <Text style={styles.statTileLabel}>Games</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statTileValue}>{petState.achievements.length}</Text>
            <Text style={styles.statTileLabel}>Badges</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  petName: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  petSection: {
    alignItems: "center",
    marginVertical: 16,
  },
  moodBubble: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  moodText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  levelUpBanner: {
    marginTop: 12,
    alignItems: "center",
    backgroundColor: Colors.accentDark,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: Colors.accentDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  levelUpText: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#FFF",
  },
  levelUpSubtext: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.8)",
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 10,
  },
  actionWrapper: {
    flex: 1,
  },
  miniGameRow: {
    marginBottom: 14,
  },
  statsGridSpacing: {
    height: 14,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statTileValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  statTileLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
