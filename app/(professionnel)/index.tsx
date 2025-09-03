// app/(tabs)/index.tsx
import GraphCard, { SalesData } from '@/components/GraphCard';
import Sidebar from '@/components/sidebar';
import SalesDashboard, { DashboardData } from '@/components/StatCard';
import AnalyticsDashboard, { AnalyticsData } from '@/components/yearSelector';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Bell } from "lucide-react-native";
import React, { JSX, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';

// Import des services API
import { Business, BusinessesService, SelectedBusinessManager } from '@/api';

// Types
interface Enterprise {
  id: number;
  name: string;
  rating: number;
  compare: string;
  discount?: Float
}

const enterprises: Enterprise[] = [
  {
    id: 1,
    name: 'Chiffre de vente',
    rating: 10289,
    compare: 'Compared to ($21340 last year)',
  },
  {
    id: 2,
    name: 'Nombre de clients',
    rating: 20921,
    compare: 'Compared to ($19000 last year)',
  },
  {
    id: 3,
    name: 'Commandes',
    rating: 149,
    compare: 'Compared to ($165 last year)',
  },
  {
    id: 4,
    name: 'Marketing',
    rating: 17390,
    compare: 'Compared to ($10500 last year)',
    discount: 2.5
  },
];

const HomePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Charger les entreprises depuis l'API
      const businessesResponse = await BusinessesService.getBusinesses({
        page: 1,
        limit: 50
      });
      setBusinesses(businessesResponse.data);
      
      // Vérifier si une entreprise est déjà sélectionnée
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(selected);
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const navigateToEnterpriseDetails = (enterpriseId: number): void => {
    router.push(`/enterprise-details?id=${enterpriseId}`);
  };

  const handleBusinessSelect = async (business: Business) => {
    try {
      console.log('Sélection de l\'entreprise:', business.name);
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);
      Alert.alert('Succès', `Entreprise "${business.name}" sélectionnée`);
    } catch (error) {
      console.error('Erreur lors de la sélection:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'entreprise');
    }
  };

  const sampleData: SalesData = {
    id: '1',
    title: 'Sales Chart',
    amount: '$27632',
    period: 'August',
    marketingData: [500, 520, 480, 600, 550, 450],
    casesData: [600, 580, 650, 750, 700, 580],
    months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  };

  const dashboardData: DashboardData = {
    hitRate: 68,
    deals: 76,
    visitors: 10254,
    visitorsChange: 1.5,
    onlineSales: [500, 800, 900, 750, 850, 950],
    offlineSales: [450, 780, 600, 500, 720, 480],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    year: '2017-2018'
  };

  const analyticsData: AnalyticsData = {
    year: 2017,
    totalVisitors: 22870,
    visitorsLabel: "Visitors this year",
    platforms: [
      { name: "Amazon", visitors: "2.1k", color: "#4F46E5", percentage: 25 },
      { name: "Alibaba", visitors: "1k", color: "#F97316", percentage: 15 },
      { name: "Ebay", visitors: "1.9k", color: "#10B981", percentage: 20 },
      { name: "Shopify", visitors: "15.7k", color: "#EAB308", percentage: 40 },
    ],
    topLocation: {
      country: "United States",
      flag: "🇺🇸",
      visitors: "19.870",
      description: "Our most customers in U"
    },
    salesCategories: [
      { name: "Massive", visitors: "15.7k", color: "#4F46E5", size: "massive" },
      { name: "Large", visitors: "4.9k", color: "#F97316", size: "large" },
      { name: "Medium", visitors: "2.4k", color: "#EAB308", size: "medium" },
      { name: "Small", visitors: "980", color: "#D1D5DB", size: "small" },
    ]
  };

  const handlePress = (id: string) => {
    console.log('Graph card pressed:', id);
  };

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
      <Sidebar 
        businesses={businesses} 
        selectedBusiness={selectedBusiness}
        onBusinessSelect={handleBusinessSelect} 
        loading={loading}
      />
      {renderSearchBar()}
      <TouchableOpacity style={styles.notificationButton}>
        <Bell size={30} color="black" />
      </TouchableOpacity>      
    </View>
  );

  const renderSearchBar = (): JSX.Element => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={25} color="gray" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher"
        placeholderTextColor="gray"
      />
    </View>
  );

  const renderSelectedBusinessBanner = (): JSX.Element | null => {
    if (!selectedBusiness) return null;

    return (
      <View style={styles.selectedBusinessBanner}>
        <View style={styles.bannerContent}>
          <Text style={styles.selectedBusinessTitle}>
            🏢 {selectedBusiness.name}
          </Text>
          <Text style={styles.selectedBusinessType}>
            {selectedBusiness.type}
          </Text>
          <Text style={styles.selectedBusinessAddress} numberOfLines={1}>
            📍 {selectedBusiness.address}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.changeBusiness}
          onPress={() => {
            // Ouvrir la sidebar pour changer d'entreprise
            Alert.alert(
              'Changer d\'entreprise',
              'Ouvrez le menu (☰) pour sélectionner une autre entreprise',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.changeBusinessText}>Changer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEnterpriseCard = (enterprise: Enterprise): JSX.Element => (
    <TouchableOpacity 
      key={enterprise.id} 
      style={styles.gridItem}
      onPress={() => navigateToEnterpriseDetails(enterprise.id)}
      activeOpacity={0.8}
    >
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>{enterprise.name}</Text>
        <Text style={styles.rating}>${enterprise.rating}</Text>
        <View style={styles.gridFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.gridCategory}>{enterprise.compare}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#00C851" barStyle="light-content" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00C851" barStyle="light-content" />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#059669']}
          />
        }
      >
        {renderSelectedBusinessBanner()}

        <View style={styles.headerSection2}>
          <Text style={styles.bannerTitle}>Mes infos</Text>
          {selectedBusiness && (
            <Text style={styles.businessCount}>
              {businesses.length} entreprise{businesses.length > 1 ? 's' : ''} disponible{businesses.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <View style={styles.grid}>
          {enterprises.map(renderEnterpriseCard)}
        </View>

        <GraphCard 
          salesData={sampleData} 
          onPress={handlePress}
        />

        <SalesDashboard data={dashboardData} />

        <AnalyticsDashboard data={analyticsData} />

      </ScrollView>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
    paddingRight: 20,
    alignItems: 'center',
    paddingTop: 10,
  },
  selectedBusinessBanner: {
    backgroundColor: '#e8f5e8',
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerContent: {
    flex: 1,
  },
  selectedBusinessTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 4,
  },
  selectedBusinessType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 2,
  },
  selectedBusinessAddress: {
    fontSize: 12,
    color: '#388e3c',
  },
  changeBusiness: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeBusinessText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  businessCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginLeft: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection:'row'
  },
  bgImage: { 
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 5,
    resizeMode: "contain",
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  notificationButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 48,
    width: '75%',
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
    color: 'gray'
  },
  searchInput: {
    flex: 1,
    fontSize: 20,
    color: 'gray',
    fontWeight: '400',
  },
  headerSection2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20
  },
  bannerContainer: {
    padding: 0,
    marginTop: 1,
  },
  banner: {
    borderRadius: 16,
    elevation: 1,
  },
  bannerBackground: {
    backgroundColor: 'white',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '400',
  },
  bannerButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '49%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  gridContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  gridCategory: {
    fontSize: 20,
    color: '#666',
    opacity: 0.5,
    marginBottom: 10,
    fontWeight: '400',
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 28,
    color: '#333',
    marginLeft: 4,
    fontWeight: '800',
    marginBottom: 10,
  },
  discountBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 80,
    width: 40,
    height:  40,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center'
  },
  discountText: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
  },
});

export default HomePage;