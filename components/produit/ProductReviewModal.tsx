import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { getAllReviews, ProductReview } from "@/api/Reviews";

interface Props {
  productId: string;
  visible: boolean;
  onClose: () => void;
}

export default function ProductReviewsListModal({
  productId,
  visible,
  onClose,
}: Props) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadReviews = async (pageToLoad = 1) => {
    try {
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await getAllReviews(productId, pageToLoad, 20);
      setReviews((prev) =>
        pageToLoad === 1 ? res.data : [...prev, ...res.data]
      );
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    loadReviews(1);
  }, [visible, productId]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Text
        key={i}
        style={{ color: i < rating ? "#FFD700" : "#ccc", fontSize: 16 }}
      >
        ★
      </Text>
    ));

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadReviews(page + 1);
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
          <Text style={styles.title}>Avis du produit</Text>

          {loading && page === 1 ? (
            <ActivityIndicator
              size="large"
              color="#000"
              style={{ marginTop: 20 }}
            />
          ) : reviews.length === 0 ? (
            <Text style={{ marginTop: 20, textAlign: "center", color: "#555" }}>
              Aucun avis pour ce produit.
            </Text>
          ) : (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5} // déclenche avant la fin de la liste
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator style={{ margin: 10 }} />
                ) : null
              }
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                  <Text style={styles.author}>
                    {item.author.firstName} {item.author.lastName}
                  </Text>
                  <View style={{ flexDirection: "row", marginBottom: 4 }}>
                    {renderStars(item.rating)}
                  </View>
                  <Text style={styles.comment}>{item.comment}</Text>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            />
          )}

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Fermer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  reviewItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  author: { fontWeight: "600", fontSize: 14, marginBottom: 2 },
  comment: { fontSize: 14, color: "#555", marginBottom: 2 },
  date: { fontSize: 12, color: "#aaa" },
  closeBtn: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  closeText: { fontWeight: "600", color: "#333" },
});
