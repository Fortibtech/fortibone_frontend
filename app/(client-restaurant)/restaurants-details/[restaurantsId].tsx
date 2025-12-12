// app/(app)/restaurants/[restaurantsId]/index.tsx   (ou où tu l'as placé)
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { format } from "date-fns";
import { getAvailableTables, Table } from "@/api/restaurant";
import { getMenus, Menu } from "@/api/menu/menuApi";

const RestaurantsId: React.FC = () => {
  const { restaurantsId } = useLocalSearchParams<{ restaurantsId: string }>();
  const router = useRouter();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number>(90);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const durationOptions = [30, 60, 90, 120];

  const fetchData = async () => {
    if (!restaurantsId) return;
    setLoading(true);
    try {
      const [menuData, tableData] = await Promise.all([
        getMenus(restaurantsId),
        getAvailableTables(restaurantsId, date.toISOString(), duration),
      ]);
      setMenus(menuData);
      setTables(tableData);
    } catch (err) {
      console.error("Erreur chargement restaurant :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [restaurantsId, date, duration]);

  const formatDate = (d: Date) => format(d, "EEE d MMM yyyy • HH:mm");

  const handleDatePress = () => setShowDatePicker(true);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00af66" />
        <Text style={styles.loadingText}>Chargement du restaurant...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choisir une table</Text>
          <TouchableOpacity onPress={fetchData}>
            <Ionicons name="refresh" size={26} color="#00af66" />
          </TouchableOpacity>
        </Animated.View>

        {/* Filtres */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.filterBar}
        >
          <Pressable onPress={handleDatePress} style={styles.datePickerBtn}>
            <Ionicons name="calendar-outline" size={22} color="#00af66" />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Ionicons name="chevron-down" size={18} color="#999" />
          </Pressable>

          <View style={styles.durationRow}>
            {durationOptions.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDuration(d)}
                style={[
                  styles.durationChip,
                  duration === d && styles.durationChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === d && styles.durationTextActive,
                  ]}
                >
                  {d} min
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Tables disponibles */}
          <Animated.View entering={FadeInUp.delay(100)}>
            <Text style={styles.sectionTitle}>Tables disponibles</Text>

            {tables.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>
                  Aucune table disponible pour ces critères
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {tables.map((table, i) => (
                  <Animated.View
                    key={table.id}
                    entering={FadeInUp.delay(80 * i)}
                    style={styles.tableCard}
                  >
                    <View style={styles.tableLeft}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: table.isAvailable
                              ? "#00af66"
                              : "#ef4444",
                          },
                        ]}
                      />
                      <View>
                        <Text style={styles.tableName}>{table.name}</Text>
                        <Text style={styles.tableInfo}>
                          {table.capacity} pers. •{" "}
                          {table.location || "Salle principale"}
                        </Text>
                      </View>
                    </View>

                    {table.isAvailable ? (
                      <TouchableOpacity style={styles.reserveBtn}>
                        <Text style={styles.reserveBtnText}>Réserver</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.unavailableText}>Indisponible</Text>
                    )}
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* NOUVEAU : Menus disponibles – 100% cohérent avec admin */}
          <Animated.View
            entering={FadeInUp.delay(300)}
            style={styles.sectionMargin}
          >
            <Text style={styles.sectionTitle}>Nos Menus & Formules</Text>

            {menus.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="restaurant-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>
                  Aucun menu disponible pour le moment
                </Text>
              </View>
            ) : (
              <View style={styles.menuList}>
                {menus.map((menu, i) => (
                  <Animated.View
                    key={menu.id}
                    entering={FadeInUp.delay(80 * i + 100)}
                    style={styles.menuCardClient}
                  >
                    {/* Image en haut */}
                    <View style={styles.menuImageWrapper}>
                      {menu.imageUrl ? (
                        <Image
                          source={{ uri: menu.imageUrl }}
                          style={styles.menuImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.menuImagePlaceholder}>
                          <Ionicons
                            name="restaurant"
                            size={60}
                            color="#E0E0E0"
                          />
                        </View>
                      )}
                    </View>

                    {/* Contenu */}
                    <View style={styles.menuCardContent}>
                      <Text style={styles.menuCardTitle}>{menu.name}</Text>

                      {menu.description ? (
                        <Text
                          style={styles.menuCardDescription}
                          numberOfLines={3}
                        >
                          {menu.description}
                        </Text>
                      ) : (
                        <Text style={styles.menuCardNoDesc}>
                          Formule complète
                        </Text>
                      )}

                      <Text style={styles.menuCardPrice}>
                        {Number(menu.price).toLocaleString("fr-FR")} FCFA
                      </Text>

                      {/* Badge si désactivé */}
                      {menu.isActive === false && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>
                            Bientôt disponible
                          </Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </View>

      {/* DateTimePicker */}
      {Platform.OS === "android"
        ? showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )
        : showDatePicker && (
            <Modal transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Date et heure</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Ionicons name="close" size={26} color="#999" />
                    </TouchableOpacity>
                  </View>

                  <DateTimePicker
                    value={date}
                    mode="datetime"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                  />

                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.modalConfirmText}>Confirmer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#333" },

  filterBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  dateText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  durationRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 30,
  },
  durationChipActive: { backgroundColor: "#00af66" },
  durationText: { fontSize: 14, color: "#666", fontWeight: "600" },
  durationTextActive: { color: "#fff" },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  sectionMargin: { marginTop: 40 },
  list: { gap: 14 },

  // Tables
  tableCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tableLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  tableName: { fontSize: 17, fontWeight: "600", color: "#333" },
  tableInfo: { fontSize: 14, color: "#888", marginTop: 4 },
  reserveBtn: {
    backgroundColor: "#00af66",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reserveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  unavailableText: { color: "#ef4444", fontWeight: "600", fontSize: 15 },

  // Menus – NOUVEAU DESIGN (identique admin)
  menuList: { gap: 18 },
  menuCardClient: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  menuImageWrapper: { height: 180, backgroundColor: "#F8F9FA" },
  menuImage: { width: "100%", height: "100%" },
  menuImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  menuCardContent: { padding: 18 },
  menuCardTitle: { fontSize: 19, fontWeight: "700", color: "#1F2937" },
  menuCardDescription: {
    fontSize: 14.5,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 20,
  },
  menuCardNoDesc: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 8,
  },
  menuCardPrice: {
    fontSize: 23,
    fontWeight: "800",
    color: "#00af66",
    marginTop: 12,
  },
  inactiveBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  inactiveBadgeText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },

  // États vides
  emptyCard: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },

  // Modal DatePicker iOS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "90%",
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  modalConfirmBtn: {
    backgroundColor: "#00af66",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  modalConfirmText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});

export default RestaurantsId;
