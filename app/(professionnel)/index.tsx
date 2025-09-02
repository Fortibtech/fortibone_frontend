// app/(tabs)/index.tsx
import GraphCard, { SalesData } from '@/components/GraphCard';
import Sidebar from '@/components/sidebar';
import SalesDashboard, { DashboardData } from '@/components/StatCard';
import AnalyticsDashboard, { AnalyticsData } from '@/components/yearSelector';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Bell } from "lucide-react-native";
import React, { JSX } from 'react';
import {
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

// Types
interface Enterprise {
  id: number;
  name: string;
  rating: number;
  compare: string;
  discount?: Float
}

interface Business {
  name: string;
  description: string;
  type: string;
  address: string;
  phoneNumber: string;
  logoUrl: string;
  coverImageUrl: string;
  latitude: number;
  longitude: number;
  currencyId: string;
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

const businesses: Business[] = [
  {
    name: "Mon Super Étal",
    description: "Le meilleur endroit pour trouver des produits frais et locaux.",
    type: "COMMERCANT",
    address: "123 Rue Principale, 75001 Paris, France",
    phoneNumber: "+33123456789",
    logoUrl: require("@/assets/images/catalogue.png"),
    coverImageUrl: "https://example.com/cover.jpg",
    latitude: 48.8566,
    longitude: 2.3522,
    currencyId: "clw9a1b2c0000d4t6efgh1234"
  },
  {
    name: "Mon Super Étal",
    description: "Le meilleur endroit pour trouver des produits frais et locaux.",
    type: "COMMERCANT",
    address: "123 Rue Principale, 75001 Paris, France",
    phoneNumber: "+33123456789",
    logoUrl: require("@/assets/images/entreprise1.png"),
    coverImageUrl: "https://example.com/cover.jpg",
    latitude: 48.8566,
    longitude: 2.3522,
    currencyId: "clw9a1b2c0000d4t6efgh1234"
  },
  {
    name: "Mon Super Étal",
    description: "Le meilleur endroit pour trouver des produits frais et locaux.",
    type: "COMMERCANT",
    address: "123 Rue Principale, 75001 Paris, France",
    phoneNumber: "+33123456789",
    logoUrl: require("@/assets/images/entreprise2.png"),
    coverImageUrl: "https://example.com/cover.jpg",
    latitude: 48.8566,
    longitude: 2.3522,
    currencyId: "clw9a1b2c0000d4t6efgh1234"
  },
];

const HomePage: React.FC = () => {
  const navigateToEnterpriseDetails = (enterpriseId: number): void => {
    router.push(`/enterprise-details?id=${enterpriseId}`);
  };

  const handleBusinessSelect = (business: Business) => {
    console.log('Selected business:', business.name);
    // Add navigation or other logic here
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
        <Sidebar businesses={businesses} onBusinessSelect={handleBusinessSelect} />
            {renderSearchBar()}
        <TouchableOpacity style={styles.notificationButton}>
            <Bell size={30} color="black" />
        </TouchableOpacity>      
    </View>
  );

  const renderSearchBar = (): JSX.Element => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={25} color="white" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher"
        placeholderTextColor="gray"
      />
    </View>
  );

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
            {/* <Ionicons name="star" size={14} color="#FFD700" /> */}
            <Text style={styles.gridCategory}>{enterprise.compare} </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00C851" barStyle="light-content" />
      
      {renderHeader()}
      

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection2}>
            <Text style={styles.bannerTitle}>Mes infos</Text>
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
    width: 20, // largeur de l'image
    height: 20, // hauteur de l'image
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
    // backgroundColor: '#047D58',
    marginHorizontal: 20,
    // marginTop: 16,
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
    paddingVertical: 20
  },
  bannerContainer: {
    padding: 0,
    marginTop: 1,
  },
  banner: {
    borderRadius: 16,
    // color: 'gray',
    elevation: 1,
  },
  
  bannerBackground: {
    backgroundColor: 'white', // Couleur du bas (verte)
  },
 
  bannerContent: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 30,
    // width: 300,
    // height: 150
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
    // paddingBottom: 20, // Space for tab bar
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
    // paddingHorizontal: 0,
    // paddingVertical: 0,
    borderRadius: 80,
    width: 40,
    height:  40,
    flexDirection: 'column',
    // flex: 0.01,
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