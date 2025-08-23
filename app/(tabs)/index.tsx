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
import Svg, { Polygon } from 'react-native-svg';

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
    rating: 50,
    category: 'Alimentation',
    image: require("@/assets/images/entreprise1.png"),
    discount: '50%'
  },
  {
    id: 2,
    name: 'Cappuccino',
    rating: 45,
    category: 'Alimentation',
    image: require("@/assets/images/entreprise2.png"),
    discount: '45%'
  },
  {
    id: 3,
    name: 'Newbest',
    rating: 45,
    category: 'Localisation',
    image: require("@/assets/images/entreprise3.png")
  },
  {
    id: 4,
    name: 'BlancheTech',
    rating: 48,
    category: 'Localisation',
    image: require("@/assets/images/entreprise2.png")
  },
  // {
  //   id: 5,
  //   name: 'Chococam',
  //   rating: 50,
  //   category: 'Alimentation',
  //   image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
  //   discount: '50%'
  // },
  // {
  //   id: 6,
  //   name: 'Cappuccino',
  //   rating: 45,
  //   category: 'Alimentation',
  //   image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200',
  //   discount: '45%'
  // },
  // {
  //   id: 7,
  //   name: 'Newbest',
  //   rating: 45,
  //   category: 'Localisation',
  //   image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200'
  // },
  // {
  //   id: 8,
  //   name: 'BlancheTech',
  //   rating: 48,
  //   category: 'Localisation',
  //   image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200'
  // }
];

const HomePage: React.FC = () => {
  const navigateToEnterpriseDetails = (enterpriseId: number): void => {
    router.push(`/enterprise-details?id=${enterpriseId}`);
  };

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
    <View style={styles.header2}><Ionicons name="grid-outline" size={24} color="#fff" />
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
        <Ionicons name="cart-outline" size={24} color="#fff" />
      </TouchableOpacity>
      </View>
      {renderSearchBar()}
    </View>
  );

  const renderSearchBar = (): JSX.Element => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="white" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Recherche"
        placeholderTextColor="white"
      />
    </View>
  );

  const renderPromoBanner = (): JSX.Element => (
    <View style={styles.bannerContainer}>
      <View style={styles.banner}>
        {/* Fond de base (couleur du bas) */}
        <View style={styles.bannerBackground} />
        
        {/* Forme SVG pour la division oblique */}
        <Svg
          height="100%"
          width="90%"
          style={styles.svgOverlay}
          viewBox="10 0 100 80"
          preserveAspectRatio="none"
        >
          {/* Polygone pour la section du haut (forme oblique) */}
          <Polygon
            points="0,0 100,0 65,90 0,90"
            fill="#FFF9CD"
          />
        </Svg>
        
        {/* Contenu par-dessus */}
        <View style={styles.bannerContentWrapper}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Don't Miss Out!</Text>
            <Text style={styles.bannerSubtitle}>Discount up to 50%</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Check Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerImageContainer}>
            <Image 
              source={require("@/assets/images/Image.png")}
              style={styles.bannerImage}
            />
          </View>
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
      <Image source={enterprise.image} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>{enterprise.name}</Text>
        <Text style={styles.gridCategory}>{enterprise.category}</Text>
        <View style={styles.gridFooter}>
          <View style={styles.ratingContainer}>
            {/* <Ionicons name="star" size={14} color="#FFD700" /> */}
            <Text style={styles.rating}>{enterprise.rating} k</Text>
          </View>
            <View style={styles.discountBadge}>
              <Ionicons name='add' style={styles.discountText} />
            </View>
          
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00C851" barStyle="light-content" />
      
      {renderHeader()}
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
    backgroundColor: '#059669',
    height: 300,
  },
  header2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
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
    backgroundColor: '#047D58',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 10,
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
    position: 'relative',
    padding: 20,
    marginTop: -140,
  },
  banner: {
    borderRadius: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 170,
    overflow: 'hidden',
  },
  
  bannerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white', // Couleur du bas (verte)
  },
  
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  
  bannerContentWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
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
    shadowColor: '#059669',
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
    width: 200,
    height: 150,
    marginRight: -40,
    marginTop: 80,
  },
  
  bannerImage: {
    width: '80%',
    height: '80%',
    borderRadius: 20,
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
    width: '45%',
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16
  },
  gridContent: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 1,
  },
  gridCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 1,
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
    fontWeight: '800',
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