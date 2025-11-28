import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
type StoreCardProps = {
  storeName?: string;
  companyInfo?: string;
  rating?: string;
  onPress?: () => void;
};
const StoreCard = ({
  storeName = "Wuxi Rongpeng Technology Co., Ltd",
  companyInfo = "17 Entreprise vérifié",
  rating = "4.5/5",
  onPress,
}: StoreCardProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Logo Apple */}
        <View style={styles.logoContainer}>
          <Ionicons name="logo-apple" size={32} color="#000" />
        </View>

        {/* Store Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.storeName} numberOfLines={2}>
            {storeName}
          </Text>

          <View style={styles.metaContainer}>
            {/* Verification Badge */}
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={12} color="#4A90E2" />
              <Text style={styles.badgeText}>{companyInfo}</Text>
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
        </View>

        {/* Arrow Icon */}
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  storeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    color: "#4A90E2",
    marginLeft: 4,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
    color: "#F5A623",
    marginLeft: 3,
    fontWeight: "600",
  },
});

// Exemple d'utilisation
export default function Business() {
  return (
    <View style={{ justifyContent: "center" }}>
      <StoreCard
        storeName="Wuxi Rongpeng Technology Co., Ltd"
        companyInfo="17 Entreprise vérifié"
        rating="4.5/5"
        onPress={() =>
          router.push({
            pathname: "/(achats)/details/[bussinessId]",
            params: { bussinessId: "1" },
          })
        }
      />
    </View>
  );
}
