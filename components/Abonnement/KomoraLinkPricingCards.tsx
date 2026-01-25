import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { CheckCircle, Crown } from "lucide-react-native";

export default function KomoraLinkPricingCards() {
  const [billingPeriod, setBillingPeriod] = useState("mensuel"); // 'mensuel' ou 'annuel'

  const plans = {
    essentiel: {
      name: "Boost Essentiel",
      description: "Visibilité accrue à un prix qui ne fait pas PME",
      monthlyPrice: 19,
      features: [
        "5 Produits en tête des recherches (infos & soft)",
        'Florilèges "Entreprise du Mois" (Catégorie uniquement)',
        "Bannière géographique",
      ],
      buttonText: "Choisir Essentiel",
      buttonColor: "#fff",
      textColor: "#00C896",
      borderColor: "#00C896",
    },
    croissance: {
      name: "Boost Croissance",
      description: "Pour marquer votre entreprise et créer du buzz",
      monthlyPrice: 49,
      features: [
        "15 Produits en tête des recherches (infos & soft)",
        "5 services célébées en Page d'Accueil & Configures",
        "Bannière géographique de boost",
      ],
      buttonText: "Choisir Croissance",
      buttonColor: "#00C896",
      textColor: "#fff",
      recommended: true,
    },
    premium: {
      name: "Boost Premium",
      description: "Pour une visibilité maximale et des outils complets",
      monthlyPrice: 99,
      features: [
        "30+ articles en tête des recherches (infos & soft)",
        "Ciblage avancé (Cats + Intérêts + Profil Pré)",
        "Stratégiques publicitaires complexes et exportables",
      ],
      buttonText: "Choisir Premium",
      buttonColor: "#000",
      textColor: "#fff",
      showIcon: true,
    },
  };

  const calculatePrice = (monthlyPrice: any) => {
    if (billingPeriod === "annuel") {
      return Math.round(monthlyPrice * 0.85); // -15% pour annuel
    }
    return monthlyPrice;
  };

  const PricingCard = ({ data }: any) => {
    const price = calculatePrice(data.monthlyPrice);

    return (
      <View style={[styles.card, data.recommended && styles.recommendedCard]}>
        {data.recommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Recommandé</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <Text style={styles.planName}>{data.name}</Text>
          <Text style={styles.planDescription}>{data.description}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{price} €</Text>
          <Text style={styles.period}> / mois</Text>
        </View>

        <View style={styles.featuresList}>
          {data.features.map((feature: any, index: any) => (
            <View key={index} style={styles.featureItem}>
              <CheckCircle size={20} color="#00C896" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.ctaButton,
            { backgroundColor: data.buttonColor },
            data.borderColor && {
              borderWidth: 2,
              borderColor: data.borderColor,
            },
          ]}
        >
          <View style={styles.buttonContent}>
            {data.showIcon && <Crown size={20} color="#fff" />}
            <Text style={[styles.buttonText, { color: data.textColor }]}>
              {data.buttonText}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.paymentInfo}>Paiement : Mensuel / Annuel</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.billingToggle}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            billingPeriod === "mensuel" && styles.toggleBtnActive,
          ]}
          onPress={() => setBillingPeriod("mensuel")}
        >
          <Text
            style={[
              styles.toggleText,
              billingPeriod === "mensuel" && styles.toggleTextActive,
            ]}
          >
            Mensuel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            billingPeriod === "annuel" && styles.toggleBtnActive,
          ]}
          onPress={() => setBillingPeriod("annuel")}
        >
          <Text
            style={[
              styles.toggleText,
              billingPeriod === "annuel" && styles.toggleTextActive,
            ]}
          >
            Annuel (-15%)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsWrapper}>
        <PricingCard data={plans.essentiel} />
        <PricingCard data={plans.croissance} />
        <PricingCard data={plans.premium} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  billingToggle: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    padding: 4,
    margin: 20,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#fff",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  toggleTextActive: {
    color: "#000",
  },
  cardsWrapper: {
    padding: 20,
    paddingTop: 10,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    position: "relative",
  },
  recommendedCard: {
    borderColor: "#00C896",
    borderWidth: 2,
  },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#00C896",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
  },
  period: {
    fontSize: 14,
    color: "#666",
  },
  featuresList: {
    marginBottom: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  paymentInfo: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
