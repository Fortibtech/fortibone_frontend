// app/(professionnel)/business/edit-commercant/[id].tsx
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
import { router } from "expo-router";
import BackButtonWithClear from "@/components/Admin/BackButtonWithClear";
import { getAllSectores, Sector } from "@/api/sector/sectorApi";
type CommerceType = "PHYSICAL" | "ONLINE" | "HYBRID";
type SearchResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

interface Props {
  id: string;
}
const EditBusinessCommercant: React.FC<Props> = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  // Secteurs
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [sectorSearchQuery, setSectorSearchQuery] = useState("");

  // Modales
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [sectorModalVisible, setSectorModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  // Carte
  const [tempMarker, setTempMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [previewAddress, setPreviewAddress] = useState("");
  // Autres
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [biz, currencyList] = await Promise.all([
        BusinessesService.getBusinessById(id),
        CurrencyService.getCurrencies(),
      ]);

      setBusiness(biz);
      setCurrencies(currencyList);
      setPreviewAddress(biz.address || "");
      setTempMarker({
        latitude: biz.latitude || 4.0511,
        longitude: biz.longitude || 9.7679,
      });

      // Chargement des secteurs COMMERCANT
      await loadSectors(biz.sectorId);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les données du commerce");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadSectors = async (currentSectorId?: string) => {
    try {
      setSectorsLoading(true);
      const fetched = await getAllSectores("COMMERCANT");
      setSectors(fetched);

      if (currentSectorId) {
        const current = fetched.find((s: Sector) => s.id === currentSectorId);
        if (current) setSelectedSector(current);
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les secteurs d'activité");
    } finally {
      setSectorsLoading(false);
    }
  };

  const updateField = (updates: Partial<typeof business>) => {
    setBusiness((prev: any) => ({ ...prev, ...updates }));
  };

  const updateLocation = async (
    lat: number,
    lng: number,
    formattedAddress?: string
  ) => {
    updateField({ latitude: lat, longitude: lng });
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
      } catch (e) {}
    }

    if (finalAddress) {
      updateField({ address: finalAddress });
      setPreviewAddress(finalAddress);
    }
  };

  const pickImage = async (type: "logo" | "cover") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission refusée",
        "Veuillez autoriser l'accès à la galerie"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "logo" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      updateField(type === "logo" ? { logoUrl: uri } : { coverImageUrl: uri });
    }
  };

  const validateAndSave = async () => {
    const errors: Record<string, string> = {};
    if (!business.name?.trim()) errors.name = "Nom requis";
    if (!business.address?.trim()) errors.address = "Adresse requise";
    if (!business.description?.trim() || business.description.length < 20)
      errors.description = "Description d'au moins 20 caractères requise";
    if (!selectedSector && !business.sectorId)
      errors.sector = "Secteur d'activité requis";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const payload: any = {
        name: business.name.trim(),
        description: business.description.trim(),
        type: "COMMERCANT",
        address: business.address.trim(),
        latitude: Number(business.latitude),
        longitude: Number(business.longitude),
        postalCode: business.postalCode || null,
        siret: business.siret || null,
        websiteUrl: business.websiteUrl?.trim() || null,
        sectorId: selectedSector?.id || business.sectorId,
        commerceType: business.commerceType as CommerceType,
      };

      await BusinessesService.updateBusiness(id, payload);

      if (
        business.logoUrl?.startsWith("file://") ||
        business.logoUrl?.startsWith("content://")
      ) {
        await BusinessesService.uploadLogo(id, {
          uri: business.logoUrl,
          type: "image/jpeg",
          name: "logo.jpg",
        });
      }
      if (
        business.coverImageUrl?.startsWith("file://") ||
        business.coverImageUrl?.startsWith("content://")
      ) {
        await BusinessesService.uploadCover(id, {
          uri: business.coverImageUrl,
          type: "image/jpeg",
          name: "cover.jpg",
        });
      }

      Alert.alert("Succès", "Commerce mis à jour avec succès !", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const filteredSectors = sectors.filter(
    (s) =>
      s.name.toLowerCase().includes(sectorSearchQuery.toLowerCase()) ||
      (s.description &&
        s.description.toLowerCase().includes(sectorSearchQuery.toLowerCase()))
  );

  if (loading || !business) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#059669" />
        <Text style={{ marginTop: 16 }}>Chargement du commerce...</Text>
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
            <BackButtonWithClear />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Modifier mon commerce</Text>
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
                onChangeText={(t) => updateField({ name: t })}
                placeholder="ex: Boutique Marie"
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              )}
            </View>

            {/* Type de commerce (non modifiable) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type de commerce</Text>
              <View style={styles.radioGroup}>
                {(["PHYSICAL", "ONLINE", "HYBRID"] as CommerceType[]).map(
                  (type) => (
                    <View
                      key={type}
                      style={[
                        styles.radioItem,
                        business.commerceType === type &&
                          styles.radioItemSelected,
                        { opacity: 0.6 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          business.commerceType === type &&
                            styles.radioTextSelected,
                        ]}
                      >
                        {type === "PHYSICAL"
                          ? "Boutique physique"
                          : type === "ONLINE"
                          ? "En ligne uniquement"
                          : "Hybride"}
                      </Text>
                    </View>
                  )
                )}
              </View>
              <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Non modifiable après création
              </Text>
            </View>

            {/* Secteur d'activité */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Secteur d’activité *</Text>
              <TouchableOpacity
                style={[
                  styles.selectInput,
                  validationErrors.sector && styles.inputError,
                ]}
                onPress={() => setSectorModalVisible(true)}
              >
                <Text
                  style={{ color: selectedSector ? "#000" : "#999", flex: 1 }}
                >
                  {selectedSector?.name || "Sélectionnez votre secteur"}
                </Text>
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {validationErrors.sector && (
                <Text style={styles.errorText}>{validationErrors.sector}</Text>
              )}
            </View>

            {/* Adresse */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adresse complète *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.address && styles.inputError,
                ]}
                value={business.address}
                onChangeText={(t) => updateField({ address: t })}
                placeholder="Rue, quartier, ville"
              />
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setMapModalVisible(true)}
              >
                <Feather name="map" size={20} color="#fff" />
                <Text style={styles.mapButtonText}>Modifier sur la carte</Text>
              </TouchableOpacity>
              {validationErrors.address && (
                <Text style={styles.errorText}>{validationErrors.address}</Text>
              )}
            </View>

            {/* Code postal */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Code postal</Text>
              <TextInput
                style={styles.input}
                value={business.postalCode || ""}
                onChangeText={(t) => updateField({ postalCode: t })}
              />
            </View>

            {/* SIRET */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>SIRET (facultatif)</Text>
              <TextInput
                style={styles.input}
                value={business.siret || ""}
                onChangeText={(t) => updateField({ siret: t })}
              />
            </View>

            {/* Site web */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Site web (facultatif)</Text>
              <TextInput
                style={styles.input}
                value={business.websiteUrl || ""}
                onChangeText={(t) => updateField({ websiteUrl: t })}
                keyboardType="url"
              />
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
                value={business.description}
                onChangeText={(t) => updateField({ description: t })}
                multiline
                textAlignVertical="top"
                placeholder="Décrivez votre commerce, vos produits phares..."
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

        {/* Bouton sauvegarder */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={validateAndSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ==================== MODALE CARTE ==================== */}
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
                  placeholder="Rechercher un lieu..."
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
                        )}&limit=8`
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
                    } catch {
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
                      <Text style={styles.resultText}>
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
                const c = e.nativeEvent.coordinate;
                setTempMarker(c);
                updateLocation(c.latitude, c.longitude);
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
              <Text style={styles.previewAddressText} numberOfLines={2}>
                {previewAddress || "Positionnez le marqueur"}
              </Text>
              <TouchableOpacity
                style={styles.confirmMapButton}
                onPress={() => setMapModalVisible(false)}
              >
                <Text style={styles.confirmMapText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* ==================== MODALE SECTEURS ==================== */}
        <Modal visible={sectorModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlayFull}>
            <View style={styles.sectorModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Secteur d&apos;activité</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSectorModalVisible(false);
                    setSectorSearchQuery("");
                  }}
                >
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Feather
                  name="search"
                  size={22}
                  color="#999"
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  placeholder="Rechercher..."
                  value={sectorSearchQuery}
                  onChangeText={setSectorSearchQuery}
                  style={{ flex: 1, fontSize: 16 }}
                  autoFocus
                />
              </View>

              {sectorsLoading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              ) : (
                <FlatList
                  data={filteredSectors}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 30 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.sectorItem,
                        selectedSector?.id === item.id &&
                          styles.sectorItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedSector(item);
                        updateField({ sectorId: item.id });
                        setSectorModalVisible(false);
                        setSectorSearchQuery("");
                      }}
                    >
                      <View style={styles.sectorImageContainer}>
                        {item.imageUrl ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.sectorImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.sectorImage,
                              { backgroundColor: "#f0f0f0" },
                            ]}
                          >
                            <Feather name="image" size={28} color="#aaa" />
                          </View>
                        )}
                      </View>

                      <View style={styles.sectorTextContainer}>
                        <Text style={styles.sectorName}>{item.name}</Text>
                        {item.description && (
                          <Text
                            style={styles.sectorDescription}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        )}
                      </View>

                      {selectedSector?.id === item.id && (
                        <Feather name="check" size={28} color="#059669" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* ==================== MODALE DEVISE ==================== */}
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
                  value={currencySearchQuery}
                  onChangeText={setCurrencySearchQuery}
                  style={{ flex: 1 }}
                  autoFocus
                />
              </View>

              <FlatList
                data={currencies.filter(
                  (c) =>
                    c.code
                      .toLowerCase()
                      .includes(currencySearchQuery.toLowerCase()) ||
                    c.name
                      .toLowerCase()
                      .includes(currencySearchQuery.toLowerCase())
                )}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      item.id === business.currencyId &&
                        styles.currencyItemSelected,
                    ]}
                    onPress={() => {
                      updateField({ currencyId: item.id });
                      setCurrencyModalVisible(false);
                      setCurrencySearchQuery("");
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
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  title: { fontSize: 22, fontWeight: "700", color: "#111" },
  content: { paddingHorizontal: 20 },
  formGroup: { marginBottom: 24 },
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
  textArea: { height: 120 },
  counter: { fontSize: 12, color: "#666", marginTop: 4, alignSelf: "flex-end" },
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
    marginTop: 10,
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

  // Images
  imagePickerButton: { alignSelf: "center", marginTop: 12 },
  logoPreview: { width: 140, height: 140, borderRadius: 20 },
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
  },

  // Radio type commerce
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  radioItem: {
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 6,
    alignItems: "center",
  },
  radioItemSelected: { backgroundColor: "#e6f7f0", borderColor: "#059669" },
  radioText: { fontSize: 15, color: "#666", fontWeight: "600" },
  radioTextSelected: { color: "#059669", fontWeight: "700" },

  // Modale secteurs
  modalOverlayFull: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sectorModalContent: {
    backgroundColor: "#fff",
    height: "85%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalTitle: { fontSize: 19, fontWeight: "700", color: "#111" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sectorItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectorItemSelected: { backgroundColor: "#f0fdf4" },
  sectorImageContainer: { marginRight: 16 },
  sectorImage: { width: 56, height: 56, borderRadius: 12 },
  sectorTextContainer: { flex: 1 },
  sectorName: { fontSize: 16, fontWeight: "600", color: "#111" },
  sectorDescription: { fontSize: 14, color: "#666", marginTop: 4 },

  // Modale devise
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

  // Carte
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
  searchResultsFull: { backgroundColor: "#fff", maxHeight: 320 },
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
  previewAddressText: { fontSize: 15, color: "#333", marginBottom: 12 },
  confirmMapButton: {
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmMapText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default EditBusinessCommercant;
