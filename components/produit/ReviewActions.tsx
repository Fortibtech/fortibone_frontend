// ReviewActions.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  onShowReviews: () => void;
  onAddReview: () => void;
}

export default function ReviewActions({ onShowReviews, onAddReview }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={onShowReviews}>
        <Text style={styles.btnText}>📜 Voir les avis</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.secondary]}
        onPress={onAddReview}
      >
        <Text style={styles.btnText}>⭐ Laisser un avis</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#1e88e5",
  },
  secondary: { backgroundColor: "#43a047" },
  btnText: { color: "#fff", fontWeight: "600" },
});
