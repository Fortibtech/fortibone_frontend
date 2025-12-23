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
type CommerceType = "PHYSICAL" | "ONLINE" | "HYBRID";

const CreateBusinessCommercant: React.FC = () => {
  const { businessData, updateBusinessData, reset } = useOnboardingStore();

  const [loading, setLoading] = useState(false);

  // Force COMMERCANT + valeurs par défaut
  const business = {
    ...businessData,
    type: "COMMERCANT" as const,
    commerceType: businessData.commerceType || "PHYSICAL",
    latitude: businessData.latitude || 4.0511,
    longitude: businessData.longitude || 9.7679,
    currencyId: businessData.currencyId || "",
    activitySector: businessData.activitySector || "", // ← ID du secteur (string)
    name: businessData.name || "",
    description: businessData.description || "",
    address: businessData.address || "",
    postalCode: businessData.postalCode || "",
    siret: businessData.siret || "",
    websiteUrl: businessData.websiteUrl || "",
    logoUrl: businessData.logoUrl || "",
    coverImageUrl: businessData.coverImageUrl || "",
  };

  // États pour secteurs et devises
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Modals
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [sectorModalVisible, setSectorModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Carte
  const [tempMarker, setTempMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [previewAddress, setPreviewAddress] = useState(
    "Sélectionnez un emplacement"
  );

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      // Secteurs COMMERCANT
      try {
        setLoadingSectors(true);
        const sectorData = await getAllSectores("COMMERCANT");
        setSectors(sectorData);
      } catch (err) {
        console.error("Erreur chargement secteurs :", err);
        Alert.alert("Erreur", "Impossible de charger les secteurs d'activité");
      } finally {
        setLoadingSectors(false);
      }

      // Devises
      try {
        const currencyData = await CurrencyService.getCurrencies();
        setCurrencies(currencyData);
        if (!business.currencyId) {
          const xaf = currencyData.find((c) => c.code === "XAF");
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

  // Filtrage
  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSectors = sectors.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Nom du secteur sélectionné pour affichage
  const selectedSectorName = sectors.find(
    (s) => s.id === business.activitySector
  )?.name;

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
    if (!business.address?.trim()) errors.address = "Adresse requise";
    if (!business.description?.trim() || business.description.length < 20)
      errors.description = "Description de 20+ caractères requise";
    if (!business.currencyId) errors.currencyId = "Devise requise";
    if (!business.latitude || !business.longitude)
      errors.latitude = "Position GPS requise";
    if (!business.activitySector)
      errors.activitySector = "Secteur d’activité requis";
    if (!business.commerceType) errors.commerceType = "Type de commerce requis";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const cleanPayload = {
        name: business.name.trim(),
        description: business.description.trim(),
        type: "COMMERCANT",
        address: business.address.trim(),
        latitude: Number(business.latitude),
        longitude: Number(business.longitude),
        currencyId: business.currencyId,
        sectorId: business.activitySector, // ← ENVOI CORRECT : sectorId avec l'ID
        commerceType: business.commerceType,
        postalCode: business.postalCode || null,
        siret: business.siret || null,
        websiteUrl: business.websiteUrl || null,
      };

      console.log("Payload envoyée :", cleanPayload);

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

      // Sélection automatique
      try {
        await BusinessesService.selectBusiness(newBusiness);
      } catch (err) {
        console.warn("Impossible de sélectionner automatiquement", err);
      }

      Alert.alert(
        "Félicitations !",
        `Ton commerce "${newBusiness.name}" a été créé avec succès !`,
        [
          {
            text: "Continuer",
            onPress: () => {
              reset();
              router.replace("/(professionnel)");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error(
        "Erreur création commerce :",
        error.response?.data || error
      );
      Alert.alert(
        "Erreur",
        error?.response?.data?.message?.join("\n") ||
          error?.response?.data?.message ||
          error.message ||
          "Impossible de créer le commerce."
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
          {/* HEADER */}
          <View style={styles.header}>
            <BackButtonWithClear />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Créer mon commerce</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.content}>
            {/* Nom */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du commerce *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.name && styles.inputError,
                ]}
                value={business.name}
                onChangeText={(t) => updateBusinessData({ name: t })}
                placeholder="ex: Boutique Marie"
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              )}
            </View>

            {/* Type de commerce */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type de commerce *</Text>
              <View style={styles.radioGroup}>
                {(["PHYSICAL", "ONLINE", "HYBRID"] as CommerceType[]).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.radioItem,
                        business.commerceType === type &&
                          styles.radioItemSelected,
                      ]}
                      onPress={() => updateBusinessData({ commerceType: type })}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          business.commerceType === type &&
                            styles.radioTextSelected,
                        ]}
                      >
                        {type === "PHYSICAL"
                          ? "Physique"
                          : type === "ONLINE"
                          ? "En ligne"
                          : "Hybride"}
                      </Text>
                      {business.commerceType === type && (
                        <Feather name="check" size={20} color="#059669" />
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Secteur d’activité */}
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

            {/* Adresse + Carte */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adresse complète *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.address && styles.inputError,
                ]}
                value={business.address}
                onChangeText={(t) => updateBusinessData({ address: t })}
                placeholder="Rue, quartier, ville"
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
                    ? "Modifier sur la carte"
                    : "Choisir sur la carte"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Autres champs */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Code postal</Text>
              <TextInput
                style={styles.input}
                value={business.postalCode}
                onChangeText={(t) => updateBusinessData({ postalCode: t })}
                placeholder="75001"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>SIRET (facultatif)</Text>
              <TextInput
                style={styles.input}
                value={business.siret}
                onChangeText={(t) => updateBusinessData({ siret: t })}
                placeholder="123 456 789 00012"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Site web (facultatif)</Text>
              <TextInput
                style={styles.input}
                value={business.websiteUrl}
                onChangeText={(t) => updateBusinessData({ websiteUrl: t })}
                placeholder="https://maboutique.com"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
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
                placeholder="Parlez de vos produits, horaires, spécialités..."
              />
              <Text style={styles.counter}>
                {business.description?.length || 0}/20 min
              </Text>
              {validationErrors.description && (
                <Text style={styles.errorText}>
                  {validationErrors.description}
                </Text>
              )}
            </View>

            {/* Logo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Logo du commerce *</Text>
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
                      Ajouter un logo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Couverture */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Photo de couverture</Text>
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
                      Ajouter une photo de couverture
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
                    "Sélectionnez"}
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
            <Text style={styles.saveButtonText}>
              {loading ? "Création en cours..." : "Créer mon commerce"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODAL SECTEUR */}
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
                      <ActivityIndicator size="small" color="#059669" />
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
                      <Feather name="check" size={24} color="#059669" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        {/* ==================== MODAL CARTE PLEIN ÉCRAN ==================== */}
        <Modal visible={mapModalVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Barre de recherche */}
            <View style={styles.mapSearchHeader}>
              <View style={styles.searchInputContainer}>
                <Feather
                  name="search"
                  size={20}
                  color="#666"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  placeholder="Marché Central Yaoundé, Akwa Douala..."
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
                      console.log(e);
                      setSearchResults([]);
                    } finally {
                      setIsSearchingAddress(false);
                    }
                  }}
                  style={{ flex: 1, fontSize: 16 }}
                  autoFocus
                />
                {isSearchingAddress && (
                  <ActivityIndicator size="small" color="#059669" />
                )}
              </View>
              <TouchableOpacity onPress={() => setMapModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Résultats recherche */}
            {searchResults.length > 0 && (
              <View style={styles.searchResultsFull}>
                <FlatList
                  data={searchResults}
                  keyExtractor={(_, index) => index.toString()}
                  style={{ maxHeight: 320 }}
                  renderItem={(
                    { item } // ← ici c'était manquant ou mal placé dans mon exemple précédent
                  ) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => {
                        const coords = {
                          latitude: item.latitude,
                          longitude: item.longitude,
                        };
                        setTempMarker(coords);
                        // On utilise l'adresse bien formatée de Nominatim
                        updateLocation(
                          item.latitude,
                          item.longitude,
                          item.formattedAddress
                        );
                        setSearchResults([]);
                        setAddressSearch("");
                      }}
                    >
                      <Feather name="map-pin" size={20} color="#059669" />
                      <Text style={styles.resultText} numberOfLines={2}>
                        {item.formattedAddress}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Carte */}
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              region={{
                latitude:
                  tempMarker?.latitude || businessData.latitude || 4.0511,
                longitude:
                  tempMarker?.longitude || businessData.longitude || 9.7679,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(e) => {
                const c = e.nativeEvent.coordinate;
                setTempMarker(c);
                // On utilise updateLocation au lieu de l’ancienne fonction
                updateLocation(c.latitude, c.longitude);
                setSearchResults([]);
              }}
            >
              {tempMarker && (
                <Marker
                  coordinate={tempMarker}
                  draggable
                  onDragEnd={(e) => {
                    const c = e.nativeEvent.coordinate;
                    setTempMarker(c);
                    updateLocation(c.latitude, c.longitude);
                  }}
                />
              )}
            </MapView>
            {/* Preview + Confirmer */}
            <View style={styles.mapBottomBar}>
              <View style={styles.previewContainer}>
                <Text style={styles.previewCoords}>
                  Lat:{" "}
                  {(tempMarker?.latitude || businessData.latitude || 0).toFixed(
                    6
                  )}{" "}
                  | Lon:{" "}
                  {(
                    tempMarker?.longitude ||
                    businessData.longitude ||
                    0
                  ).toFixed(6)}
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
                    updateBusinessData({
                      latitude: tempMarker.latitude,
                      longitude: tempMarker.longitude,
                    });
                    Alert.alert(
                      "Position enregistrée !",
                      "L'adresse est mise à jour."
                    );
                  }
                  setMapModalVisible(false);
                }}
              >
                <Text style={styles.confirmMapText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* === MODAL SECTEUR D’ACTIVITÉ === */}
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
                keyExtractor={(item) => item.id} // ← Doit retourner une STRING (l'id unique)
                ListEmptyComponent={
                  loadingSectors ? (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <ActivityIndicator size="small" color="#059669" />
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
                        styles.currencyItemSelected, // ← Comparaison avec l'ID (string)
                    ]}
                    onPress={() => {
                      updateBusinessData({ activitySector: item.id }); // ← On stocke l'ID (string)
                      setSectorModalVisible(false);
                      setSearchQuery("");
                    }}
                  >
                    <Text style={styles.currencyCode}>{item.name}</Text>{" "}
                    {/* ← Affichage du nom */}
                    {business.activitySector === item.id && (
                      <Feather name="check" size={24} color="#059669" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Modal Devise */}
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
                    <Text style={styles.modalTitle}>Choisir une devise</Text>
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
                          <Feather name="check" size={24} color="#059669" />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateBusinessCommercant;

// Styles finaux
const styles = StyleSheet.create({
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 6,
  },
  radioItemSelected: {
    backgroundColor: "#e6f7f0",
    borderColor: "#059669",
  },
  radioText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  radioTextSelected: {
    color: "#059669",
    fontWeight: "700",
  },
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
  imagePickerButton: {
    alignSelf: "center",
    marginTop: 12,
  },
  logoPreview: {
    width: 140,
    height: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#059669",
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
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "#f0f0f0",
  },
  coverPreviewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#f0f0f0",
  },
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
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff", // au cas où
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none", // important pour que le titre ne bloque pas les clics
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
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
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
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Modal carte plein écran
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
  resultText: { marginLeft: 12, flex: 1, fontSize: 15, color: "#111" },
  mapBottomBar: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  previewContainer: { marginBottom: 12 },
  previewCoords: { fontSize: 13, color: "#059669", fontWeight: "600" },
  previewAddressText: { fontSize: 15, color: "#333", marginTop: 4 },
  confirmMapButton: {
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmMapText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
