import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BalanceCard = ({ balance }: { balance: number }) => {
  const [hidden, setHidden] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Ligne 1 - Label */}
      <View style={styles.row}>
        <Ionicons name="wallet-outline" size={20} color="#58617b" />
        <Text style={styles.label}>Active Balance</Text>
      </View>

      {/* Ligne 2 - Montant */}
      <View style={styles.rowBetween}>
        <Text style={styles.amount}>
          {hidden ? "••••••" : `${balance?.toFixed(2) ?? "0.00"} KMF`}
        </Text>
        <TouchableOpacity onPress={() => setHidden(!hidden)}>
          <Ionicons
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#58617b"
          />
        </TouchableOpacity>
      </View>

      {/* Ligne 3 - Trois actions */}
      <View style={styles.actionsRow}>
        {/* Dépôt */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.depositBtn]}
          onPress={() => router.push("/finance/DepositScreen")}
        >
          <Feather name="arrow-down-left" size={20} color="#fff" />
          <Text style={styles.depositText}>Dépôt</Text>
        </TouchableOpacity>

        {/* Retrait */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.withdrawBtn]}
          onPress={() => router.push("/finance/RetraitArgent")}
        >
          <Feather name="arrow-up-right" size={20} color="#ff4444" />
          <Text style={styles.withdrawText}>Retrait</Text>
        </TouchableOpacity>

        {/* Transfert */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.transferBtn]}
          onPress={() => router.push("/finance/TransferMoney")}
        >
          <MaterialIcons name="swap-horiz" size={20} color="#fff" />
          <Text style={styles.transferText}>Transfert</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 180,
    padding: 20,
    borderWidth: 1,
    borderColor: "#00af66",
    borderRadius: 20,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#58617b",
  },
  amount: {
    fontSize: 26,
    fontWeight: "700",
    color: "#00af66",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8, // ✅ Réduit de 12 à 8
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1, // ✅ Utilise flex: 1 au lieu de width: "30%"
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48, // ✅ Réduit de 50 à 48
    borderRadius: 24,
    paddingHorizontal: 10, // ✅ Réduit de 12 à 10
    gap: 6, // ✅ Réduit de 8 à 6
    minWidth: 0, // ✅ Permet la compression si nécessaire
  },
  // Dépôt
  depositBtn: {
    backgroundColor: "#00af66",
  },
  depositText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 10, // ✅ Réduit de 15 à 14
    flexShrink: 1, // ✅ Permet au texte de s'adapter
  },
  // Retrait
  withdrawBtn: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ff4444",
  },
  withdrawText: {
    color: "#ff4444",
    fontWeight: "600",
    fontSize: 10, // ✅ Réduit de 15 à 14
    flexShrink: 1, // ✅ Permet au texte de s'adapter
  },
  // Transfert
  transferBtn: {
    backgroundColor: "#3366ff",
  },
  transferText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 10,
    flexShrink: 1, // ✅ Permet au texte de s'adapter
  },
});

export default BalanceCard;
