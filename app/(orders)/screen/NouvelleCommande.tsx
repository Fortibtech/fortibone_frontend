import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NouvelleCommande() {
  const router = useRouter();
  const [client, setClient] = useState("");
  const [articles, setArticles] = useState([
    { id: 1, article: "", quantity: 10 },
  ]);

  const addArticle = () => {
    setArticles([
      ...articles,
      {
        id: articles.length + 1,
        article: "",
        quantity: 10,
      },
    ]);
  };

  const removeArticle = (id: number) => {
    setArticles(articles.filter((article) => article.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setArticles(
      articles.map((article) =>
        article.id === id
          ? { ...article, quantity: Math.max(1, article.quantity + delta) }
          : article
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Commande</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Client Section */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Client <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>Sélectionner un client</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.panierLabel}>Panier</Text>

        {/* Articles */}
        {articles.map((item, index) => (
          <View key={item.id} style={styles.articleCard}>
            <View style={styles.articleHeader}>
              <Text style={styles.articleTitle}># Article {index + 1}</Text>
              {articles.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeArticle(item.id)}
                >
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.articleContent}>
              <Text style={styles.label}>
                Article <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>Sélectionner un article</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.label}>
                Quantité <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addArticleButton} onPress={addArticle}>
          <Text style={styles.addArticleIcon}>⊞</Text>
          <Text style={styles.addArticleText}>Ajouter un Article</Text>
        </TouchableOpacity>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Coût Total:</Text>
          <Text style={styles.totalValue}>0 KMF</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Enregistrer la Commande</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  required: {
    color: "#ff4444",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownText: {
    fontSize: 15,
    color: "#999",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#999",
  },
  panierLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  articleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  articleTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  removeButton: {
    width: 24,
    height: 24,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeIcon: {
    fontSize: 16,
    color: "#666",
  },
  articleContent: {
    gap: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: "#e8f5f1",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 24,
    color: "#00b386",
    fontWeight: "300",
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  addArticleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
  },
  addArticleIcon: {
    fontSize: 20,
    color: "#666",
  },
  addArticleText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#00b386",
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#00b386",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#00b386",
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#00b386",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
