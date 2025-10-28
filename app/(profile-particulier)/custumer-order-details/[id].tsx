import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  Image,

  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ClientProfile() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiche Client</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Jean Dupont</Text>

            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={20} color="#666" />
              <Text style={styles.infoText}>jean.dupont@gmail.com</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#666" />
              <Text style={styles.infoText}>+33 7 53 07 08 73</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.infoText}>
                4 Rue Capdeville, 33000 Bordeaux
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.infoText}>Client depuis: 24/01/2025</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CA Total</Text>
            <Text style={styles.statValue}>2 658 €</Text>
            <Text style={styles.statSubLabel}>Commandes Totales</Text>
            <Text style={styles.statSubValue}>8</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Panier Moyen</Text>
            <Text style={styles.statValue}>332,25 €</Text>
            <Text style={styles.statSubLabel}>Dernière Commande</Text>
            <Text style={styles.statSubValue}>20/10/2025</Text>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersSectionHeader}>
            <Text style={styles.ordersTitle}>Dernières Commandes</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Voir tout</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.ordersCard}>
            {/* Order 1 */}
            <View style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>Sony XP10 128Go 6Go</Text>
                <Text style={styles.orderDetails}>
                  Quantité: 2 - Date: 20/10/2025
                </Text>
              </View>
              <View style={styles.orderRight}>
                <View style={[styles.badge, styles.badgeBlue]}>
                  <Text style={styles.badgeTextBlue}>Expédiée</Text>
                </View>
                <Text style={styles.orderPrice}>1 499 €</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Order 2 */}
            <View style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>iPhone 17 Pro Max 2To 8Gb</Text>
                <Text style={styles.orderDetails}>
                  Quantité: 1 - Date: 15/09/2025
                </Text>
              </View>
              <View style={styles.orderRight}>
                <View style={[styles.badge, styles.badgeGreen]}>
                  <Text style={styles.badgeTextGreen}>Livrée</Text>
                </View>
                <Text style={styles.orderPrice}>3 259 €</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.archiveButton}>
          <Text style={styles.archiveButtonText}>Archiver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Contacter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#fff",
    padding: 24,
    flexDirection: "row",
    gap: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileInfo: {
    flex: 1,
    paddingTop: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#4B5563",
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  statSubLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  statSubValue: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
  },
  ordersSection: {
    padding: 16,
  },
  ordersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 16,
    color: "#6B7280",
  },
  ordersCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  orderInfo: {
    flex: 1,
    paddingRight: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  orderDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  orderRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeBlue: {
    backgroundColor: "#DBEAFE",
  },
  badgeGreen: {
    backgroundColor: "#D1FAE5",
  },
  badgeTextBlue: {
    color: "#1E40AF",
    fontSize: 13,
    fontWeight: "500",
  },
  badgeTextGreen: {
    color: "#065F46",
    fontSize: 13,
    fontWeight: "500",
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  archiveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  archiveButtonText: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "600",
  },
  contactButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
