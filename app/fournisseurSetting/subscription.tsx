"use client";

import type React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import KomoraLinkAds from "@/components/Abonnement/KomoraLinkAds";
import KomoraLinkPricingCards from "@/components/Abonnement/KomoraLinkPricingCards";
import BoostFlexibleCPC from "@/components/Abonnement/BoostFlexibleCPC";

const Subscription: React.FC = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abonnement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Card */}
        <KomoraLinkAds />
        <KomoraLinkPricingCards />
        <BoostFlexibleCPC />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    height: 100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  premiumCard: {
    backgroundColor: "#1BB874",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
    marginBottom: 18,
    opacity: 0.98,
  },
  featuresList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1BB874",
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
    fontWeight: "500",
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginVertical: 8,
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  planCardSelected: {
    borderColor: "#1BB874",
    backgroundColor: "#F0FFF9",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  planRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1BB874",
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendedBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#000000",
  },
  discount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999999",
  },
  planPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1BB874",
  },
  trialNote: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginVertical: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  trialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1BB874",
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
  },
  trialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default Subscription;
