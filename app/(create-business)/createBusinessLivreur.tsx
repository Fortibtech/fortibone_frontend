// app/(onboarding)/create-business-livreur.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Switch,
  StyleSheet as RNStyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { useOnboardingStore } from "@/store/onboardingStore";
import { BusinessesService, Currency, CurrencyService } from "@/api";
import { router } from "expo-router";
import BackButtonWithClear from "@/components/Admin/BackButtonWithClear";

type SearchResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

type VehicleType = "SCOOTER" | "MOTO" | "VOITURE" | "CAMIONNETTE" | "VELO";
type ExperienceLevel = "DEBUTANT" | "CONFIRME" | "EXPERT";

const VEHICLE_TYPES = ["SCOOTER", "MOTO", "VOITURE", "CAMIONNETTE", "VELO"];
const EXPERIENCE_LEVELS = ["DÉBUTANT", "CONFIRMÉ", "EXPERT"];
const AVAILABILITY_ZONES = [
  "Centre-ville",
  "Banlieue",
  "Tout",
  "Zone spécifique",
];

const CreateBusinessLivreur: React.FC = () => {
  const { businessData, updateBusinessData, reset } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  // 👈 SPECIFIQUE LIVREUR PRO
  const business = {
    ...businessData,
    type: "LIVREUR" as const,
    vehicleType: (businessData as any).vehicleType || "SCOOTER",
    experienceLevel: (businessData as any).experienceLevel || "DEBUTANT",
    maxRadiusKm: (businessData as any).maxRadiusKm || 15,
    baseZone: (businessData as any).baseZone || "Centre-ville",
    availabilityHours: (businessData as any).availabilityHours || "08h-22h",
    availableWeekends: (businessData as any).availableWeekends ?? true,
    hasInsurance: (businessData as any).hasInsurance ?? false,
    licensePlate: (businessData as any).licensePlate || "",
    latitude: businessData.latitude || 4.0511,
    longitude: businessData.longitude || 9.7679,
    currencyId: businessData.currencyId || "",
    activitySector: "Livraison express",
    name: businessData.name || "",
    description: businessData.description || "",
    address: businessData.address || "",
    postalCode: businessData.postalCode || "",
    phone: (businessData as any).phone || "",
    websiteUrl: businessData.websiteUrl || "",
    logoUrl: businessData.logoUrl || "",
    coverImageUrl: businessData.coverImageUrl || "",
  };

  // TOUS les states modals
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempMarker, setTempMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [previewAddress, setPreviewAddress] = useState(
    "Sélectionnez votre base"
  );
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await CurrencyService.getCurrencies();
      setCurrencies(data);
      if (!business.currencyId) {
        const xaf = data.find((c) => c.code === "XAF");
        if (xaf) updateBusinessData({ currencyId: xaf.id });
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les devises");
    }
  };

  const updateLocation = async (
    lat: number,
    lng: number,
    formattedAddress?: string
  ) => {
    updateBusinessData({ latitude: lat, longitude: lng });
    setTempMarker({ latitude: lat, longitude: lng });

    let finalAddress = formattedAddress;
    if (!formattedAddress) {
      try {
        const [result] = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        if (result) {
          const parts = [
            result.name || result.street || "",
            result.streetNumber || "",
            result.postalCode || "",
            result.subregion || result.city || "",
            result.region || "",
            result.country || "",
          ].filter(Boolean);
          finalAddress = parts.join(", ");
        }
      } catch (err) {
        console.warn("Reverse geocoding échoué", err);
      }
    }

    if (finalAddress) {
      updateBusinessData({ address: finalAddress });
      setPreviewAddress(finalAddress);
    }
  };

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pickImage = async (type: "logo" | "cover") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "Activez l'accès à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "logo" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    if (type === "logo") {
      updateBusinessData({ logoUrl: uri });
    } else {
      updateBusinessData({ coverImageUrl: uri });
    }
  };

  const validateAndSave = async () => {
    const errors: Record<string, string> = {};
    if (!business.name?.trim()) errors.name = "Nom requis";
    if (!business.phone?.trim()) errors.phone = "Téléphone requis";
    if (!business.address?.trim()) errors.address = "Adresse de base requise";
    if (!business.description?.trim() || business.description.length < 20)
      errors.description = "Description 20+ caractères requise";
    if (!business.currencyId) errors.currencyId = "Devise requise";
    if (!business.latitude || !business.longitude)
      errors.location = "Position GPS requise";
    if (!business.vehicleType) errors.vehicleType = "Véhicule requis";
    if (!business.experienceLevel)
      errors.experience = "Niveau d'expérience requis";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const cleanPayload = {
        name: business.name.trim(),
        description: business.description.trim(),
        type: "LIVREUR",
        commerceType: "PHYSICAL", // 👈 AJOUTÉ - OBLIGATOIRE comme RESTAURATEUR
        address: business.address.trim(),
        latitude: Number(business.latitude),
        longitude: Number(business.longitude),
        currencyId: business.currencyId,
        activitySector: "Livraison express",
        postalCode: business.postalCode || null,
        phone: business.phone,
        websiteUrl: business.websiteUrl || null,
        siret: null,
        // 👈 CHAMPS LIVREUR PRO
        vehicleType: business.vehicleType,
        experienceLevel: business.experienceLevel,
        maxRadiusKm: Number(business.maxRadiusKm),
        baseZone: business.baseZone,
        availabilityHours: business.availabilityHours,
        availableWeekends: business.availableWeekends,
        hasInsurance: business.hasInsurance,
        licensePlate: business.licensePlate || null,
      };

      const newBusiness = await BusinessesService.createBusiness(
        cleanPayload as any
      );

      // Upload images
      if (business.logoUrl && business.logoUrl.startsWith("file://")) {
        try {
          await BusinessesService.uploadLogo(newBusiness.id, {
            uri: business.logoUrl,
            type: "image/jpeg",
            name: "logo.jpg",
          } as any);
        } catch (err) {
          console.warn("Échec logo", err);
        }
      }

      if (
        business.coverImageUrl &&
        business.coverImageUrl.startsWith("file://")
      ) {
        try {
          await BusinessesService.uploadCover(newBusiness.id, {
            uri: business.coverImageUrl,
            type: "image/jpeg",
            name: "cover.jpg",
          } as any);
        } catch (err) {
          console.warn("Échec cover", err);
        }
      }

      await BusinessesService.selectBusiness(newBusiness);

      Alert.alert(
        "✅ Profil créé !",
        `Bienvenue ${newBusiness.name} ! Tu peux maintenant accepter des courses.`,
        [
          {
            text: "Dashboard Livreur",
            onPress: () => {
              reset();
              router.replace("/(delivery)");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de créer le profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header + Formulaire - IDENTIQUE à ce que tu as */}
          <View style={styles.header}>
            <BackButtonWithClear />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Créer mon profil livreur</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.content}>
            {/* 👈 TOUS TES CHAMPS FORMULAIRES RESTENT IDENTIQUES 👈 */}
            {/* Nom, téléphone, véhicule, etc... (copie ton code existant) */}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={validateAndSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Créer mon profil PRO</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 👇 TOUS LES MODALS COMPLETS 👇 */}

        {/* Modal Véhicule, Expérience, Zone - IDENTIQUES à ce que tu as */}

        {/* ===== MODAL DEVISE ===== */}
        <Modal visible={currencyModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={RNStyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setCurrencyModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Choisir devise</Text>
                    <TouchableOpacity
                      onPress={() => setCurrencyModalVisible(false)}
                    >
                      <Feather name="x" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.searchContainer}>
                    <Feather
                      name="search"
                      size={20}
                      color="#999"
                      style={{ marginRight: 10 }}
                    />
                    <TextInput
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      style={{ flex: 1 }}
                      autoFocus
                    />
                  </View>

                  <FlatList
                    data={filteredCurrencies}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.currencyItem,
                          item.id === business.currencyId &&
                            styles.currencyItemSelected,
                        ]}
                        onPress={() => {
                          updateBusinessData({ currencyId: item.id });
                          setCurrencyModalVisible(false);
                          setSearchQuery("");
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.currencyCode}>
                            {item.code} {item.symbol}
                          </Text>
                          <Text style={styles.currencyName}>{item.name}</Text>
                        </View>
                        {item.id === business.currencyId && (
                          <Feather name="check" size={24} color="#00C851" />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ===== MODAL MAP PLEIN ÉCRAN ===== */}
        <Modal visible={mapModalVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.mapSearchHeader}>
              <View style={styles.searchInputContainer}>
                <Feather
                  name="search"
                  size={20}
                  color="#666"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  placeholder="Rechercher adresse..."
                  value={addressSearch}
                  onChangeText={async (text) => {
                    setAddressSearch(text);
                    if (text.trim().length < 3) {
                      setSearchResults([]);
                      return;
                    }
                    setIsSearchingAddress(true);
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                          text
                        )}&limit=8&addressdetails=1`,
                        { headers: { "User-Agent": "FortibOne/1.0" } }
                      );
                      const data = await res.json();
                      const results = data.map((item: any) => ({
                        latitude: parseFloat(item.lat),
                        longitude: parseFloat(item.lon),
                        formattedAddress: item.display_name
                          .split(",")
                          .slice(0, 4)
                          .join(","),
                      }));
                      setSearchResults(results);
                    } catch (e) {
                      setSearchResults([]);
                    } finally {
                      setIsSearchingAddress(false);
                    }
                  }}
                  style={{ flex: 1, fontSize: 16 }}
                  autoFocus
                />
                {isSearchingAddress && (
                  <ActivityIndicator size="small" color="#00C851" />
                )}
              </View>
              <TouchableOpacity onPress={() => setMapModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
              <View style={styles.searchResultsFull}>
                <FlatList
                  data={searchResults}
                  keyExtractor={(_, index) => index.toString()}
                  style={{ maxHeight: 320 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => {
                        updateLocation(
                          item.latitude,
                          item.longitude,
                          item.formattedAddress
                        );
                        setSearchResults([]);
                        setAddressSearch("");
                      }}
                    >
                      <Feather name="map-pin" size={20} color="#00C851" />
                      <Text style={styles.resultText} numberOfLines={2}>
                        {item.formattedAddress}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              region={{
                latitude: tempMarker?.latitude || business.latitude || 4.0511,
                longitude:
                  tempMarker?.longitude || business.longitude || 9.7679,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(e) => {
                updateLocation(
                  e.nativeEvent.coordinate.latitude,
                  e.nativeEvent.coordinate.longitude
                );
                setSearchResults([]);
              }}
            >
              {tempMarker && (
                <Marker
                  coordinate={tempMarker}
                  draggable
                  onDragEnd={(e) =>
                    updateLocation(
                      e.nativeEvent.coordinate.latitude,
                      e.nativeEvent.coordinate.longitude
                    )
                  }
                />
              )}
            </MapView>

            <View style={styles.mapBottomBar}>
              <View style={styles.previewContainer}>
                <Text style={styles.previewCoords}>
                  Lat:{" "}
                  {(tempMarker?.latitude || business.latitude || 0).toFixed(6)}{" "}
                  | Lon:{" "}
                  {(tempMarker?.longitude || business.longitude || 0).toFixed(
                    6
                  )}
                </Text>
                <Text style={styles.previewAddressText} numberOfLines={2}>
                  {previewAddress}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.confirmMapButton,
                  !tempMarker && { opacity: 0.5 },
                ]}
                onPress={() => {
                  if (tempMarker) setMapModalVisible(false);
                }}
              >
                <Text style={styles.confirmMapText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Copie les styles EXACTS du RESTAURATEUR
const styles = StyleSheet.create({
  // ==================== BASE LAYOUT ====================
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
  },
  content: { paddingHorizontal: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 13, marginTop: 6 },
  textArea: { height: 120, textAlignVertical: "top" },
  counter: { fontSize: 12, color: "#666", marginTop: 4 },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
  },

  // ==================== ACTIONS ====================
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00C851",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  mapButtonText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#00C851",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // ==================== SWITCHES ====================
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },

  // ==================== MODALS GÉNÉRIQUES ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "92%",
    maxHeight: "85%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  // ==================== LISTES MODALES (Véhicule/Expérience/Zone) ====================
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  currencyItemSelected: {
    backgroundColor: "#f0fdf4",
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  currencyName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  // ==================== MODAL CARTE PLEIN ÉCRAN ====================
  mapSearchHeader: {
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginRight: 12,
  },
  searchResultsFull: {
    backgroundColor: "#fff",
    maxHeight: 320,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  resultText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 15,
    color: "#111",
  },
  mapBottomBar: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  previewContainer: {
    marginBottom: 12,
  },
  previewCoords: {
    fontSize: 13,
    color: "#00C851",
    fontWeight: "600",
  },
  previewAddressText: {
    fontSize: 15,
    color: "#333",
    marginTop: 4,
  },
  confirmMapButton: {
    backgroundColor: "#00C851",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmMapText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // ==================== UPLOAD IMAGES ====================
  imagePickerButton: {
    alignSelf: "center",
    marginTop: 12,
  },
  logoPreview: {
    width: 140,
    height: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00C851",
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  coverPickerButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  coverPreview: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  coverPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  coverPlaceholderText: {
    marginTop: 12,
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default CreateBusinessLivreur;
