import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
const BalanceCard = ({
  balance,
  onDepositPress,
}: {
  balance: number;
  onDepositPress: () => void; // <- prop pour gérer le clic
}) => {
  const [hidden, setHidden] = useState(false);
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Ligne 1 */}
      <View style={styles.row}>
        <Ionicons name="wallet-outline" size={20} color="#58617b" />
        <Text style={styles.label}>Active Balance</Text>
      </View>

      {/* Ligne 2 */}
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

      {/* Ligne 3  onPress={onDepositPress} */}
      <View style={styles.rowBetween}>
        <TouchableOpacity
          style={styles.depositBtn}
          onPress={() => router.push("/finance/DepositScreen")}
        >
          <Feather name="arrow-down-left" size={20} color="#fff" />
          <Text style={styles.depositText}>Dépôt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => router.push("/finance/RetraitArgent")}
        >
          <Feather name="arrow-up-right" size={20} color="#00af66" />
          <Text style={styles.withdrawText}>Retrait</Text>
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
  depositBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 155,
    height: 48,
    backgroundColor: "#00af66",
    borderRadius: 28,
    gap: 6,
  },
  depositText: {
    color: "#fff",
    fontWeight: "600",
  },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 155,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#00af66",
    gap: 6,
  },
  withdrawText: {
    color: "#00af66",
    fontWeight: "600",
  },
});

export default BalanceCard;
