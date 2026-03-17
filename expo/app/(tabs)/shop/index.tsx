import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { SHOP_ITEMS } from "@/constants/gameConfig";
import { usePet } from "@/providers/PetProvider";
import { ShopItem } from "@/types/pet";
import CoinDisplay from "@/components/CoinDisplay";
import Toast from "@/components/Toast";

type Tab = "shop" | "inventory";
type Category = "all" | "food" | "toy" | "accessory";

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { petState, buyItem, useItem, toastMessage, dismissToast } = usePet();
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const [category, setCategory] = useState<Category>("all");

  const filteredItems = useMemo(() => {
    if (category === "all") return SHOP_ITEMS;
    return SHOP_ITEMS.filter((item) => item.category === category);
  }, [category]);

  const inventoryItems = useMemo(() => {
    return petState.inventory
      .map((inv) => {
        const item = SHOP_ITEMS.find((s) => s.id === inv.id);
        return item ? { ...item, owned: inv.quantity } : null;
      })
      .filter((item): item is ShopItem & { owned: number } => item !== null);
  }, [petState.inventory]);

  const handleBuy = useCallback(
    (item: ShopItem) => {
      if (Platform.OS !== "web") {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      buyItem(item);
    },
    [buyItem]
  );

  const handleUse = useCallback(
    (item: ShopItem) => {
      if (Platform.OS !== "web") {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      useItem(item);
    },
    [useItem]
  );

  const getInventoryCount = useCallback(
    (itemId: string) => {
      const inv = petState.inventory.find((i) => i.id === itemId);
      return inv?.quantity ?? 0;
    },
    [petState.inventory]
  );

  const categories: { key: Category; label: string; emoji: string }[] = [
    { key: "all", label: "All", emoji: "🏪" },
    { key: "food", label: "Food", emoji: "🍽️" },
    { key: "toy", label: "Toys", emoji: "🎮" },
    { key: "accessory", label: "Style", emoji: "🎀" },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.backgroundLight, Colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <Toast message={toastMessage} onDismiss={dismissToast} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>Shop</Text>
          <Text style={styles.subtitle}>Treat your panda!</Text>
        </View>
        <CoinDisplay coins={petState.coins} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "shop" && styles.tabActive]}
          onPress={() => setActiveTab("shop")}
        >
          <Text style={[styles.tabText, activeTab === "shop" && styles.tabTextActive]}>
            🛍️ Shop
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "inventory" && styles.tabActive]}
          onPress={() => setActiveTab("inventory")}
        >
          <Text style={[styles.tabText, activeTab === "inventory" && styles.tabTextActive]}>
            🎒 Inventory ({petState.inventory.reduce((sum, i) => sum + i.quantity, 0)})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "shop" && (
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                category === cat.key && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  category === cat.key && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "shop" ? (
          filteredItems.map((item) => {
            const owned = getInventoryCount(item.id);
            const canAfford = petState.coins >= item.price;

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                  {owned > 0 && (
                    <View style={styles.ownedBadge}>
                      <Text style={styles.ownedText}>x{owned}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.itemStats}>
                  {item.hungerRestore > 0 && (
                    <View style={styles.itemStat}>
                      <Text style={styles.itemStatEmoji}>🍖</Text>
                      <Text style={styles.itemStatValue}>+{item.hungerRestore}</Text>
                    </View>
                  )}
                  {item.happinessRestore > 0 && (
                    <View style={styles.itemStat}>
                      <Text style={styles.itemStatEmoji}>💕</Text>
                      <Text style={styles.itemStatValue}>+{item.happinessRestore}</Text>
                    </View>
                  )}
                  {item.xpBonus > 0 && (
                    <View style={styles.itemStat}>
                      <Text style={styles.itemStatEmoji}>⚡</Text>
                      <Text style={styles.itemStatValue}>+{item.xpBonus} XP</Text>
                    </View>
                  )}
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      !canAfford && styles.buyButtonDisabled,
                    ]}
                    onPress={() => handleBuy(item)}
                    disabled={!canAfford}
                  >
                    <Text style={styles.buyButtonEmoji}>🪙</Text>
                    <Text
                      style={[
                        styles.buyButtonText,
                        !canAfford && styles.buyButtonTextDisabled,
                      ]}
                    >
                      {item.price}
                    </Text>
                  </TouchableOpacity>

                  {owned > 0 && (
                    <TouchableOpacity
                      style={styles.useButton}
                      onPress={() => handleUse(item)}
                    >
                      <Text style={styles.useButtonText}>Use</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : inventoryItems.length === 0 ? (
          <View style={styles.emptyInventory}>
            <Text style={styles.emptyEmoji}>🎒</Text>
            <Text style={styles.emptyTitle}>Inventory Empty</Text>
            <Text style={styles.emptyDesc}>
              Buy items from the shop to fill your inventory!
            </Text>
          </View>
        ) : (
          inventoryItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedText}>x{item.owned}</Text>
                </View>
              </View>

              <View style={styles.itemStats}>
                {item.hungerRestore > 0 && (
                  <View style={styles.itemStat}>
                    <Text style={styles.itemStatEmoji}>🍖</Text>
                    <Text style={styles.itemStatValue}>+{item.hungerRestore}</Text>
                  </View>
                )}
                {item.happinessRestore > 0 && (
                  <View style={styles.itemStat}>
                    <Text style={styles.itemStatEmoji}>💕</Text>
                    <Text style={styles.itemStatValue}>+{item.happinessRestore}</Text>
                  </View>
                )}
                {item.xpBonus > 0 && (
                  <View style={styles.itemStat}>
                    <Text style={styles.itemStatEmoji}>⚡</Text>
                    <Text style={styles.itemStatValue}>+{item.xpBonus} XP</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.useButtonFull}
                onPress={() => handleUse(item)}
              >
                <Text style={styles.useButtonText}>Use Item</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tabActive: {
    backgroundColor: Colors.text,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFF",
  },
  categoryRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  categoryLabelActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  itemEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  itemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ownedBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ownedText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  itemStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  itemStat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  itemStatEmoji: {
    fontSize: 12,
  },
  itemStatValue: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  itemActions: {
    flexDirection: "row",
    gap: 10,
  },
  buyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buyButtonDisabled: {
    backgroundColor: "#E0E0E0",
    shadowOpacity: 0,
  },
  buyButtonEmoji: {
    fontSize: 16,
  },
  buyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  buyButtonTextDisabled: {
    color: "#9E9E9E",
  },
  useButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  useButtonFull: {
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  useButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  emptyInventory: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
