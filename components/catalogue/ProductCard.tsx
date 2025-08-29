// components/ProductCard.tsx
import { Product } from '@/types/Product';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  product: Product;
  onToggleLike: (id: string) => void;
  onPress?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onToggleLike, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => onPress?.(product)}
      activeOpacity={0.8}
    >
      
      <View style={styles.productImageContainer}>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => onToggleLike(product.id)}
        >
          {product.isLiked 
            ? (
              <Heart size={20} color={'black'} fill={'black'} />
            ) 
            : (
              <Heart size={20} />
            )
          }
        </TouchableOpacity>
        <Image
        source={require('@/assets/images/catalogue3.jpg')}
        
        style={[
          styles.productImage, 
        ]} />
      </View>
      
      <View >
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
          )}
        </View>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productModel} numberOfLines={1}>
          {product.model}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  likeButton: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 15,
    top: 10,
    right: 10,
    zIndex: 1,
  },
  heart: {
    fontSize: 20,
    color: '#CED4DA',
  },
  heartLiked: {
    color: '#DC3545',
  },
  productImageContainer: {
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 16,
  },
  productImage: {
    width: 150,
    height: 170,
    borderRadius: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  originalPrice: {
    fontSize: 14,
    color: '#6C757D',
    textDecorationLine: 'line-through',
  },
  productName: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    // textAlign: 'center',
    marginBottom: 2,
  },
  productModel: {
    fontSize: 12,
    color: '#6C757D',
    // textAlign: 'center',
  },
});