// screens/ProductPreviewScreen.tsx
import { CustomButton, Header } from '@/components/common/Header';
import { NewProduct } from '@/types/Product';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProductPreviewProps {
  product: NewProduct;
  onAdd: () => void;
  onBack: () => void;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({ 
  product, 
  onAdd, 
  onBack 
}) => {
  const defaultDescription = "The technology with two noise sensors and two microphones on each cup detects ambient noise and sends the data to the HD noise minimization processor QNI. Using a new algorithm, the QNI then processes and minimizes noise on different acoustic environments in real time. Together with a new Bluetooth Audio SoC";

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Ajouter un produit" 
        onBack={onBack}
      />

      <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
        <ProductImage />
        
        <ProductInfo product={product} />
        
        <ProductDescription 
          description={product.description || defaultDescription}
        />

        <CustomButton
          title="Ajouter"
          onPress={onAdd}
          style={styles.addButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Composant pour l'image du produit
const ProductImage: React.FC = () => {
  return (
    <View style={styles.previewImageContainer}>
      <Image
        source={require('@/assets/images/catalogue3.jpg')}
        style={styles.previewImage} 
      />
    </View>
  );
};

// Composant pour les informations du produit
const ProductInfo: React.FC<{ product: NewProduct }> = ({ product }) => {
  return (
    <View style={styles.previewInfo}>
      <Text style={styles.previewPrice}>${product.price}</Text>
      <Text style={styles.previewName}>{product.name}</Text>
      {product.city && (
        <Text style={styles.previewCity}>{product.city}</Text>
      )}
    </View>
  );
};

// Composant pour la description du produit
const ProductDescription: React.FC<{ description: string }> = ({ description }) => {
  return (
    <Text style={styles.previewDescription}>
      {description}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewImageContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  previewImage: {
    width: '110%',
    height: '110%',
    backgroundColor: '#2C3E50',
    borderRadius: 20,
  },
  previewInfo: {
    // alignItems: 'center',
    marginBottom: 20,
  },
  previewPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  previewName: {
    fontSize: 25,
    color: '#000000',
    // textAlign: 'center',
    marginBottom: 4,
  },
  previewCity: {
    fontSize: 12,
    color: '#6C757D',
  },
  previewDescription: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 30,
    textAlign: 'justify',
  },
  addButton: {
    marginBottom: 20,
  },
});