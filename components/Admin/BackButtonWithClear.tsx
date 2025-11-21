// components/BackButtonWithClear.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { CommerceType, useOnboardingStore } from "@/store/onboardingStore";

const BackButtonWithClear = () => {
  const { updateBusinessData } = useOnboardingStore();

  const handleBack = () => {
    // On vide les données du business avant de revenir
    updateBusinessData({
      name: "",
      description: "",
      type: "COMMERCANT",
      address: "",
      latitude: 4.0511,
      longitude: 9.7679,
      currencyId: "",
      activitySector: "",
      commerceType: "" as CommerceType,
      postalCode: "",
      siret: "",
      websiteUrl: "",
      logoUrl: "",
      coverImageUrl: "",
    });
    router.back();
  };

  return (
    <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
      <Ionicons name="arrow-back-outline" size={24} color="#000" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#eef0f4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});

export default BackButtonWithClear;
