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
import { BusinessesService, Currency, CurrencyService } from "@/api";
import { getAllSectores, Sector } from "@/api/sector/sectorApi";
import BackButtonAdmin from "@/components/Admin/BackButton";

interface Props {
  id: string;
}

type SearchResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

const RestaurateurComponent: React.FC<Props> = ({ id }) => {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<any>(null);
  const [coverFile, setCoverFile] = useState<any>(null);

  // Modals
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempMarker, setTempMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [previewAddress, setPreviewAddress] = useState("");

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [sectorModalVisible, setSectorModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: 0,
    longitude: 0,
    sectorId: "",
    currencyId: "",
    postalCode: "",
    phone: "",
    websiteUrl: "",
  });

  useEffect(() => {
    if (id) {
      loadBusiness();
      loadCurrencies();
      loadSectors();
    }
  }, [id]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const data = await BusinessesService.getBusinessById(id);
      setBusiness(data);

      setFormData({
        name: data.name || "",
        description: data.description || "",
        address: data.address || "",
        latitude: data.latitude || 4.0511,
        longitude: data.longitude || 9.7679,
        sectorId: data.sectorId || "",
        currencyId: data.currencyId || "",
        postalCode: data.postalCode || "",
        phone: data.phone || "",
        websiteUrl: data.websiteUrl || "",
      });

      setPreviewAddress(data.address || "Aucune adresse définie");

      if (data.latitude && data.longitude) {
        setTempMarker({ latitude: data.latitude, longitude: data.longitude });
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger le restaurant.");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrencies = async () => {
    try {
      const data = await CurrencyService.getCurrencies();
      setCurrencies(data);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les devises.");
    }
  };

  const loadSectors = async () => {
    try {
      setSectorsLoading(true);
      const data = await getAllSectores("RESTAURATEUR");
      setSectors(data);
      setFilteredSectors(data);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les secteurs.");
    } finally {
      setSectorsLoading(false);
    }
  };

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredSectors(
      searchQuery.trim()
        ? sectors.filter((s) => s.name.toLowerCase().includes(lowerQuery))
        : sectors
    );
  }, [searchQuery, sectors]);

  const updateLocation = async (
    lat: number,
    lng: number,
    formattedAddress?: string
  ) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
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
            result.city || result.subregion || "",
            result.region || "",
            result.country || "",
          ].filter(Boolean);
          finalAddress = parts.join(", ");
        }
      } catch (err) {
        console.warn("Reverse geocoding failed", err);
      }
    }

    if (finalAddress) {
      setFormData((prev) => ({ ...prev, address: finalAddress }));
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
      Alert.alert(
        "Permission refusée",
        "Veuillez autoriser l’accès à la galerie."
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

    const file = {
      uri: result.assets[0].uri,
      type: "image/jpeg",
      name: type === "logo" ? "logo.jpg" : "cover.jpg",
    };

    if (type === "logo") setLogoFile(file);
    else setCoverFile(file);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Nom requis";
    if (!formData.address.trim()) errors.address = "Adresse requise";
    if (!formData.description.trim() || formData.description.length < 10)
      errors.description = "Description de 10 caractères minimum";
    if (!formData.currencyId) errors.currencyId = "Devise requise";
    if (!formData.sectorId) errors.sectorId = "Secteur requis";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Champs manquants",
        "Veuillez corriger les erreurs indiquées."
      );
      return;
    }

    setSaving(true);
    try {
      // Payload minimal et conforme au schéma partagé de l'API
      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        currencyId: formData.currencyId,
        sectorId: formData.sectorId,
        postalCode: formData.postalCode?.trim() || null,
        websiteUrl: formData.websiteUrl?.trim() || null,
        phoneNumber: formData.phone?.trim() || null, 
        commerceType: business?.commerceType || "HYBRID", 
        logoUrl: business?.logoUrl || null,
        coverImageUrl: business?.coverImageUrl || null,
      };

      console.log("Payload envoyé :", payload);

      await BusinessesService.updateBusiness(id, payload);

      if (logoFile) await BusinessesService.uploadLogo(id, logoFile);
      if (coverFile) await BusinessesService.uploadCover(id, coverFile);

      Alert.alert("Succès !", "Votre restaurant a été mis à jour.", [
        { text: "OK" },
      ]);
    } catch (error: any) {
      console.error("Erreur sauvegarde :", error);
      Alert.alert("Erreur", error.message || "Échec de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    // Si l'erreur existait pour ce champ, on la supprime proprement
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const { [key]: omitted, ...rest } = prev;
        return rest;
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement du restaurant...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={styles.header}>
            <BackButtonAdmin />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Modifier mon restaurant</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.content}>
            {/* Nom */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du restaurant *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.name && styles.inputError,
                ]}
                value={formData.name}
                onChangeText={(t) => updateField("name", t)}
                placeholder="ex: Le Gourmet"
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              )}
            </View>

            {/* Secteur d’activité */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Secteur d’activité *</Text>
              <TouchableOpacity
                style={[
                  styles.selectInput,
                  validationErrors.sectorId && styles.inputError,
                ]}
                onPress={() => setSectorModalVisible(true)}
              >
                {sectorsLoading ? (
                  <Text style={{ color: "#999" }}>Chargement...</Text>
                ) : (
                  <Text style={{ color: formData.sectorId ? "#000" : "#999" }}>
                    {sectors.find((s) => s.id === formData.sectorId)?.name ||
                      "Sélectionnez"}
                  </Text>
                )}
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {validationErrors.sectorId && (
                <Text style={styles.errorText}>
                  {validationErrors.sectorId}
                </Text>
              )}
            </View>

            {/* Téléphone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(t) => updateField("phone", t)}
                placeholder="+237 6XX XX XX XX"
                keyboardType="phone-pad"
              />
            </View>

            {/* Adresse + Carte */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adresse complète *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.address && styles.inputError,
                ]}
                value={formData.address}
                onChangeText={(t) => updateField("address", t)}
                placeholder="Rue, quartier, ville"
              />
              {validationErrors.address && (
                <Text style={styles.errorText}>{validationErrors.address}</Text>
              )}
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => {
                  setTempMarker({
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                  });
                  setMapModalVisible(true);
                }}
              >
                <Feather name="map" size={20} color="#fff" />
                <Text style={styles.mapButtonText}>Modifier sur la carte</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  validationErrors.description && styles.inputError,
                ]}
                value={formData.description}
                onChangeText={(t) => updateField("description", t)}
                multiline
                textAlignVertical="top"
                placeholder="Spécialités, ambiance, plats signature..."
              />
              {validationErrors.description && (
                <Text style={styles.errorText}>
                  {validationErrors.description}
                </Text>
              )}
            </View>

            {/* Logo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Logo</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={() => pickImage("logo")}
              >
                {logoFile ? (
                  <Image
                    source={{ uri: logoFile.uri }}
                    style={styles.logoPreview}
                  />
                ) : business?.logoUrl ? (
                  <Image
                    source={{ uri: business.logoUrl }}
                    style={styles.logoPreview}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Feather name="camera" size={32} color="#999" />
                    <Text style={styles.imagePlaceholderText}>
                      Ajouter logo
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
                {coverFile ? (
                  <Image
                    source={{ uri: coverFile.uri }}
                    style={styles.coverPreview}
                  />
                ) : business?.coverImageUrl ? (
                  <Image
                    source={{ uri: business.coverImageUrl }}
                    style={styles.coverPreview}
                  />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Feather name="image" size={40} color="#999" />
                    <Text style={styles.coverPlaceholderText}>
                      Ajouter couverture
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Devise */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Devise principale *</Text>
              <TouchableOpacity
                style={[
                  styles.selectInput,
                  validationErrors.currencyId && styles.inputError,
                ]}
                onPress={() => setCurrencyModalVisible(true)}
              >
                <Text style={{ color: formData.currencyId ? "#000" : "#999" }}>
                  {currencies.find((c) => c.id === formData.currencyId)?.code ||
                    "Sélectionnez"}
                </Text>
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {validationErrors.currencyId && (
                <Text style={styles.errorText}>
                  {validationErrors.currencyId}
                </Text>
              )}
            </View>

            {/* Code postal */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Code postal</Text>
              <TextInput
                style={styles.input}
                value={formData.postalCode}
                onChangeText={(t) => updateField("postalCode", t)}
                placeholder="Ex: 75001"
              />
            </View>

            {/* Site web */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Site web (facultatif)</Text>
              <TextInput
                style={styles.input}
                value={formData.websiteUrl}
                onChangeText={(t) => updateField("websiteUrl", t)}
                placeholder="https://monrestaurant.com"
                keyboardType="url"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                Enregistrer les modifications
              </Text>
            )}
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
              {sectorsLoading ? (
                <View style={{ padding: 40, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              ) : (
                <FlatList
                  data={filteredSectors}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const handleSelectSector = () => {
                      updateField("sectorId", item.id);
                      setSectorModalVisible(false);
                      setSearchQuery("");
                    };

                    return (
                      <TouchableOpacity
                        style={[
                          styles.currencyItem,
                          formData.sectorId === item.id &&
                            styles.currencyItemSelected,
                        ]}
                        onPress={handleSelectSector}
                      >
                        <Text style={styles.currencyCode}>{item.name}</Text>
                        {formData.sectorId === item.id && (
                          <Feather name="check" size={24} color="#059669" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MODAL DEVISE */}
        <Modal visible={currencyModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCurrencyModalVisible(false)}
          >
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
                renderItem={({ item }) => {
                  const handleSelectCurrency = () => {
                    updateField("currencyId", item.id);
                    setCurrencyModalVisible(false);
                    setSearchQuery("");
                  };

                  return (
                    <TouchableOpacity
                      style={[
                        styles.currencyItem,
                        item.id === formData.currencyId &&
                          styles.currencyItemSelected,
                      ]}
                      onPress={handleSelectCurrency}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.currencyCode}>
                          {item.code} {item.symbol}
                        </Text>
                        <Text style={styles.currencyName}>{item.name}</Text>
                      </View>
                      {item.id === formData.currencyId && (
                        <Feather name="check" size={24} color="#059669" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MODAL CARTE */}
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
                  <ActivityIndicator size="small" color="#059669" />
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
                  keyExtractor={(_, i) => i.toString()}
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
                      <Feather name="map-pin" size={20} color="#059669" />
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
                latitude: tempMarker?.latitude || formData.latitude || 4.0511,
                longitude:
                  tempMarker?.longitude || formData.longitude || 9.7679,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(e) => {
                const c = e.nativeEvent.coordinate;
                setTempMarker(c);
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

            <View style={styles.mapBottomBar}>
              <View style={styles.previewContainer}>
                <Text style={styles.previewCoords}>
                  Lat: {(tempMarker?.latitude || formData.latitude).toFixed(6)}{" "}
                  | Lon:{" "}
                  {(tempMarker?.longitude || formData.longitude).toFixed(6)}
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
                    updateField("latitude", tempMarker.latitude);
                    updateField("longitude", tempMarker.longitude);
                  }
                  setMapModalVisible(false);
                }}
                disabled={!tempMarker}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
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
  title: { fontSize: 22, fontWeight: "700", color: "#111" },
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
  inputError: { borderColor: "#ef4444", borderWidth: 2 },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
  textArea: { height: 120 },
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#059669",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  mapButtonText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  imagePickerButton: { alignSelf: "center", marginTop: 12 },
  logoPreview: {
    width: 140,
    height: 140,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#059669",
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
  imagePlaceholderText: { marginTop: 8, color: "#999", fontSize: 14 },
  coverPickerButton: { marginTop: 12, borderRadius: 16, overflow: "hidden" },
  coverPreview: { width: "100%", height: 200, borderRadius: 16 },
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#059669",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  currencyItemSelected: { backgroundColor: "#f0fdf4" },
  currencyCode: { fontSize: 16, fontWeight: "bold", color: "#111" },
  currencyName: { fontSize: 14, color: "#666", marginTop: 2 },
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
    borderBottomColor: "#f0f0f0",
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

export default RestaurateurComponent;
