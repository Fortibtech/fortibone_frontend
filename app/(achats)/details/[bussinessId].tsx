import BackButtonAdmin from "@/components/Admin/BackButton";
import List from "@/components/Admin/List";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// === Type pour l'icône simulée (fallback web) ===
interface IconProps {
  name: keyof typeof iconMap;
  size?: number;
  color?: string;
  style?: object;
}

const iconMap = {
  "arrow-back": "←",
  "ellipsis-vertical": "⋮",
  "logo-apple": "",
  "shield-checkmark": "✓",
  star: "★",
  "mail-outline": "✉",
  "call-outline": "☎",
  "location-outline": "📍",
  "link-outline": "🔗",
  "logo-facebook": "f",
} as const;

const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = "#000",
  style = {},
}) => {
  return (
    <Text style={[{ fontSize: size, color }, style]}>
      {iconMap[name] || "•"}
    </Text>
  );
};

// === Type pour les détails de l'entreprise ===
interface CompanyDetail {
  label: string;
  value: string;
}

// === Composant principal ===
const StoreProfileScreen: React.FC = () => {
  const companyDetails: CompanyDetail[] = [
    {
      label: "Nom de l'entreprise",
      value: "Wuxi Rongpeng Technology Co., Ltd",
    },
    { label: "Secteur d'activité", value: "Téléphones & Accessoires" },
    { label: "SIRET/NUI", value: "6M5QWYR5D3C5" },
    { label: "Année de création", value: "2025" },
    { label: "Région", value: "Centre" },
    { label: "Ville", value: "Yaoundé" },
    { label: "Adresse principale", value: "Carrefour Bastos" },
    { label: "Code Postal", value: "N/A" },
    { label: "Téléphone Principale", value: "+33 7 53 07 08 73" },
    { label: "Email professionnel", value: "contact@entreprise.com" },
  ];

  const handleEmailPress = () => {
    Linking.openURL("mailto:jeanrblanc@gmail.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+33753070873");
  };

  const handleWebsitePress = () => {
    Linking.openURL("https://wuxi.rongpeng-technology.com");
  };

  const handleFacebookPress = () => {
    Linking.openURL("https://facebook.com");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <List />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Header */}
        <View style={styles.storeHeader}>
          <View style={styles.logoContainer}>
            <Icon name="logo-apple" size={48} />
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>
              Wuxi Rongpeng Technology Co., Ltd
            </Text>
            <View style={styles.badges}>
              <View style={styles.verifiedBadge}>
                <Icon name="shield-checkmark" size={12} color="#4A90E2" />
                <Text style={styles.verifiedText}>Entreprise Vérifié</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color="#FFB800" />
                <Text style={styles.ratingText}>4.5/5</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmailPress}
          >
            <Icon name="mail-outline" size={18} color="#666" />
            <Text style={styles.contactText}>jeanrblanc@gmail.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handlePhonePress}
          >
            <Icon name="call-outline" size={18} color="#666" />
            <Text style={styles.contactText}>+33 7 53 07 08 73</Text>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <Icon name="location-outline" size={18} color="#666" />
            <Text style={styles.contactText}>Yaoundé, Centre, Cameroun</Text>
          </View>
        </View>

        {/* Présentation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Présentation</Text>
          <Text style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nunc
            vulputate libero sit amet interdum ac aliquot odio mattis. Class
            aptent taciti sociosqu ad litora torquent per conubia nostra, per
            inceptos himenaeos.
          </Text>
        </View>

        {/* Site Web */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Site Web</Text>
          <TouchableOpacity
            style={styles.websiteLink}
            onPress={handleWebsitePress}
          >
            <Icon name="link-outline" size={18} color="#4A90E2" />
            <Text style={styles.websiteText}>
              https://wuxi.rongpeng-technology.com
            </Text>
          </TouchableOpacity>
        </View>

        {/* Socials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Socials</Text>
          <TouchableOpacity
            style={styles.socialLink}
            onPress={handleFacebookPress}
          >
            <View style={styles.facebookIcon}>
              <Icon name="logo-facebook" size={16} color="#fff" />
            </View>
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Détails sur l'entreprise */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails sur l&apos;entreprise</Text>
          <View style={styles.detailsContainer}>
            {companyDetails.map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Références */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Références</Text>
          <Text style={styles.description}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit incapidunt
            himenaeos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// === STYLES ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  storeHeader: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  verifiedText: {
    fontSize: 11,
    color: "#4A90E2",
    marginLeft: 4,
    fontWeight: "500",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
    color: "#F5A623",
    marginLeft: 4,
    fontWeight: "600",
  },
  contactSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 12,
  },
  lastSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  websiteLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  websiteText: {
    fontSize: 14,
    color: "#4A90E2",
    marginLeft: 8,
  },
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  facebookIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1877F2",
    justifyContent: "center",
    alignItems: "center",
  },
  socialText: {
    fontSize: 14,
    color: "#000",
    marginLeft: 10,
    fontWeight: "500",
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
});

export default StoreProfileScreen;
