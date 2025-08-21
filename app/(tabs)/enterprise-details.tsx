
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { JSX, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Types
interface Category {
  id: string;
  name: string;
}

interface BluetoothDevice {
  id: number;
  name: string;
  user: string;
  avatar: string;
  image: string;
  categoryId: string;
}

const categories: Category[] = [
  { id: 'all', name: 'Tout' },
  { id: 'phone', name: 'Téléphone' },
  { id: 'computer', name: 'Ordinateur' },
  { id: 'charger', name: 'Charger' },
];

const bluetoothDevices: BluetoothDevice[] = [
  {
    id: 1,
    name: 'Casque Bluetooth 3.0 USA',
    user: 'James Speaker',
    avatar: 'JS',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
    categoryId: 'phone'
  },
  {
    id: 2,
    name: 'Casque Bluetooth 3.0 USA',
    user: 'Ada Yolo',
    avatar: 'AY',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100',
    categoryId: 'phone'
  },
  {
    id: 3,
    name: 'Casque Bluetooth 3.0 USA',
    user: 'James Speaker',
    avatar: 'JS',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
    categoryId: 'computer'
  },
  {
    id: 4,
    name: 'Casque Bluetooth 3.0 USA',
    user: 'Ada Yolo',
    avatar: 'AY',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100',
    categoryId: 'charger'
  },
  {
    id: 5,
    name: 'Casque Bluetooth 3.0 USA',
    user: 'James Speaker',
    avatar: 'JS',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
    categoryId: 'phone'
  },
  {
    id: 6,
    name: 'Casque Bluetooth 3.0 USA',
    user: 'Ada Yolo',
    avatar: 'AY',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100',
    categoryId: 'computer'
  },
];

const EnterpriseDetailsPage: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const goBack = (): void => {
    router.back();
  };

  const filteredDevices: BluetoothDevice[] = activeCategory === 'all' 
    ? bluetoothDevices 
    : bluetoothDevices.filter(device => device.categoryId === activeCategory);

  const getAvatarColor = (name: string): string => {
    const colors: string[] = ['#00C851', '#FF5722', '#2196F3', '#9C27B0', '#FF9800'];
    const index: number = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Détails de l'entreprise</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderCategoryTabs = (): JSX.Element => (
    <View style={styles.tabContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {categories.map((category: Category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              activeCategory === category.id && styles.activeTab
            ]}
            onPress={() => setActiveCategory(category.id)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeCategory === category.id && styles.activeTabText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDeviceItem = (device: BluetoothDevice): JSX.Element => (
    <TouchableOpacity 
      key={device.id} 
      style={styles.deviceItem}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: device.image }} 
        style={styles.deviceImage} 
      />
      <View style={styles.deviceContent}>
        <Text style={styles.deviceTitle} numberOfLines={2}>
          {device.name}
        </Text>
        <View style={styles.userInfo}>
          <View style={[
            styles.avatar, 
            { backgroundColor: getAvatarColor(device.user) }
          ]}>
            <Text style={styles.avatarText}>{device.avatar}</Text>
          </View>
          <Text style={styles.userName}>{device.user}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDevicesList = (): JSX.Element => (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.devicesList}>
        {filteredDevices.map(renderDeviceItem)}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {renderHeader()}
      {renderCategoryTabs()}
      {renderDevicesList()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabScrollContent: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E8E9ED',
  },
  activeTab: {
    backgroundColor: '#00C851',
    borderColor: '#00C851',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  devicesList: {
    paddingHorizontal: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5F6FA',
    marginRight: 14,
  },
  deviceContent: {
    flex: 1,
  },
  deviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00C851',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default EnterpriseDetailsPage;