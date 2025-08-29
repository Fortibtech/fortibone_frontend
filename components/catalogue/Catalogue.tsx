// screens/CatalogScreen.tsx
import { CustomButtonAdd, Header } from '@/components/common/Header';
import { Product } from '@/types/Product';
import { ChevronDown, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from './ProductCard';

interface CatalogProps {
  products: Product[];
  onAddProduct: () => void;
  onToggleLike: (id: string) => void;
  onProductPress?: (product: Product) => void;
  onBack?: () => void;
}

export const Catalog: React.FC<CatalogProps> = ({ 
  products, 
  onAddProduct, 
  onToggleLike, 
  onProductPress,
  onBack 
}) => {

  const data = [
    { key: '1', title: 'Category' },
    { key: '2', title: 'Brand' },
    { key: '3', title: 'Price' },
    { key: '4', title: 'Price' },
    { key: '5', title: 'Price' },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Mon Catalogue" 
        onBack={onBack}
        showSearch={true}
        onSearch={() => console.log('Search pressed')}
      />

      {/* Filtres */}
      
        <View style={styles.filtersContainer}>
          <View style={styles.filterButton} >
            <SlidersHorizontal size={15} />
          </View>
          <FlatList
            horizontal
            data={data}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <FilterButton title={item.title} />
            )}
            keyExtractor={item => item.key}
          />
        </View>
      

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Text style={styles.productCount}>Liste de produits</Text>
        <CustomButtonAdd
          title="Ajouter un produit"
          onPress={onAddProduct}
          style={styles.addButton}
        />
      </View>

      {/* Grille de produits */}
      <ScrollView style={styles.productsGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.productsRow}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleLike={onToggleLike}
              onPress={onProductPress}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Composant interne pour les filtres
const FilterButton: React.FC<{ title: string; onPress?: () => void }> = ({ 
  title, 
  onPress 
}) => {
  return (
    <TouchableOpacity style={styles.filterButton} onPress={onPress}>
      <Text style={styles.filterText}>{title}</Text>
      <ChevronDown size={26} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    overflow:'hidden'
    // height: 40
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    margin: 4,
    paddingHorizontal: 20,
    paddingVertical: 10 ,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterText: {
    fontSize: 14,
    color: '#495057',
    marginRight: 5
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productCount: {
    fontSize: 14,
    color: 'gray',
    fontWeight: '400'
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  productsGrid: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});