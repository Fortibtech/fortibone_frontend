import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import { createReview } from "@/api/Reviews";

interface Props {
  productId: string;
  visible: boolean;
  onClose: () => void;
}

export default function AddProductReviewModal({
  productId,
  visible,
  onClose,
}: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || comment.trim() === "") return;

    setLoading(true);
    try {
      await createReview(productId, { rating, comment: comment.trim() });
      Toast.show({
        type: "success",
        text1: "✅ Votre avis a été ajouté !",
      });
      setRating(0);
      setComment("");
      onClose();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l’envoi de votre avis",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Laisser un avis</Text>
          <Text style={styles.description}>
            Notez le produit avec des étoiles et laissez un commentaire.
          </Text>

          {/* Sélection de la note */}
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
                <Text
                  style={[styles.star, i < rating ? styles.filledStar : {}]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Champ commentaire */}
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Écrivez votre commentaire ici..."
            value={comment}
            onChangeText={setComment}
            editable={!loading}
          />

          {/* Boutons */}
          <View style={styles.btnRow}>
            <Pressable
              style={[styles.btn, styles.cancel]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.btnText}>Annuler</Text>
            </Pressable>
            <Pressable
              style={[
                styles.btn,
                rating === 0 || comment.trim() === "" || loading
                  ? styles.disabled
                  : {},
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || comment.trim() === "" || loading}
            >
              <Text style={styles.btnText}>
                {loading ? "Envoi..." : "Envoyer"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modal: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#222" },
  description: { fontSize: 14, color: "#555", marginTop: 6, marginBottom: 12 },
  starsRow: { flexDirection: "row", marginBottom: 12 },
  star: { fontSize: 30, color: "#ccc", marginHorizontal: 4 },
  filledStar: { color: "#FFD700" },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  btnRow: { flexDirection: "row", justifyContent: "space-between" },
  btn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1e88e5",
  },
  cancel: { backgroundColor: "#ccc" },
  disabled: { backgroundColor: "#aaa" },
  btnText: { color: "#fff", fontWeight: "600" },
});
