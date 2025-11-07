// components/Achat/CompanyProfile.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  onSearch: (text: string) => void;
  onFilterPress: () => void;
}

export default function CompanyProfile({ onSearch, onFilterPress }: Props) {
  const [searchText, setSearchText] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.appleLogo}>
            <Text style={styles.appleText}>Logo</Text>
          </View>
        </View>

        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>
            Wuxi Rongpeng Technology Co., Ltd
          </Text>
          <View style={styles.badgeContainer}>
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={16} color="#1877F2" />
              <Text style={styles.verifiedText}>Vérifiée</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            onSearch(text);
          }}
        />
        <TouchableOpacity onPress={onFilterPress}>
          <Feather name="sliders" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
    marginBottom: 45,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    marginRight: 16,
  },
  appleLogo: {
    width: 80,
    height: 80,
    backgroundColor: "#000",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  appleText: {
    fontSize: 50,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    lineHeight: 24,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 14,
    color: "#1877F2",
    fontWeight: "500",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#FFC107",
    fontWeight: "600",
  },
  chevronButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    padding: 8,
  },
});
