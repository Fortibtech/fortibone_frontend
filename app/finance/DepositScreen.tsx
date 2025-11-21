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
import { Feather } from "@expo/vector-icons";

// Types
interface PaymentMethod {
  id: string;
  type: "mastercard" | "visa";
  cardNumber: string;
  cardHolder: string;
}

interface AmountOption {
  value: number;
  label: string;
}

const DepositScreen: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500000);


  const paymentMethods: PaymentMethod[] = [
    {
      id: "1",
      type: "mastercard",
      cardNumber: "**** **** 2145 5489",
      cardHolder: "Mohammed Fouad",
    },
  ];

  const amountOptions: AmountOption[] = [
    { value: 100000, label: "100 000" },
    { value: 200000, label: "200 000" },
    { value: 500000, label: "500 000" },
    { value: 1000000, label: "1 000 000" },
  ];

  const formatAmount = (amount: number): string => {
    return amount
      .toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(/\s/g, " ");
  };

  const handleConfirm = (): void => {
    console.log("Confirming deposit of", selectedAmount);
    // Logique de confirmation ici
  };

  const handleCancel = (): void => {
    console.log("Cancelling deposit");
    // Logique d'annulation ici
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dépôt d&apos;Argent</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Feather name="more-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={styles.progressSegment} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Méthode</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.paymentMethodContainer}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodLeft}>
                {/* Mastercard Logo */}
                <View style={styles.cardLogoContainer}>
                  <View style={[styles.cardCircle, styles.cardCircleRed]} />
                  <View style={[styles.cardCircle, styles.cardCircleOrange]} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardNumber}>
                    {paymentMethods[0].cardNumber}
                  </Text>
                  <Text style={styles.cardHolder}>
                    {paymentMethods[0].cardHolder}
                  </Text>
                </View>
              </View>

              <Feather name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Montant</Text>
          <View style={styles.card}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountValue}>
                {formatAmount(selectedAmount)}
              </Text>
              <Text style={styles.currency}>XAF</Text>
            </View>

            {/* Amount Options */}
            <View style={styles.amountOptions}>
              {amountOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.amountOption,
                    selectedAmount === option.value &&
                      styles.amountOptionActive,
                  ]}
                  onPress={() => setSelectedAmount(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.amountOptionText,
                      selectedAmount === option.value &&
                        styles.amountOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Confirmer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  menuButton: {
    padding: 4,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    flexDirection: "row",
    gap: 4,
    height: 3,
  },
  progressSegment: {
    flex: 1,
    height: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: "#00BFA5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    padding: 16,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  cardLogoContainer: {
    flexDirection: "row",
    width: 40,
    height: 24,
    position: "relative",
  },
  cardCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
    top: 2,
  },
  cardCircleRed: {
    backgroundColor: "#EB001B",
    left: 0,
  },
  cardCircleOrange: {
    backgroundColor: "#FF5F00",
    left: 12,
    opacity: 0.9,
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  cardHolder: {
    fontSize: 13,
    color: "#666",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  amountOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  amountOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  amountOptionActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#00BFA5",
    borderWidth: 2,
  },
  amountOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  amountOptionTextActive: {
    color: "#00BFA5",
    fontWeight: "600",
  },
  bottomContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00BFA5",
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#00BFA5",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default DepositScreen;
