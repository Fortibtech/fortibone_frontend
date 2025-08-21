// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { JSX } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Types
interface Enterprise {
  id: number;
  name: string;
  rating: number;
  category: string;
  image: string;
  discount?: string;
}

const enterprises: Enterprise[] = [
  {
    id: 1,
    name: 'Chococam',
    rating: 5.0,
    category: 'Alimentation',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
    discount: '50%'
  },
  {
    id: 2,
    name: 'Cappuccino',
    rating: 4.5,
    category: 'Alimentation',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200',
    discount: '45%'
  },
  {
    id: 3,
    name: 'Newbest',
    rating: 4.5,
    category: 'Localisation',
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200'
  },
  {
    id: 4,
    name: 'BlancheTech',
    rating: 4.8,
    category: 'Localisation',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200'
  }
];

const HomePage: React.FC = () => {
  const navigateToEnterpriseDetails = (enterpriseId: number): void => {
    router.push(`/(tabs)/enterprise-details?id=${enterpriseId}`);
  };

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}><Ionicons name="apps" size={24} color="#fff" />
      <View style={styles.headerLeft}>
        
        <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo/white.png")}
              style={[styles.bgImage, { top: 0, left: 0 }]}
            />
          <Text style={styles.logoText}>ForthOne</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = (): JSX.Element => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Recherche"
        placeholderTextColor="#999"
      />
    </View>
  );

  const renderPromoBanner = (): JSX.Element => (
    <View style={styles.bannerContainer}>
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Don't Miss Out!</Text>
          <Text style={styles.bannerSubtitle}>Discount up to 50%</Text>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Check Now</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bannerImageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=150' }}
            style={styles.bannerImage}
          />
        </View>
      </View>
    </View>
  );

  const renderEnterpriseCard = (enterprise: Enterprise): JSX.Element => (
    <TouchableOpacity 
      key={enterprise.id} 
      style={styles.gridItem}
      onPress={() => navigateToEnterpriseDetails(enterprise.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: enterprise.image }} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>{enterprise.name}</Text>
        <Text style={styles.gridCategory}>{enterprise.category}</Text>
        <View style={styles.gridFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{enterprise.rating}</Text>
          </View>
          {enterprise.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{enterprise.discount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00C851" barStyle="light-content" />
      
      {renderHeader()}
      {renderSearchBar()}
      {renderPromoBanner()}

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {enterprises.map(renderEnterpriseCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00C851',
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: 100,
    paddingTop: 30,
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
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  banner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
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
    backgroundColor: '#00C851',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#00C851',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerImageContainer: {
    width: 80,
    height: 80,
    marginLeft: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for tab bar
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gridContent: {
    padding: 14,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  gridCategory: {
    fontSize: 12,
    color: '#666',
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
    fontSize: 13,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
});

export default HomePage;