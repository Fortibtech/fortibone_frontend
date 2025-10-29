/**
 * Register.tsx - Inscription + Création automatique d'entreprise (PRO)
 *
 * Utilise les mêmes composants, styles et logique que createBusiness.tsx
 * - MapPicker (Leaflet WebView)
 * - IOSPicker (modale iOS-style avec recherche)
 * - Upload logo/cover
 * - Géolocalisation + saisie manuelle
 * - Chargement des devises
 * - Commentaires détaillés
 */

import { registerUser } from "@/api/authService";
import BackButton from "@/components/BackButton";
import { useUserStore } from "@/store/userStore";
import { RegisterPayload } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

// --- API Business ---
import {
  BusinessesService,
  CreateBusinessData,
  Currency,
  CurrencyService,
} from "@/api";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- Types ---
interface UserFormData {
  prenom: string;
  nom: string;
  sexe: string;
  pays: string;
  ville: string;
  dateNaissance: string;
  email: string;
  motDePasse: string;
  phoneNumber: string;
  profileType: "PARTICULIER" | "PRO";
}

interface BusinessFormData extends Partial<CreateBusinessData> {
  commerceType?: "PHYSICAL" | "ONLINE";
  logoUri?: string;
  coverUri?: string;
  activitySector: string;
  siret?: string;
  websiteUrl?: string;
}

// --- MapPicker (identique à createBusiness) ---
interface MapPickerProps {
  initialLatitude: number;
  initialLongitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Autorisez la localisation.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newLoc = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setSelectedLocation(newLoc);
      webViewRef.current?.injectJavaScript(
        `moveToLocation(${newLoc.latitude}, ${newLoc.longitude}); true;`
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer la position.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation.latitude, selectedLocation.longitude);
    setModalVisible(false);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "locationSelected") {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {}
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body, #map { height:100vh; width:100vw; }
        .custom-marker { width:40px; height:40px; display:flex; align-items:center; justify-content:center; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${initialLatitude}, ${initialLongitude}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        const icon = L.divIcon({ className: 'custom-marker', html: '<svg width="32" height="32" viewBox="0 0 24 24" fill="#059669"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#fff"></circle></svg>', iconSize: [32,32], iconAnchor: [16,32] });
        let marker = L.marker([${initialLatitude}, ${initialLongitude}], { icon, draggable: true }).addTo(map);
        function send(lat, lng) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'locationSelected', latitude: lat, longitude: lng })); }
        marker.on('dragend', e => { const p = marker.getLatLng(); send(p.lat, p.lng); });
        map.on('click', e => { marker.setLatLng(e.latlng); send(e.latlng.lat, e.latlng.lng); });
        function moveToLocation(lat, lng) { marker.setLatLng([lat, lng]); map.setView([lat, lng], 15); send(lat, lng); }
        send(${initialLatitude}, ${initialLongitude});
      </script>
    </body>
    </html>
  `;

  return (
    <>
      <TouchableOpacity
        style={styles.mapPickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="map" size={20} color="#059669" />
        <Text style={styles.mapPickerButtonText}>
          Sélectionner sur la carte
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelButton}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Position</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.modalDoneButton}>Confirmer</Text>
            </TouchableOpacity>
          </View>

          <WebView
            ref={webViewRef}
            source={{ html: mapHTML }}
            style={{ flex: 1 }}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
          />

          <View style={styles.mapInfoContainer}>
            <View style={styles.coordinatesDisplay}>
              <Text style={styles.coordinatesLabel}>Coordonnées</Text>
              <Text style={styles.coordinatesText}>
                Lat: {selectedLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinatesText}>
                Lng: {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <>
                  <Ionicons name="locate" size={20} color="#059669" />
                  <Text style={styles.currentLocationButtonText}>
                    Ma position
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

// --- IOSPicker (identique à createBusiness) ---
interface IOSPickerProps {
  title: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
}

const IOSPicker: React.FC<IOSPickerProps> = ({
  title,
  options,
  selectedValue,
  onValueChange,
  placeholder = "Sélectionner...",
  searchable = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const selectedOption = options.find((o) => o.value === selectedValue);
  const filtered =
    searchable && searchText
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchText.toLowerCase())
        )
      : options;

  return (
    <>
      <TouchableOpacity
        style={styles.iosPickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.iosPickerText,
            !selectedOption && styles.iosPickerPlaceholder,
          ]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelButton}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalDoneButton}>OK</Text>
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedValue === item.value && styles.selectedOptionItem,
                ]}
                onPress={() => {
                  onValueChange(item.value);
                  setModalVisible(false);
                  setSearchText("");
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedValue === item.value && styles.selectedOptionText,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <Ionicons name="checkmark" size={24} color="#059669" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun résultat</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

// --- Register Screen ---
const Register: React.FC = () => {
  // --- États ---
  const [userData, setUserData] = useState<UserFormData>({
    prenom: "",
    nom: "",
    sexe: "",
    pays: "",
    ville: "",
    dateNaissance: "",
    email: "",
    motDePasse: "",
    phoneNumber: "",
    profileType: "PARTICULIER",
  });

  const [businessData, setBusinessData] = useState<BusinessFormData>({
    name: "",
    description: "",
    type: "COMMERCANT",
    address: "",
    phoneNumber: "",
    latitude: 4.0511,
    longitude: 9.7679,
    commerceType: "PHYSICAL",
    activitySector: "",
    siret: "",
    websiteUrl: "",
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showProfileTypeModal, setShowProfileTypeModal] = useState(false);
  const [profileType, setProfileType] = useState<
    "particulier" | "professionnel"
  >("particulier");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Charger devises ---
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCurrencies(true);
        const data = await CurrencyService.getCurrencies();
        setCurrencies(data);
        const xaf = data.find((c) => c.code === "XAF");
        if (xaf) setBusinessData((prev) => ({ ...prev, currencyId: xaf.id }));
      } catch (e) {
        Alert.alert("Erreur", "Impossible de charger les devises");
      } finally {
        setLoadingCurrencies(false);
      }
    };
    load();
  }, []);

  // --- Charger profil sauvegardé ---
  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem("userProfile");
      if (stored === "particulier" || stored === "professionnel") {
        setProfileType(stored);
        setUserData((prev) => ({
          ...prev,
          profileType: stored === "particulier" ? "PARTICULIER" : "PRO",
        }));
      }
    };
    load();
  }, []);

  // --- Handlers ---
  const updateUser = (field: keyof UserFormData, value: string) =>
    setUserData((prev) => ({ ...prev, [field]: value }));
  const updateBusiness = (field: keyof BusinessFormData, value: any) =>
    setBusinessData((prev) => ({ ...prev, [field]: value }));

  const pickImage = async (field: "logoUri" | "coverUri") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission refusée", "Accès à la galerie requis.");
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: field === "logoUri" ? [1, 1] : [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri)
      updateBusiness(field, result.assets[0].uri);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    updateUser("dateNaissance", `${d}/${m}/${y}`);
  };

  // --- Validation ---
  const isFormValid = () => {
    const userOk =
      Object.values(userData).every((v) => v.trim() !== "") && selectedDate;
    const passOk =
      userData.motDePasse.length >= 8 &&
      /[A-Z]/.test(userData.motDePasse) &&
      /[a-z]/.test(userData.motDePasse) &&
      /\d/.test(userData.motDePasse);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email);
    const businessOk =
      profileType !== "professionnel" ||
      (businessData.name &&
        businessData.address &&
        businessData.activitySector &&
        businessData.commerceType &&
        businessData.currencyId &&
        businessData.latitude &&
        businessData.longitude);
    return userOk && passOk && emailOk && businessOk;
  };

  // --- Inscription + Création entreprise ---
  const handleRegister = async () => {
    if (!isFormValid())
      return Alert.alert(
        "Erreur",
        "Veuillez remplir tous les champs obligatoires."
      );

    const payload: RegisterPayload = {
      firstName: userData.prenom.trim(),
      lastName: userData.nom.trim(),
      gender: userData.sexe === "Masculin" ? "MALE" : "FEMALE",
      profileType: userData.profileType,
      country: userData.pays.trim(),
      city: userData.ville.trim(),
      dateOfBirth: selectedDate!.toISOString().split("T")[0],
      email: userData.email.trim(),
      password: userData.motDePasse,
      phoneNumber: userData.phoneNumber.trim(),
    };

    try {
      setLoading(true);
      const userResult = await registerUser(payload);
      if (!userResult.success) throw new Error(userResult.message);
      useUserStore.getState().setEmail(payload.email);

      await AsyncStorage.setItem("userProfile", profileType);
      setProfileType(profileType);

      if (userData.profileType === "PRO") {
        const businessPayload: CreateBusinessData = {
          name: businessData.name!,
          description: businessData.description || "",
          type: businessData.type!,
          address: businessData.address!,
          phoneNumber: userData.phoneNumber,
          latitude: businessData.latitude!,
          longitude: businessData.longitude!,
          currencyId: businessData.currencyId!,
          siret: businessData.siret,
          websiteUrl: businessData.websiteUrl,
          activitySector: businessData.activitySector!,
        };

        const newBusiness = await BusinessesService.createBusiness(
          businessPayload
        );

        if (businessData.logoUri) {
          await BusinessesService.uploadLogo(newBusiness.id, {
            uri: businessData.logoUri,
            type: "image/jpeg",
            name: "logo.jpg",
          } as any);
        }
        if (businessData.coverUri) {
          await BusinessesService.uploadCover(newBusiness.id, {
            uri: businessData.coverUri,
            type: "image/jpeg",
            name: "cover.jpg",
          } as any);
        }

        await BusinessesService.selectBusiness(newBusiness);
      }

      Alert.alert("Succès", "Compte créé avec succès !", [
        { text: "OK", onPress: () => router.push("/(auth)/OtpScreen") },
      ]);
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // --- Rendu ---
  if (loadingCurrencies) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des devises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Créer un compte</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* --- Section Entreprise (PRO) --- */}
            {profileType === "professionnel" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations entreprise</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nom de l&lsquo;entreprise *</Text>
                  <TextInput
                    style={styles.input}
                    value={businessData.name}
                    onChangeText={(t) => updateBusiness("name", t)}
                    placeholder="Mon Étal"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={businessData.description}
                    onChangeText={(t) => updateBusiness("description", t)}
                    placeholder="Décrivez votre activité..."
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Type de commerce *</Text>
                  <IOSPicker
                    title="Type"
                    options={[
                      { label: "Boutique physique", value: "PHYSICAL" },
                      { label: "Boutique en ligne", value: "ONLINE" },
                    ]}
                    selectedValue={businessData.commerceType || ""}
                    onValueChange={(v) =>
                      updateBusiness("commerceType", v as "PHYSICAL" | "ONLINE")
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Adresse *</Text>
                  <TextInput
                    style={styles.input}
                    value={businessData.address}
                    onChangeText={(t) => updateBusiness("address", t)}
                    placeholder="123 Rue Principale"
                    multiline
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>SIRET (optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    value={businessData.siret}
                    onChangeText={(t) => updateBusiness("siret", t)}
                    placeholder="123456789"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Site web (optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    value={businessData.websiteUrl}
                    onChangeText={(t) => updateBusiness("websiteUrl", t)}
                    placeholder="https://..."
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Secteur d&lsquo;activité *</Text>
                  <TextInput
                    style={styles.input}
                    value={businessData.activitySector}
                    onChangeText={(t) => updateBusiness("activitySector", t)}
                    placeholder="Vente, restauration..."
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Devise *</Text>
                  <IOSPicker
                    title="Devise"
                    options={currencies.map((c) => ({
                      label: `${c.name} (${c.code}) ${c.symbol}`,
                      value: c.id,
                    }))}
                    selectedValue={businessData.currencyId || ""}
                    onValueChange={(v) => updateBusiness("currencyId", v)}
                    searchable
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Position géographique *</Text>
                  <MapPicker
                    initialLatitude={businessData.latitude!}
                    initialLongitude={businessData.longitude!}
                    onLocationSelect={(lat, lng) => {
                      updateBusiness("latitude", lat);
                      updateBusiness("longitude", lng);
                    }}
                  />
                  <View style={styles.currentCoordinates}>
                    <View style={styles.coordinateDisplay}>
                      <Text style={styles.coordinateLabel}>Latitude:</Text>
                      <Text style={styles.coordinateValue}>
                        {businessData.latitude?.toFixed(6) || "—"}
                      </Text>
                    </View>
                    <View style={styles.coordinateDisplay}>
                      <Text style={styles.coordinateLabel}>Longitude:</Text>
                      <Text style={styles.coordinateValue}>
                        {businessData.longitude?.toFixed(6) || "—"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.imageSection}>
                  <Text style={styles.label}>Logo</Text>
                  <TouchableOpacity
                    style={styles.imagePicker}
                    onPress={() => pickImage("logoUri")}
                  >
                    {businessData.logoUri ? (
                      <Image
                        source={{ uri: businessData.logoUri }}
                        style={styles.imagePreview}
                      />
                    ) : (
                      <Text style={styles.imagePickerText}>
                        Ajouter un logo
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.imageSection}>
                  <Text style={styles.label}>Image de couverture</Text>
                  <TouchableOpacity
                    style={[styles.imagePicker, styles.coverImagePicker]}
                    onPress={() => pickImage("coverUri")}
                  >
                    {businessData.coverUri ? (
                      <Image
                        source={{ uri: businessData.coverUri }}
                        style={styles.imagePreview}
                      />
                    ) : (
                      <Text style={styles.imagePickerText}>
                        Ajouter une couverture
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* --- Section Utilisateur --- */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput
                  style={styles.input}
                  value={userData.prenom}
                  onChangeText={(t) => updateUser("prenom", t)}
                  placeholder="Prénom"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={styles.input}
                  value={userData.nom}
                  onChangeText={(t) => updateUser("nom", t)}
                  placeholder="Nom"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Sexe *</Text>
                <TouchableOpacity
                  style={styles.iosPickerButton}
                  onPress={() => setShowGenderModal(true)}
                >
                  <Text
                    style={[
                      styles.iosPickerText,
                      !userData.sexe && styles.iosPickerPlaceholder,
                    ]}
                  >
                    {userData.sexe || "Sélectionner"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type de profil *</Text>
                <TouchableOpacity
                  style={styles.iosPickerButton}
                  onPress={() => setShowProfileTypeModal(true)}
                >
                  <Text
                    style={[
                      styles.iosPickerText,
                      !userData.profileType && styles.iosPickerPlaceholder,
                    ]}
                  >
                    {userData.profileType === "PARTICULIER"
                      ? "Particulier"
                      : "Professionnel"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Pays *</Text>
                <TextInput
                  style={styles.input}
                  value={userData.pays}
                  onChangeText={(t) => updateUser("pays", t)}
                  placeholder="France"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ville *</Text>
                <TextInput
                  style={styles.input}
                  value={userData.ville}
                  onChangeText={(t) => updateUser("ville", t)}
                  placeholder="Paris"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Téléphone *</Text>
                <TextInput
                  style={styles.input}
                  value={userData.phoneNumber}
                  onChangeText={(t) => updateUser("phoneNumber", t)}
                  placeholder="+33612345678"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date de naissance *</Text>
                <TouchableOpacity
                  style={styles.iosPickerButton}
                  onPress={() => setShowDateModal(true)}
                >
                  <Text
                    style={[
                      styles.iosPickerText,
                      !userData.dateNaissance && styles.iosPickerPlaceholder,
                    ]}
                  >
                    {userData.dateNaissance || "jj/mm/aaaa"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={userData.email}
                  onChangeText={(t) => updateUser("email", t)}
                  placeholder="email@exemple.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Mot de passe *</Text>
                <TextInput
                  style={styles.input}
                  value={userData.motDePasse}
                  onChangeText={(t) => updateUser("motDePasse", t)}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Text style={styles.passwordInfo}>
                  8 caractères min. • Majuscule • Minuscule • Chiffre
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.submitButtonText}>
                    Création en cours...
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Créer le compte</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* --- Modales --- */}
        <Modal visible={showGenderModal} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                <Text style={styles.modalCancelButton}>Annuler</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Sexe</Text>
              <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                <Text style={styles.modalDoneButton}>OK</Text>
              </TouchableOpacity>
            </View>
            {["Masculin", "Féminin"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.optionItem,
                  userData.sexe === g && styles.selectedOptionItem,
                ]}
                onPress={() => {
                  updateUser("sexe", g);
                  setShowGenderModal(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    userData.sexe === g && styles.selectedOptionText,
                  ]}
                >
                  {g}
                </Text>
                {userData.sexe === g && (
                  <Ionicons name="checkmark" size={24} color="#059669" />
                )}
              </TouchableOpacity>
            ))}
          </SafeAreaView>
        </Modal>

        <Modal visible={showProfileTypeModal} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowProfileTypeModal(false)}>
                <Text style={styles.modalCancelButton}>Annuler</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Type de profil</Text>
              <TouchableOpacity onPress={() => setShowProfileTypeModal(false)}>
                <Text style={styles.modalDoneButton}>OK</Text>
              </TouchableOpacity>
            </View>
            {[
              {
                label: "Particulier",
                value: "PARTICULIER",
                type: "particulier",
              },
              { label: "Professionnel", value: "PRO", type: "professionnel" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionItem,
                  userData.profileType === opt.value &&
                    styles.selectedOptionItem,
                ]}
                onPress={() => {
                  updateUser("profileType", opt.value as "PARTICULIER" | "PRO");
                  setProfileType(opt.type as "particulier" | "professionnel");
                  setShowProfileTypeModal(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    userData.profileType === opt.value &&
                      styles.selectedOptionText,
                  ]}
                >
                  {opt.label}
                </Text>
                {userData.profileType === opt.value && (
                  <Ionicons name="checkmark" size={24} color="#059669" />
                )}
              </TouchableOpacity>
            ))}
          </SafeAreaView>
        </Modal>

        {showDateModal && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(e, d) => {
              if (Platform.OS === "android") setShowDateModal(false);
              if (d) handleDateSelect(d);
            }}
            maximumDate={new Date()}
            style={Platform.OS === "ios" ? { marginTop: 20 } : {}}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// --- Styles (100% identiques à createBusiness) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafb" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 16, color: "#6b7280" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  headerPlaceholder: { width: 28 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  formContainer: { marginTop: 20 },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 20,
  },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#1f2937", marginBottom: 8 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  iosPickerButton: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
  },
  iosPickerText: { fontSize: 16, color: "#1f2937" },
  iosPickerPlaceholder: { color: "#9ca3af" },
  mapPickerButton: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  mapPickerButtonText: { fontSize: 16, fontWeight: "600", color: "#059669" },
  currentCoordinates: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  coordinateDisplay: { flex: 1 },
  coordinateLabel: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  coordinateValue: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  imageSection: { marginBottom: 20 },
  imagePicker: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    overflow: "hidden",
    position: "relative",
  },
  coverImagePicker: { height: 150 },
  imagePreview: { width: "100%", height: "100%" },
  imagePickerText: { fontSize: 16, color: "#6b7280", fontWeight: "600" },
  passwordInfo: { fontSize: 12, color: "#6b7280", marginTop: 8 },
  submitButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  mapModalContainer: { flex: 1, backgroundColor: "#ffffff" },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalContainer: { flex: 1, backgroundColor: "#fafafb" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1f2937" },
  modalCancelButton: { fontSize: 16, color: "#6b7280" },
  modalDoneButton: { fontSize: 16, color: "#059669", fontWeight: "600" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#1f2937", paddingVertical: 12 },
  optionItem: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedOptionItem: { backgroundColor: "#f0f9ff" },
  optionText: { fontSize: 16, color: "#1f2937", flex: 1 },
  selectedOptionText: { color: "#059669", fontWeight: "600" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 16, color: "#6b7280", textAlign: "center" },
  mapInfoContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  coordinatesDisplay: { marginBottom: 12 },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  coordinatesText: { fontSize: 15, color: "#1f2937" },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#059669",
    gap: 8,
  },
  currentLocationButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#059669",
  },
});

export default Register;
