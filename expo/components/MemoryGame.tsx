import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 20;
const CARD_GAP = 8;
const CARDS_PER_ROW = 4;
const CARD_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) / CARDS_PER_ROW;

const PANDA_EMOJIS = ["🐼", "🎋", "🍎", "🌸", "🧸", "⭐", "🍰", "🎀"];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onGameEnd: (pairs: number, timeSeconds: number) => void;
  onCancel: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(): Card[] {
  const pairs = PANDA_EMOJIS.map((emoji, index) => [
    { id: index * 2, emoji, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false },
  ]).flat();
  return shuffleArray(pairs);
}

export default function MemoryGame({ onGameEnd, onCancel }: MemoryGameProps) {
  const initialCardsRef = useRef<Card[]>(createCards());
  const [cards, setCards] = useState<Card[]>(initialCardsRef.current);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<"preview" | "playing" | "ended">("preview");
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchScaleAnim = useRef(new Animated.Value(1)).current;
  const flipAnims = useRef<Record<number, Animated.Value>>({});

  const onGameEndRef = useRef(onGameEnd);
  onGameEndRef.current = onGameEnd;

  const getFlipAnim = useCallback((cardId: number): Animated.Value => {
    if (!flipAnims.current[cardId]) {
      flipAnims.current[cardId] = new Animated.Value(0);
    }
    return flipAnims.current[cardId];
  }, []);

  useEffect(() => {
    const initialCards = initialCardsRef.current;
    const previewCards = initialCards.map((c) => ({ ...c, isFlipped: true }));
    setCards(previewCards);
    initialCards.forEach((card) => {
      Animated.timing(getFlipAnim(card.id), {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const previewTimeout = setTimeout(() => {
      setCards((prev) => prev.map((c) => ({ ...c, isFlipped: false })));
      initialCards.forEach((card) => {
        Animated.timing(getFlipAnim(card.id), {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
      setGamePhase("playing");
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }, 2000);

    return () => {
      clearTimeout(previewTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [getFlipAnim]);

  const handleCardPress = useCallback((cardId: number) => {
    if (isProcessing || gamePhase !== "playing") return;

    setCards((prev) => {
      const card = prev.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return prev;

      const newCards = prev.map((c) =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );

      Animated.timing(getFlipAnim(cardId), {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const currentFlipped = [...flippedIds, cardId];
      setFlippedIds(currentFlipped);

      if (currentFlipped.length === 2) {
        setMoves((m) => m + 1);
        setIsProcessing(true);

        const [firstId, secondId] = currentFlipped;
        const firstCard = newCards.find((c) => c.id === firstId);
        const secondCard = newCards.find((c) => c.id === secondId);

        if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
          setTimeout(() => {
            setCards((p) =>
              p.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              )
            );

            Animated.sequence([
              Animated.timing(matchScaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
              Animated.spring(matchScaleAnim, { toValue: 1, useNativeDriver: true }),
            ]).start();

            setMatchedPairs((prev) => {
              const newPairs = prev + 1;
              if (newPairs >= 8) {
                if (timerRef.current) clearInterval(timerRef.current);
                setGamePhase("ended");
                setTimeout(() => {
                  onGameEndRef.current(newPairs, timeElapsed);
                }, 800);
              }
              return newPairs;
            });

            setFlippedIds([]);
            setIsProcessing(false);
          }, 400);
        } else {
          setTimeout(() => {
            setCards((p) =>
              p.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            Animated.timing(getFlipAnim(firstId), {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
            Animated.timing(getFlipAnim(secondId), {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
            setFlippedIds([]);
            setIsProcessing(false);
          }, 800);
        }
      }

      return newCards;
    });
  }, [flippedIds, isProcessing, gamePhase, getFlipAnim, matchScaleAnim, timeElapsed]);

  const formatTime = useMemo(() => {
    const mins = Math.floor(timeElapsed / 60);
    const secs = timeElapsed % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [timeElapsed]);

  if (gamePhase === "preview") {
    return (
      <View style={styles.container}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Memorize the cards!</Text>
          <Text style={styles.previewHint}>Match all pairs as fast as you can</Text>
        </View>
        <View style={styles.grid}>
          {cards.map((card) => (
            <Animated.View
              key={card.id}
              style={[
                styles.card,
                styles.cardFront,
                {
                  transform: [{
                    rotateY: getFlipAnim(card.id).interpolate({
                      inputRange: [0, 1],
                      outputRange: ["180deg", "360deg"],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statChip}>
          <Text style={styles.statEmoji}>⏱️</Text>
          <Text style={styles.statValue}>{formatTime}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statEmoji}>🔄</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={styles.statValue}>{matchedPairs}/8</Text>
        </View>
      </View>

      <Animated.View style={[styles.grid, { transform: [{ scale: matchScaleAnim }] }]}>
        {cards.map((card) => {
          const flipAnim = getFlipAnim(card.id);
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardPress(card.id)}
              disabled={card.isFlipped || card.isMatched || isProcessing}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.card,
                  card.isMatched && styles.cardMatched,
                  !isRevealed && styles.cardBack,
                  isRevealed && styles.cardFront,
                  {
                    opacity: card.isMatched ? 0.7 : 1,
                    transform: [{
                      rotateY: flipAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    }],
                  },
                ]}
              >
                {isRevealed ? (
                  <Text style={styles.cardEmoji}>{card.emoji}</Text>
                ) : (
                  <Text style={styles.cardBackEmoji}>🐾</Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {gamePhase === "ended" && (
        <View style={styles.completeBanner}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeText}>All Matched!</Text>
        </View>
      )}

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  previewHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statEmoji: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.15,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardBack: {
    backgroundColor: Colors.primary,
  },
  cardFront: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: "rgba(200,230,201,0.5)",
  },
  cardMatched: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardBackEmoji: {
    fontSize: 24,
    opacity: 0.8,
  },
  completeBanner: {
    alignItems: "center",
    marginTop: 20,
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  completeEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  completeText: {
    fontSize: 22,
    fontWeight: "900" as const,
    color: Colors.secondary,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
});
