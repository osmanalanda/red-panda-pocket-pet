import React, { useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { usePet } from "@/providers/PetProvider";
import { getTodaysDailyQuests } from "@/constants/gameConfig";

export default function DailyQuests() {
  const { petState, claimDailyQuest } = usePet();
  const todaysQuests = useMemo(() => getTodaysDailyQuests(), []);

  const questData = useMemo(() => {
    return todaysQuests.map((quest) => {
      const progress = petState.dailyQuests.find((q) => q.questId === quest.id);
      return {
        quest,
        current: progress?.progress ?? 0,
        claimed: progress?.claimed ?? false,
        isComplete: (progress?.progress ?? 0) >= quest.target,
      };
    });
  }, [todaysQuests, petState.dailyQuests]);

  const allClaimed = useMemo(
    () => questData.every((q) => q.claimed),
    [questData]
  );

  const handleClaim = useCallback(
    (questId: string) => {
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      claimDailyQuest(questId);
    },
    [claimDailyQuest]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Quests</Text>
        {allClaimed && <Text style={styles.allDone}>All Done! ✅</Text>}
      </View>

      {questData.map(({ quest, current, claimed, isComplete }) => (
        <QuestRow
          key={quest.id}
          emoji={quest.emoji}
          title={quest.title}
          description={quest.description}
          current={current}
          target={quest.target}
          rewardCoins={quest.rewardCoins}
          rewardXp={quest.rewardXp}
          claimed={claimed}
          isComplete={isComplete}
          onClaim={() => handleClaim(quest.id)}
        />
      ))}
    </View>
  );
}

interface QuestRowProps {
  emoji: string;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  claimed: boolean;
  isComplete: boolean;
  onClaim: () => void;
}

const QuestRow = React.memo(function QuestRow({
  emoji,
  title,
  description,
  current,
  target,
  rewardCoins,
  rewardXp,
  claimed,
  isComplete,
  onClaim,
}: QuestRowProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (!isComplete || claimed) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isComplete, claimed, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, [scaleAnim]);

  const progress = Math.min(current / target, 1);

  return (
    <Animated.View style={[styles.questRow, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.questLeft}>
        <Text style={styles.questEmoji}>{emoji}</Text>
        <View style={styles.questInfo}>
          <Text style={[styles.questTitle, claimed && styles.questTitleClaimed]}>{title}</Text>
          <Text style={styles.questDesc}>{description}</Text>
          <View style={styles.questProgressTrack}>
            <View style={[styles.questProgressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.questProgressText}>
            {current}/{target}
          </Text>
        </View>
      </View>

      {claimed ? (
        <View style={styles.claimedBadge}>
          <Text style={styles.claimedText}>Done</Text>
        </View>
      ) : isComplete ? (
        <TouchableOpacity
          style={styles.claimButton}
          onPress={onClaim}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text style={styles.claimButtonText}>Claim</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.rewardPreview}>
          <Text style={styles.rewardPreviewText}>🪙{rewardCoins}</Text>
          <Text style={styles.rewardPreviewText}>⚡{rewardXp}</Text>
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  allDone: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.secondary,
  },
  questRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(200,230,201,0.4)",
  },
  questLeft: {
    flexDirection: "row" as const,
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  questEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  questTitleClaimed: {
    color: Colors.textLight,
    textDecorationLine: "line-through" as const,
  },
  questDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  questProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    overflow: "hidden" as const,
    marginTop: 6,
  },
  questProgressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: Colors.secondary,
  },
  questProgressText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.textLight,
    marginTop: 2,
  },
  claimedBadge: {
    backgroundColor: "rgba(102, 187, 106, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  claimedText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.secondary,
  },
  claimButton: {
    backgroundColor: Colors.accentDark,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: Colors.accentDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: "#FFF",
  },
  rewardPreview: {
    alignItems: "flex-end" as const,
    gap: 2,
  },
  rewardPreviewText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textLight,
  },
});
