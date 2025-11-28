import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RetraitArgent = () => {
  const [montant, setMontant] = useState(500000);
  const soldeActuel = 99000000.0;
  const presetAmounts = [100000, 200000, 500000, 1000000];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retrait d&apos;Argent</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Solde Card */}
        <View style={styles.soldeCard}>
          <View style={styles.soldeHeader}>
            <Ionicons name="wallet-outline" size={20} color="#6B7280" />
            <Text style={styles.soldeLabel}>Solde Actuel</Text>
          </View>

          <View style={styles.soldeAmountContainer}>
            <Text style={styles.soldeAmount}>
              {soldeActuel.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.currency}> KMF</Text>
            <TouchableOpacity style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.depotButton}>
            <Ionicons name="arrow-down" size={16} color="#10B981" />
            <Text style={styles.depotText}>Faire un Dépôt</Text>
          </TouchableOpacity>
        </View>

        {/* Méthode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Méthode</Text>
          <View style={styles.methodeCard}>
            <View style={styles.methodeIcon}>
              <Text style={styles.methodeIconText}>📱</Text>
            </View>
            <View style={styles.methodeInfo}>
              <Text style={styles.methodeNumber}>6 ** ** 27 22</Text>
              <Text style={styles.methodeName}>Njih Kemi Steve</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </View>
        </View>

        {/* Montant Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant</Text>
          <Text style={styles.montantDisplay}>
            {montant.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <Text style={styles.montantCurrency}> KMF</Text>
          </Text>

          {/* Preset Amounts */}
          <View style={styles.presetsContainer}>
            {presetAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.presetButton,
                  montant === amount && styles.presetButtonActive,
                ]}
                onPress={() => setMontant(amount)}
              >
                <Text
                  style={[
                    styles.presetText,
                    montant === amount && styles.presetTextActive,
                  ]}
                >
                  {amount.toLocaleString("fr-FR")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmText}>Confirmer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  menuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  soldeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#06B6D4",
  },
  soldeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  soldeLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  soldeAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  soldeAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#10B981",
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
  },
  depotButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  depotText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  methodeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  methodeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  methodeIconText: {
    fontSize: 20,
  },
  methodeInfo: {
    flex: 1,
  },
  methodeNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  methodeName: {
    fontSize: 14,
    color: "#6B7280",
  },
  montantDisplay: {
    fontSize: 40,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  montantCurrency: {
    fontSize: 20,
    color: "#6B7280",
  },
  presetsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  presetButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  presetText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  presetTextActive: {
    color: "#FFFFFF",
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default RetraitArgent;
