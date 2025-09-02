import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Nouvelle commande',
    message: 'Une commande a été passée chez Mon Super Étal.',
    timestamp: '2025-09-01 14:30',
  },
  {
    id: '2',
    title: 'Mise à jour',
    message: 'Votre profil a été mis à jour avec succès.',
    timestamp: '2025-08-31 09:15',
  },
  {
    id: '3',
    title: 'Promotion',
    message: 'Nouveau discount de 10% sur les produits frais !',
    timestamp: '2025-08-30 12:00',
  },
];

const Notifications: React.FC = () => {
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTimestamp}>{item.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune notification pour le moment.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerPlaceholder: {
    width: 28,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  notificationContent: {
    padding: 15,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#6b7280',
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Notifications;