import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePet } from "@/providers/PetProvider";
import PetSprite from "@/components/PetSprite";
import StatBar from "@/components/StatBar";
import RoomInteractions from "@/components/RoomInteractions";
import Toast from "@/components/Toast";

export default function KikisRoomScreen() {
  const insets = useSafeAreaInsets();
  const {
    petState,
    mood,
    isLaughing,
    toastMessage,
    dismissToast,
    wash,
    tickle,
    petKiki,
  } = usePet();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#FFF8E1", "#FFECB3", "#FFE0B2"]}
        style={StyleSheet.absoluteFill}
      />

      <Toast message={toastMessage} onDismiss={dismissToast} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Kiki's Room</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.roomScene}>
          <View style={styles.wallDecor}>
            <Text style={styles.decorEmoji}>🖼️</Text>
            <Text style={styles.decorEmoji}>🪴</Text>
          </View>

          <View style={styles.petArea}>
            <PetSprite
              mood={mood}
              level={petState.level}
              activeAccessories={petState.activeAccessories}
              showHearts={isLaughing}
            />
          </View>

          <View style={styles.floorDecor}>
            <View style={styles.rug} />
          </View>
        </View>

        <View style={styles.statsCard}>
          <StatBar
            label="Cleanliness"
            value={petState.cleanliness}
            maxValue={100}
            color={Colors.cleanliness}
            _colorDark={Colors.cleanlinessDark}
            emoji="🛁"
            testID="cleanliness-bar"
          />
          <StatBar
            label="Happiness"
            value={petState.happiness}
            maxValue={100}
            color={Colors.happiness}
            _colorDark={Colors.happinessDark}
            emoji="💕"
            testID="room-happiness-bar"
          />
        </View>

        <RoomInteractions
          onWash={wash}
          onTickle={tickle}
          onPet={petKiki}
        />

        <View style={styles.roomStats}>
          <View style={styles.roomStatTile}>
            <Text style={styles.roomStatValue}>{petState.totalWashes}</Text>
            <Text style={styles.roomStatLabel}>Baths</Text>
          </View>
          <View style={styles.roomStatTile}>
            <Text style={styles.roomStatValue}>{petState.totalPets}</Text>
            <Text style={styles.roomStatLabel}>Pets</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  roomScene: {
    alignItems: "center",
    paddingVertical: 8,
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
  },
  wallDecor: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 24,
    marginBottom: -8,
  },
  decorEmoji: {
    fontSize: 28,
  },
  petArea: {
    alignItems: "center",
    paddingVertical: 10,
  },
  floorDecor: {
    width: "100%",
    alignItems: "center",
    marginTop: -10,
  },
  rug: {
    width: 200,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(141, 110, 99, 0.15)",
  },
  statsCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  roomStats: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  roomStatTile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  roomStatValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  roomStatLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
