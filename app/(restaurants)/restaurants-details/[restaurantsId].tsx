import {
  getAvailableTables,
  getMenus,
  getTables,
  Menu,
  Table,
} from "@/api/restaurant";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

const RestaurantsId: React.FC = () => {
  const { restaurantsId } = useLocalSearchParams<{ restaurantsId: string }>();
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number>(90);
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const durationOptions = [
    { label: "30 minutes", value: 30 },
    { label: "60 minutes", value: 60 },
    { label: "90 minutes", value: 90 },
    { label: "120 minutes", value: 120 },
  ];

  const fetchData = async () => {
    if (!restaurantsId) return;
    setLoading(true);
    setError(null);
    try {
      const [menuData, tableData] = await Promise.all([
        getMenus(restaurantsId),
        date
          ? getAvailableTables(restaurantsId, date.toISOString(), duration)
          : getTables(restaurantsId),
      ]);
      setMenus(menuData);
      setTables(tableData);
    } catch (err: any) {
      console.error("❌ Error loading data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [restaurantsId]);

  const showDateTimePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            setDate(selectedDate);
          }
        },
        mode: "date",
        minimumDate: new Date(),
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  const handleFilter = () => {
    if (!date) {
      alert("Please select a date and time");
      return;
    }
    if (!duration || duration < 30 || duration > 180) {
      alert("Please select a duration between 30 and 180 minutes");
      return;
    }
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="sad-outline" size={40} color="#6b7280" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchData}
          accessibilityLabel="Retry loading data"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Compute sections directly without useMemo
  const sections = [
    {
      title: "Tables",
      icon: "cafe-outline",
      data:
        tables.length === 0
          ? [
              {
                id: "empty",
                label: "No tables",
                value: "No tables found",
                icon: "alert-circle-outline",
              },
            ]
          : tables.map((table) => ({
              id: table.id,
              label: table.name,
              value: `Capacity: ${table.capacity} | Available: ${
                table.isAvailable ? "✅ Yes" : "❌ No"
              }`,
              icon: table.isAvailable
                ? "checkmark-circle-outline"
                : "close-circle-outline",
            })),
    },
    {
      title: "Available Menus",
      icon: "restaurant-outline",
      data:
        menus.length === 0
          ? [
              {
                id: "empty",
                label: "No menus",
                value: "No menus found",
                icon: "alert-circle-outline",
              },
            ]
          : menus.map((menu) => ({
              id: menu.id,
              label: menu.name,
              value: `${menu.description} | Price: ${menu.price} FCFA`,
              icon: "fast-food-outline",
            })),
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back to previous page"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Ionicons
          name="restaurant-outline"
          size={28}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
          Restaurant
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchData}
          accessibilityLabel="Refresh data"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* FILTERS */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={showDateTimePicker}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#3b82f6"
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>
            {date.toLocaleString("en-US", {
              timeZone: "Africa/Lagos",
              dateStyle: "short",
              timeStyle: "short",
            })}
          </Text>
        </TouchableOpacity>
        <Picker
          selectedValue={duration}
          onValueChange={(value) => setDuration(value)}
          style={styles.picker}
        >
          {durationOptions.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.sectionCard}
          >
            <LinearGradient
              colors={["#ffffff", "#f8fafc"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.sectionHeader}>
              <Ionicons
                name={item.icon as string}
                size={20}
                color="#3b82f6"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>
            {item.data.map((dataItem) => (
              <View key={dataItem.id} style={styles.dataRow}>
                <Ionicons
                  name={dataItem.icon as string}
                  size={16}
                  color="#3b82f6"
                  style={styles.dataIcon}
                />
                <Text style={styles.dataLabel}>{dataItem.label}</Text>
                <Text style={styles.dataValue}>{dataItem.value}</Text>
              </View>
            ))}
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.errorText}>No data available</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* iOS Modal Picker */}
      {Platform.OS === "ios" && (
        <Modal visible={showIOSPicker} transparent animationType="slide">
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <View style={{ backgroundColor: "white", padding: 16 }}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setDate(selectedDate);
                  }
                  setShowIOSPicker(false);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowIOSPicker(false)}
                style={{
                  marginTop: 12,
                  alignItems: "center",
                  padding: 12,
                  backgroundColor: "#3b82f6",
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 12,
    marginRight: 12,
  },
  headerIcon: {
    marginRight: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  refreshButton: {
    padding: 12,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 8,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
  },
  picker: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  dataIcon: {
    marginRight: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    textAlign: "right",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RestaurantsId;
