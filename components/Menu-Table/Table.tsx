import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getTables, Table as TableType } from "@/api/menu/tableApi";

const Table = ({ restaurantsId }: { restaurantsId: string }) => {
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const data = await getTables(restaurantsId);
        setTables(data);
      } catch (err) {
        setError("Impossible de charger les tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [restaurantsId]);

  const handleReserve = () => {
    Alert.alert(
      "En conception",
      "La fonctionnalité de réservation est en cours de développement."
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (tables.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Aucune table disponible</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tables}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View
          style={[
            styles.tableCard,
            !item.isAvailable && styles.tableUnavailable,
          ]}
        >
          <Text style={styles.tableName}>{item.name}</Text>
          <Text style={styles.tableCapacity}>{item.capacity} places</Text>
          <Text
            style={[
              styles.tableStatus,
              item.isAvailable ? styles.available : styles.unavailable,
            ]}
          >
            {item.isAvailable ? "Disponible" : "Indisponible"}
          </Text>

          {item.isAvailable && (
            <TouchableOpacity
              style={styles.reserveButton}
              onPress={handleReserve}
            >
              <Text style={styles.reserveButtonText}>Réserver</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  tableCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableUnavailable: {
    opacity: 0.5,
  },
  tableName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121f3e",
  },
  tableCapacity: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  tableStatus: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  available: {
    color: "#059669",
  },
  unavailable: {
    color: "#dc2626",
  },
  reserveButton: {
    marginTop: 10,
    backgroundColor: "#059669",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
});

export default Table;
