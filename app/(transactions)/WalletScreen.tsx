import BackButton from "@/components/BackButton";
import CreatDepositWallet from "@/components/Wallet/CreatDepositWallet";
import Historique from "@/components/Wallet/Historique";
import React, { Fragment, JSX, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Define the colors object to match the light UI/UX theme
const colors = {
  background: "#fafafb",
  surface: "#ffffff",
  primary: "#059669",
  primaryVariant: "#047857",
  secondary: "#FFD60A",
  error: "#ef4444",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textDisabled: "#9ca3af",
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
};

// Common card style for consistency with provided UI/UX (white cards with shadows)
const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

// Define TypeScript type for wallet actions
type WalletActionType =
  | "Dépôt"
  | "Retrait"
  | "Transfert"
  | "Historique"
  | "Statistiques";

// Define TypeScript interface for component props
interface WalletActionsProps {
  onSelect: (action: WalletActionType) => void;
  selectedAction: WalletActionType;
}

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

// Mock components adapted to light theme
const MockWalletBalanceComponent: React.FC = () => (
  <View style={styles.mockComponent}>
    <Text style={[styles.mockText, { fontSize: 24, fontWeight: "700" }]}>
      Solde: 5,000 EUR
    </Text>
  </View>
);

const MockDepositForm: React.FC = () => (
  <View style={styles.mockComponent}>
    <Text style={styles.mockText}>Formulaire de dépôt</Text>
  </View>
);

const MockWithdrawForm: React.FC = () => (
  <View style={styles.mockComponent}>
    <Text style={styles.mockText}>Formulaire de retrait</Text>
  </View>
);

const MockTransfertForm: React.FC = () => (
  <View style={styles.mockComponent}>
    <Text style={styles.mockText}>Formulaire de transfert</Text>
  </View>
);

const MockWalletRecord: React.FC = () => (
  <View style={styles.mockComponent}>
    <Text style={[styles.mockText, { fontWeight: "600", marginBottom: 8 }]}>
      Historique des transactions
    </Text>
    <Text style={[styles.mockTextSecondary, { marginBottom: 4 }]}>
      - Dépôt: 1,000 EUR (01/10/2025)
    </Text>
    <Text style={styles.mockTextSecondary}>
      - Retrait: 500 EUR (02/10/2025)
    </Text>
  </View>
);

const MockExchangeStats: React.FC = () => (
  <View style={styles.mockComponent}>
    <Text style={[styles.mockText, { fontWeight: "600", marginBottom: 8 }]}>
      Statistiques
    </Text>
    <Text style={[styles.mockTextSecondary, { marginBottom: 4 }]}>
      - Transactions ce mois: 10
    </Text>
    <Text style={styles.mockTextSecondary}>- Solde moyen: 4,800 EUR</Text>
  </View>
);

const MockWalletActions: React.FC<WalletActionsProps> = ({
  onSelect,
  selectedAction,
}) => (
  <View style={styles.mockActions}>
    {(
      [
        "Dépôt",
        "Retrait",
        "Transfert",
        "Historique",
        "Statistiques",
      ] as WalletActionType[]
    ).map((action) => (
      <TouchableWithoutFeedback key={action} onPress={() => onSelect(action)}>
        <View
          style={[
            styles.mockActionButton,
            selectedAction === action && styles.mockActionButtonSelected,
          ]}
        >
          <Text
            style={[
              styles.mockActionText,
              selectedAction === action && styles.mockActionTextSelected,
            ]}
          >
            {action}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    ))}
  </View>
);

const MockHomeHeader: React.FC = () => (
  <View style={styles.mockHeader}>
    <BackButton />
    <Text style={styles.headerTitle}>Mon Portefeuille</Text>
  </View>
);

const StaticWalletScreen: React.FC = () => {
  const [selectedAction, setSelectedAction] =
    useState<WalletActionType>("Dépôt");

  const handleActionSelect = (action: WalletActionType): void => {
    setSelectedAction(action);
  };

  const renderSelectedContent = (): JSX.Element => {
    switch (selectedAction) {
      case "Dépôt":
        return <CreatDepositWallet />;
      case "Retrait":
        return <MockWithdrawForm />;
      case "Transfert":
        return <Historique />;
      case "Historique":
        return <MockWalletRecord />;
      case "Statistiques":
        return <MockExchangeStats />;
      default:
        return <MockDepositForm />;
    }
  };

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerContainer}>
              <MockHomeHeader />

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.header}>
                  <MockWalletBalanceComponent />
                  <MockWalletActions
                    onSelect={handleActionSelect}
                    selectedAction={selectedAction}
                  />
                </View>

                <View style={styles.contentSection}>
                  {renderSelectedContent()}
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Fragment>
  );
};

// Define TypeScript type for styles - adapted to light theme with shadows, green primary, consistent padding/gaps
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom tab
  },
  header: {
    gap: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contentSection: {
    paddingVertical: 24,
  },
  headerTop: {
    // For top header (MockHomeHeader)
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  mockHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "8",
  },
  bottomTabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mockComponent: {
    ...cardStyle,
  },
  mockText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  mockTextSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  mockActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  mockActionButton: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.border,
  },
  mockActionButtonSelected: {
    backgroundColor: colors.primary,
    borderLeftColor: colors.primary,
    shadowOpacity: 0.2,
  },
  mockActionText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  mockActionTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  mockBottomTab: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  mockTabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  mockTabButtonSelected: {
    backgroundColor: colors.primary,
  },
  mockTabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  mockTabTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default StaticWalletScreen;
