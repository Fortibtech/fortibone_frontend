// App.tsx - Application Principale
import React, { useCallback, useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import des écrans
import { Catalog } from '@/components/catalogue/Catalogue';
import { ImportModel } from '@/components/catalogue/ImportModel';
import { ProductForm } from '@/components/catalogue/ProductForm';
import { ProductPreview } from '@/components/catalogue/ProductPreview';

// Import des types
import { NewProduct, Product, ScreenType } from '@/types/Product';

// Données initiales des produits
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'SONY Premium Wireless Headphones',
    price: 349.99,
    brand: 'SONY',
    model: 'Model: WH-1000XM4 Premium',
    image: '',
    description: 'High-quality wireless headphones with noise cancellation',
    city: 'Paris',
    isLiked: true
  },
  {
    id: '2',
    name: 'SONY Premium Wireless Headphones',
    price: 349.99,
    brand: 'SONY',
    model: 'Model: WH-1000XM4 Premium',
    image: '',
    description: 'High-quality wireless headphones with noise cancellation',
    city: 'Lyon',
    isLiked: false
  },
  {
    id: '3',
    name: 'APPLE AirPods Pro MagSafe Case',
    price: 179.00,
    brand: 'APPLE',
    model: 'Gen 2d, CL Wireless',
    image: '',
    description: 'Wireless earbuds with active noise cancellation',
    city: 'Marseille',
    isLiked: false
  },
  {
    id: '4',
    name: 'SAMSUNG Galaxy Buds 2 Pro',
    price: 119.99,
    originalPrice: 149.99,
    brand: 'SAMSUNG',
    model: 'R510, S, L Wireless',
    image: '',
    description: 'True wireless earbuds with premium sound',
    city: 'Toulouse',
    isLiked: false
  },
  {
    id: '5',
    name: 'SAMSUNG Galaxy Buds 2 Pro',
    price: 119.99,
    originalPrice: 149.99,
    brand: 'SAMSUNG',
    model: 'R510, S, L Wireless',
    image: '',
    description: 'True wireless earbuds with premium sound',
    city: 'Toulouse',
    isLiked: false
  },
  {
    id: '6',
    name: 'SAMSUNG Galaxy Buds 2 Pro',
    price: 119.99,
    originalPrice: 149.99,
    brand: 'SAMSUNG',
    model: 'R510, S, L Wireless',
    image: '',
    description: 'True wireless earbuds with premium sound',
    city: 'Toulouse',
    isLiked: false
  }
];

// Hook personnalisé pour la gestion des produits
const useProductManager = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const toggleLike = useCallback((productId: string) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId 
          ? { ...product, isLiked: !product.isLiked } 
          : product
      )
    );
  }, []);

  const addProduct = useCallback((newProductData: NewProduct): void => {
    const newProduct: Product = {
      id: `product_${Date.now()}`,
      name: newProductData.name,
      price: parseFloat(newProductData.price),
      brand: 'Custom',
      model: 'Paris usagé',
      image: newProductData.image || '',
      description: newProductData.description,
      city: newProductData.city,
      isLiked: false
    };
    
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== productId)
    );
  }, []);

  return {
    products,
    toggleLike,
    addProduct,
    removeProduct
  };
};

// Hook pour la navigation entre écrans
const useAppNavigation = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('catalog');
  const [navigationHistory, setNavigationHistory] = useState<ScreenType[]>(['catalog']);

  const navigateTo = useCallback((screen: ScreenType) => {
    setNavigationHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  }, []);

  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  }, [navigationHistory]);

  const resetNavigation = useCallback((screen: ScreenType = 'catalog') => {
    setNavigationHistory([screen]);
    setCurrentScreen(screen);
  }, []);

  return {
    currentScreen,
    navigateTo,
    goBack,
    resetNavigation,
    canGoBack: navigationHistory.length > 1,
    navigationHistory
  };
};

// Composant principal de l'application
const ProductCatalogApp: React.FC = () => {
  // État global de l'application
  const [newProductData, setNewProductData] = useState<NewProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Hooks personnalisés
  const { products, toggleLike, addProduct, removeProduct } = useProductManager();
  const { currentScreen, navigateTo, goBack, resetNavigation, canGoBack } = useAppNavigation();

  // Gestionnaires d'événements
  const handleStartAddProduct = useCallback(() => {
    setNewProductData(null);
    navigateTo('import');
  }, [navigateTo]);

  const handleContinueFromImport = useCallback(() => {
    navigateTo('form');
  }, [navigateTo]);

  const handleFormSubmit = useCallback((productData: NewProduct) => {
    setNewProductData(productData);
    navigateTo('preview');
  }, [navigateTo]);

  const handleConfirmAddProduct = useCallback(() => {
    if (!newProductData) {
      Alert.alert('Erreur', 'Aucune donnée de produit disponible');
      return;
    }

    setIsLoading(true);
    
    // Simulation d'une requête async
    setTimeout(() => {
      try {
        addProduct(newProductData);
        setNewProductData(null);
        setIsLoading(false);
        
        Alert.alert(
          'Succès', 
          'Produit ajouté avec succès!',
          [
            {
              text: 'OK',
              onPress: () => resetNavigation('catalog')
            }
          ]
        );
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
      }
    }, 1000);
  }, [newProductData, addProduct, resetNavigation]);

  const handleProductPress = useCallback((product: Product) => {
    console.log('Product selected:', product.name);
    // Ici vous pourriez naviguer vers un écran de détail
  }, []);

  const handleBackPress = useCallback(() => {
    if (canGoBack) {
      goBack();
    }
  }, [canGoBack, goBack]);

  // Rendu des écrans selon l'état de navigation
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'catalog':
        return (
          <Catalog
            products={products}
            onAddProduct={handleStartAddProduct}
            onToggleLike={toggleLike}
            onProductPress={handleProductPress}
            onBack={canGoBack ? handleBackPress : undefined}
          />
        );

      case 'import':
        return (
          <ImportModel
            onContinue={handleContinueFromImport}
            onBack={handleBackPress}
            uploadedFiles={[
              { id: '1', name: 'picture.png', size: '1kB', type: 'image' }
            ]}
          />
        );

      case 'form':
        return (
          <ProductForm
            onViewResult={handleFormSubmit}
            onBack={handleBackPress}
            initialData={newProductData || undefined}
          />
        );

      case 'preview':
        if (!newProductData) {
          // Fallback si les données sont perdues
          resetNavigation('catalog');
          return null;
        }
        
        return (
          <ProductPreview
            product={newProductData}
            onAdd={handleConfirmAddProduct}
            onBack={handleBackPress}
            isLoading={isLoading}
          />
        );

      default:
        // Écran par défaut en cas d'erreur
        resetNavigation('catalog');
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderCurrentScreen()}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default ProductCatalogApp;

// Export des hooks pour utilisation dans d'autres composants si nécessaire
export { useAppNavigation, useProductManager };
