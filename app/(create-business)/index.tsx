import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import BackButtonAdmin from "@/components/Admin/BackButton";

const Index = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleProTypeSelect = (
    proType: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR"
  ) => {
    setSelectedType(proType);
  };

  const handleContinue = async () => {
    if (!selectedType) return;

    await AsyncStorage.setItem("proSubType", selectedType);

    switch (selectedType) {
      case "COMMERCANT":
        router.push("/createBusinessCommercant");
        break;
      case "FOURNISSEUR":
        router.push("/createBusinessFournisseur");
        break;
      case "RESTAURATEUR":
        router.push("/createBusinessRestaurateur");
        break;
    }
  };

  const proTypes = [
    {
      id: "COMMERCANT",
      title: "Je suis COMMERÇANT",
      icon: "storefront-outline",
    },
    {
      id: "FOURNISSEUR",
      title: "Je suis FOURNISSEUR",
      icon: "briefcase-outline", // ← Icône changée ici (anciennement truck-outline)
    },
    {
      id: "RESTAURATEUR",
      title: "Je suis RESTAURATEUR",
      icon: "restaurant-outline",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.backButton}>
            <BackButtonAdmin />
          </View>
          <Text style={styles.question}>
            Que souhaitez-vous faire sur FortibOne ?
          </Text>
        </View>

        {proTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.accountTypeCard,
              selectedType === type.id && styles.accountTypeCardSelected,
            ]}
            onPress={() => handleProTypeSelect(type.id as any)}
            activeOpacity={0.85}
          >
            <View style={styles.cardContent}>
              {/* Icône à gauche */}
              <Ionicons
                name={type.icon as any}
                size={36}
                color={selectedType === type.id ? "#059669" : "#94a3b8"}
              />

              {/* Texte */}
              <Text style={styles.accountTypeTitle}>{type.title}</Text>

              {/* Checkmark quand sélectionné */}
              {selectedType === type.id && (
                <View style={styles.checkmarkBadge}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <CustomButton
          title={selectedType ? "Continuer" : "Veuillez choisir une option"}
          onPress={handleContinue}
          backgroundColor="#059669"
          textColor="#fff"
          disabled={!selectedType}
          width="100%"
          height={56}
          borderRadius={16}
          fontSize={17}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "relative",

    right: 25,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,

    gap: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingBottom: 40,
  },
  question: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",

    lineHeight: 30,
  },

  accountTypeCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  accountTypeCardSelected: {
    backgroundColor: "#ecfdf5",
    borderColor: "#059669",
    shadowOpacity: 0.15,
    elevation: 8,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  accountTypeTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginLeft: 16,
    flex: 1, // permet au texte de prendre tout l'espace disponible
  },

  checkmarkBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#059669",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
});

export default Index;
