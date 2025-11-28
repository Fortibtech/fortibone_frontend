import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

// Types
interface StockCardProps {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  onPress?: () => void;
}

// Composant réutilisable pour les cartes de stock
export const StockCard: React.FC<StockCardProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  value,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Feather name={icon} size={24} color={iconColor} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});
