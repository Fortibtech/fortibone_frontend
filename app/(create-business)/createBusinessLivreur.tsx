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
import { getAllSectores, Sector } from "@/api/sector/sectorApi";

type SearchResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

const VEHICLE_TYPES = [
  "SCOOTER",
  "MOTO",
  "VOITURE",
  "CAMIONNETTE",
  "VELO",
] as const;
const EXPERIENCE_LEVELS = ["DÉBUTANT", "CONFIRMÉ", "EXPERT"] as const;
const AVAILABILITY_ZONES = [
  "Centre-ville",
  "Banlieue",
  "Tout",
  "Zone spécifique",
] as const;

const CreateBusinessLivreur: React.FC = () => {
  const { businessData, updateBusinessData, reset } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  // Secteurs d'activité pour LIVREUR
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);

  // États modals
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [sectorModalVisible, setSectorModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const business = {
    ...businessData,
    type: "LIVREUR" as const,
    vehicleType: businessData.vehicleType || "SCOOTER",
    experienceLevel: businessData.experienceLevel || "DÉBUTANT",
    maxRadiusKm: businessData.maxRadiusKm || 15,
    baseZone: businessData.baseZone || "Centre-ville",
    availabilityHours: businessData.availabilityHours || "08h-22h",
    availableWeekends: businessData.availableWeekends ?? true,
    hasInsurance: businessData.hasInsurance ?? false,
    licensePlate: businessData.licensePlate || "",
    phone: businessData.phone || "",
    latitude: businessData.latitude || 4.0511,
    longitude: businessData.longitude || 9.7679,
    currencyId: businessData.currencyId || "",
    activitySector: businessData.activitySector || "", // ← ID du secteur sélectionné
    name: businessData.name || "",
    description: businessData.description || "",
    address: businessData.address || "",
    postalCode: businessData.postalCode || "",
    websiteUrl: businessData.websiteUrl || "",
    logoUrl: businessData.logoUrl || "",
    coverImageUrl: businessData.coverImageUrl || "",
  };

  // Nom du secteur sélectionné pour affichage
  const selectedSectorName = sectors.find(
    (s) => s.id === business.activitySector
  )?.name;

  // Chargement secteurs + devises
  useEffect(() => {
    const loadData = async () => {
      // Secteurs LIVREUR
      try {
        setLoadingSectors(true);
        const sectorData = await getAllSectores("LIVREUR");
        setSectors(sectorData);
      } catch (err) {
        console.error("Erreur chargement secteurs :", err);
        Alert.alert("Erreur", "Impossible de charger les secteurs d'activité");
      } finally {
        setLoadingSectors(false);
      }

      // Devises
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

    loadData();
  }, []);

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

  const filteredSectors = sectors.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pickImage = async (type: "logo" | "cover") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Activez l'accès à la galerie dans les paramètres."
      );
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
      errors.description = "Description de 20+ caractères requise";
    if (!business.currencyId) errors.currencyId = "Devise requise";
    if (!business.latitude || !business.longitude)
      errors.location = "Position GPS requise";
    if (!business.activitySector)
      errors.activitySector = "Secteur d’activité requis";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const cleanPayload = {
      name: business.name.trim(),
      description: business.description.trim(),
      type: "LIVREUR",
      commerceType: "PHYSICAL",
      address: business.address.trim(),
      latitude: Number(business.latitude),
      longitude: Number(business.longitude),
      currencyId: business.currencyId,
      sectorId: business.activitySector, // ← ID réel provenant de l'API
      postalCode: business.postalCode || null,
      siret: null,
      websiteUrl: business.websiteUrl || null,
    };

    console.log(
      "🚀 Payload envoyé (LIVREUR) :",
      JSON.stringify(cleanPayload, null, 2)
    );

    setLoading(true);
    try {
      const newBusiness = await BusinessesService.createBusiness(
        cleanPayload as any
      );

      // Upload logo
      if (business.logoUrl && business.logoUrl.startsWith("file://")) {
        try {
          await BusinessesService.uploadLogo(newBusiness.id, {
            uri: business.logoUrl,
            type: "image/jpeg",
            name: "logo.jpg",
          } as any);
        } catch (err) {
          console.warn("Échec upload logo", err);
        }
      }

      // Upload couverture
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
          console.warn("Échec upload couverture", err);
        }
      }

      await BusinessesService.selectBusiness(newBusiness);

      Alert.alert(
        "Félicitations !",
        `Ton profil livreur "${newBusiness.name}" a été créé avec succès !`,
        [
          {
            text: "Aller au dashboard",
            onPress: () => {
              reset();
              router.replace("/(delivery)");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error(
        "Erreur création profil livreur :",
        error.response?.data || error
      );
      Alert.alert(
        "Erreur",
        error?.response?.data?.message?.join("\n") ||
          error?.response?.data?.message ||
          "Impossible de créer le profil."
      );
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
          {/* Header */}
          <View style={styles.header}>
            <BackButtonWithClear />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Créer mon profil livreur</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.content}>
            {/* Nom / Pseudo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom / Pseudo professionnel *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.name && styles.inputError,
                ]}
                value={business.name}
                onChangeText={(t) => updateBusinessData({ name: t })}
                placeholder="ex: Rapid Express 237"
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              )}
            </View>

            {/* Téléphone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Téléphone professionnel *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.phone && styles.inputError,
                ]}
                value={business.phone}
                onChangeText={(t) => updateBusinessData({ phone: t })}
                placeholder="+237 6XX XX XX XX"
                keyboardType="phone-pad"
              />
              {validationErrors.phone && (
                <Text style={styles.errorText}>{validationErrors.phone}</Text>
              )}
            </View>

            {/* Secteur d’activité (ajouté comme dans le commerçant) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Secteur d’activité *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setSectorModalVisible(true)}
              >
                <Text style={{ color: selectedSectorName ? "#000" : "#999" }}>
                  {selectedSectorName || "Sélectionnez votre secteur"}
                </Text>
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {validationErrors.activitySector && (
                <Text style={styles.errorText}>
                  {validationErrors.activitySector}
                </Text>
              )}
            </View>

            {/* Véhicule principal */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Véhicule principal *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setVehicleModalVisible(true)}
              >
                <Text style={{ color: business.vehicleType ? "#000" : "#999" }}>
                  {business.vehicleType || "Choisir véhicule"}
                </Text>
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Immatriculation */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Immatriculation (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={business.licensePlate}
                onChangeText={(t) => updateBusinessData({ licensePlate: t })}
                placeholder="ex: CM 1234 AB"
              />
            </View>

            {/* Expérience */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Niveau d'expérience *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setExperienceModalVisible(true)}
              >
                <Text
                  style={{ color: business.experienceLevel ? "#000" : "#999" }}
                >
                  {business.experienceLevel || "Choisir expérience"}
                </Text>
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Zone principale */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Zone principale *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setZoneModalVisible(true)}
              >
                <Text style={{ color: business.baseZone ? "#000" : "#999" }}>
                  {business.baseZone || "Choisir zone"}
                </Text>
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Rayon max */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rayon maximum (km)</Text>
              <TextInput
                style={styles.input}
                value={String(business.maxRadiusKm)}
                onChangeText={(t) =>
                  updateBusinessData({ maxRadiusKm: Number(t) || 0 })
                }
                placeholder="15"
                keyboardType="numeric"
              />
            </View>

            {/* Horaires */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Horaires habituels</Text>
              <TextInput
                style={styles.input}
                value={business.availabilityHours}
                onChangeText={(t) =>
                  updateBusinessData({ availabilityHours: t })
                }
                placeholder="ex: 08h-22h"
              />
            </View>

            {/* Disponible week-ends */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Disponible week-ends</Text>
                <Switch
                  value={business.availableWeekends}
                  onValueChange={(v) =>
                    updateBusinessData({ availableWeekends: v })
                  }
                  trackColor={{ true: "#00C851" }}
                />
              </View>
            </View>

            {/* Véhicule assuré */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Véhicule assuré</Text>
                <Switch
                  value={business.hasInsurance}
                  onValueChange={(v) => updateBusinessData({ hasInsurance: v })}
                  trackColor={{ true: "#00C851" }}
                />
              </View>
            </View>

            {/* Adresse de base + carte */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adresse de base *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.address && styles.inputError,
                ]}
                value={business.address}
                onChangeText={(t) => updateBusinessData({ address: t })}
                placeholder="Votre point de départ habituel"
              />
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => {
                  setTempMarker({
                    latitude: business.latitude || 4.0511,
                    longitude: business.longitude || 9.7679,
                  });
                  setMapModalVisible(true);
                }}
              >
                <Feather name="map" size={20} color="#fff" />
                <Text style={styles.mapButtonText}>
                  {business.latitude
                    ? "Modifier sur carte"
                    : "Choisir sur carte"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description professionnelle *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  validationErrors.description && styles.inputError,
                ]}
                value={business.description}
                onChangeText={(t) => updateBusinessData({ description: t })}
                multiline
                textAlignVertical="top"
                placeholder="Expérience, rapidité, fiabilité, zones couvertes..."
              />
              <Text style={styles.counter}>
                {business.description?.length || 0}/500
              </Text>
              {validationErrors.description && (
                <Text style={styles.errorText}>
                  {validationErrors.description}
                </Text>
              )}
            </View>

            {/* Photo profil */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Photo profil livreur</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={() => pickImage("logo")}
              >
                {business.logoUrl ? (
                  <Image
                    source={{ uri: business.logoUrl }}
                    style={styles.logoPreview}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Feather name="camera" size={32} color="#999" />
                    <Text style={styles.imagePlaceholderText}>
                      Photo pro (casque/véhicule)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Photo couverture */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Photo couverture</Text>
              <TouchableOpacity
                style={styles.coverPickerButton}
                onPress={() => pickImage("cover")}
              >
                {business.coverImageUrl ? (
                  <Image
                    source={{ uri: business.coverImageUrl }}
                    style={styles.coverPreview}
                  />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Feather name="image" size={40} color="#999" />
                    <Text style={styles.coverPlaceholderText}>
                      Véhicule + zone d&apos;activité
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Devise */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Devise principale *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setCurrencyModalVisible(true)}
              >
                <Text style={{ color: business.currencyId ? "#000" : "#999" }}>
                  {currencies.find((c) => c.id === business.currencyId)?.code ||
                    "Sélectionner"}
                </Text>
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bouton créer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={validateAndSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                Créer mon profil livreur
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* MODAL SECTEUR D'ACTIVITÉ */}
        <Modal visible={sectorModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSectorModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Secteur d’activité</Text>
                <TouchableOpacity onPress={() => setSectorModalVisible(false)}>
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
                  placeholder="Rechercher un secteur..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ flex: 1 }}
                />
              </View>
              <FlatList
                data={filteredSectors}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  loadingSectors ? (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <ActivityIndicator size="small" color="#00C851" />
                      <Text style={{ marginTop: 10, color: "#666" }}>
                        Chargement...
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={{
                        padding: 20,
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      Aucun secteur trouvé
                    </Text>
                  )
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      business.activitySector === item.id &&
                        styles.currencyItemSelected,
                    ]}
                    onPress={() => {
                      updateBusinessData({ activitySector: item.id });
                      setSectorModalVisible(false);
                      setSearchQuery("");
                    }}
                  >
                    <Text style={styles.currencyCode}>{item.name}</Text>
                    {business.activitySector === item.id && (
                      <Feather name="check" size={24} color="#00C851" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Modal Véhicule */}
        <Modal visible={vehicleModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setVehicleModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Véhicule principal</Text>
                <TouchableOpacity onPress={() => setVehicleModalVisible(false)}>
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={VEHICLE_TYPES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      business.vehicleType === item &&
                        styles.currencyItemSelected,
                    ]}
                    onPress={() => {
                      updateBusinessData({ vehicleType: item } as any);
                      setVehicleModalVisible(false);
                    }}
                  >
                    <Text style={styles.currencyCode}>{item}</Text>
                    {business.vehicleType === item && (
                      <Feather name="check" size={24} color="#00C851" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Modal Expérience */}
        <Modal
          visible={experienceModalVisible}
          transparent
          animationType="fade"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setExperienceModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Expérience</Text>
                <TouchableOpacity
                  onPress={() => setExperienceModalVisible(false)}
                >
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={EXPERIENCE_LEVELS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      business.experienceLevel === item &&
                        styles.currencyItemSelected,
                    ]}
                    onPress={() => {
                      updateBusinessData({ experienceLevel: item } as any);
                      setExperienceModalVisible(false);
                    }}
                  >
                    <Text style={styles.currencyCode}>{item}</Text>
                    {business.experienceLevel === item && (
                      <Feather name="check" size={24} color="#00C851" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Modal Zone */}
        <Modal visible={zoneModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setZoneModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Zone principale</Text>
                <TouchableOpacity onPress={() => setZoneModalVisible(false)}>
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={AVAILABILITY_ZONES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      business.baseZone === item && styles.currencyItemSelected,
                    ]}
                    onPress={() => {
                      updateBusinessData({ baseZone: item } as any);
                      setZoneModalVisible(false);
                    }}
                  >
                    <Text style={styles.currencyCode}>{item}</Text>
                    {business.baseZone === item && (
                      <Feather name="check" size={24} color="#00C851" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        {/* // REMPLACE la partie commentée par CES 2 MODALS COMPLETS : */}
        {/* ===== MODAL DEVISE ===== */}
        <Modal visible={currencyModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
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
                  if (tempMarker) {
                    setMapModalVisible(false);
                  }
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
