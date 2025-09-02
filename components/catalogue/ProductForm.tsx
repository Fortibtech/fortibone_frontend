// screens/ProductForm.tsx
import { CustomButton, CustomInput, Header } from '@/components/common/Header';
import { NewProduct } from '@/types/Product';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProductFormProps {
  onViewResult: (product: NewProduct) => void;
  onBack: () => void;
  initialData?: Partial<NewProduct>;
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
  onViewResult, 
  onBack,
  initialData 
}) => {
  const [formData, setFormData] = useState<NewProduct>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    city: initialData?.city || ''
  });

  const updateField = (field: keyof NewProduct) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est obligatoire');
      return false;
    }
    
    if (!formData.price.trim()) {
      Alert.alert('Erreur', 'Le prix est obligatoire');
      return false;
    }

    const priceNumber = parseFloat(formData.price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onViewResult(formData);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Ajouter un produit" 
        onBack={onBack}
      />

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <CustomInput
          label="Nom du produit"
          placeholder="Entrer le nom"
          value={formData.name}
          onChangeText={updateField('name')}
        />

        <CustomInput
          label="Description du produit"
          placeholder="Entrer la description"
          value={formData.description}
          onChangeText={updateField('description')}
          multiline
        />

        <CustomInput
          label="Prix"
          placeholder="Entrer le prix du produit"
          value={formData.price}
          onChangeText={updateField('price')}
          keyboardType="numeric"
        />

        <CustomInput
          label="Ville"
          placeholder="Entrer la ville"
          value={formData.city}
          onChangeText={updateField('city')}
        />

        <CustomButton
          title="Voir le résumé"
          onPress={handleSubmit}
          style={styles.resultButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  resultButton: {
    marginTop: 20,
    marginBottom: 20,
  },
});