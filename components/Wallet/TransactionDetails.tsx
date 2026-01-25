import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface TransactionDetailsProps {
  type: "retrait" | "depot" | "paiement" | "achat";
  transactionId: string;
  transactionType: string;
  status: string;
  from: string;
  to: string;
  paymentMethod: string;
  date: string;
  time: string;
  amount: number;
  fees: number;
  totalAmount: number;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  type,
  transactionId,
  transactionType,
  status,
  from,
  to,
  paymentMethod,
  date,
  time,
  amount,
  fees,
  totalAmount,
}) => {
  const getTitle = () => {
    switch (type) {
      case "retrait":
        return "Retrait Réussi";
      case "depot":
        return "Dépôt réussi";
      case "paiement":
        return "Paiement Réussi";
      case "achat":
        return "Achat Client Effectué";
      default:
        return "Transaction Réussie";
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case "retrait":
        return `Vous avez retiré ${amount.toLocaleString(
          "fr-FR"
        )} KMF de votre compte.`;
      case "depot":
        return `${amount.toLocaleString(
          "fr-FR"
        )} KMF déposés sur votre compte.`;
      case "paiement":
        return `Vous avez transféré ${amount.toLocaleString(
          "fr-FR"
        )} KMF à ${to}.`;
      case "achat":
        return `${to} vous a transféré ${amount.toLocaleString("fr-FR")} KMF`;
      default:
        return "Transaction effectuée avec succès";
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transaction ${transactionType}\nMontant: ${amount.toLocaleString(
          "fr-FR"
        )} KMF\nID: ${transactionId}\nDate: ${date} à ${time}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = () => {
    // Logique pour télécharger le reçu
    console.log("Téléchargement du reçu...");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la transaction</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>
        </View>

        {/* Title and Subtitle */}
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <DetailRow label="ID de la Transaction" value={transactionId} />
          <DetailRow label="Type de Transaction" value={transactionType} />
          <DetailRow label="Statut" value={status} valueColor="#10B981" />
          <DetailRow label="De" value={from} />
          <DetailRow label="À" value={to} />
          <DetailRow label="Méthode de paiement" value={paymentMethod} />
          <DetailRow label="Date" value={date} />
          <DetailRow label="Heure" value={time} />
          <DetailRow
            label="Montant"
            value={`${amount.toLocaleString("fr-FR")} KMF`}
            valueWeight="600"
          />
          <DetailRow
            label="Frais"
            value={`${fees.toLocaleString("fr-FR")} KMF`}
          />
          <DetailRow
            label="Montant total"
            value={`${totalAmount.toLocaleString("fr-FR")} KMF`}
            valueWeight="700"
            isLast
          />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#10B981" />
          <Text style={styles.actionText}>Partager</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={20} color="#10B981" />
          <Text style={styles.actionText}>Télécharger le Reçu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  valueWeight?: "400" | "600" | "700";
  isLast?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  valueColor = "#1F2937",
  valueWeight = "600",
  isLast = false,
}) => {
  return (
    <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          { color: valueColor, fontWeight: valueWeight },
        ]}
      >
        {value}
      </Text>
    </View>
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
  },
  successContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  bottomActions: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  divider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
});

// Exemple d'utilisation

export default TransactionDetails;
