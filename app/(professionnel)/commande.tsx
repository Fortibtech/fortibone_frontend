// screens/OrdersScreen.tsx
import { ChevronDown, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface pour les commandes
interface Order {
  id: string;
  productName: string;
  brand: string;
  price: number;
  orderId: string;
  stock: number;
  variant: number;
  image?: string;
  category: 'bag' | 'wallet' | 'backpack' | 'hat';
  isSelected?: boolean;
}

interface OrdersScreenProps {
  orders?: Order[];
  onOrderPress?: (order: Order) => void;
  onActionPress?: () => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

// Données d'exemple pour les commandes
const DEFAULT_ORDERS: Order[] = [
  {
    id: '1',
    productName: 'Salvo Togo Bag.',
    brand: 'Salvo',
    price: 88.00,
    orderId: '132456',
    stock: 98,
    variant: 2,
    category: 'bag',
    isSelected: false
  },
  {
    id: '2',
    productName: 'Flick Sling Bags.',
    brand: 'Flick',
    price: 59.00,
    orderId: '299880',
    stock: 34,
    variant: 4,
    category: 'bag',
    isSelected: false
  },
  {
    id: '3',
    productName: 'Spear Wallet.',
    brand: 'Spear',
    price: 9.00,
    orderId: '788898',
    stock: 12,
    variant: 5,
    category: 'wallet',
    isSelected: false
  },
  {
    id: '4',
    productName: 'Backpack Ridd.',
    brand: 'Marks ID',
    price: 250.00,
    orderId: '099878',
    stock: 13,
    variant: 1,
    category: 'backpack',
    isSelected: false
  },
  {
    id: '5',
    productName: 'Waist Bag Flash.',
    brand: 'Marks ID',
    price: 49.00,
    orderId: '099672',
    stock: 0,
    variant: 4,
    category: 'bag',
    isSelected: false
  },
  {
    id: '6',
    productName: 'Waist Bag Pacer.',
    brand: 'Pacer',
    price: 39.00,
    orderId: '111701',
    stock: 98,
    variant: 3,
    category: 'bag',
    isSelected: false
  },
  {
    id: '7',
    productName: 'Bucket Hat Nation',
    brand: 'DSVN',
    price: 9.00,
    orderId: '654321',
    stock: 25,
    variant: 2,
    category: 'hat',
    isSelected: false
  }
];

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ 
  orders = DEFAULT_ORDERS,
  onOrderPress,
  onActionPress,
  onSelectionChange 
}) => {
  const [searchText, setSearchText] = useState('');
  const [ordersList, setOrdersList] = useState<Order[]>(orders);
  const [showActions, setShowActions] = useState(false);

  // Filtrer les commandes selon la recherche
  const filteredOrders = ordersList.filter(order =>
    order.productName.toLowerCase().includes(searchText.toLowerCase()) ||
    order.brand.toLowerCase().includes(searchText.toLowerCase()) ||
    order.orderId.includes(searchText)
  );

  const selectedOrders = ordersList.filter(order => order.isSelected);
  const hasSelectedOrders = selectedOrders.length > 0;

  const handleSelectOrder = (orderId: string) => {
    const updatedOrders = ordersList.map(order =>
      order.id === orderId ? { ...order, isSelected: !order.isSelected } : order
    );
    setOrdersList(updatedOrders);
    
    const selectedIds = updatedOrders.filter(order => order.isSelected).map(order => order.id);
    onSelectionChange?.(selectedIds);
  };

  const handleSelectAll = () => {
    const allSelected = ordersList.every(order => order.isSelected);
    const updatedOrders = ordersList.map(order => ({ ...order, isSelected: !allSelected }));
    setOrdersList(updatedOrders);
    
    const selectedIds = !allSelected ? updatedOrders.map(order => order.id) : [];
    onSelectionChange?.(selectedIds);
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'edit' | 'duplicate') => {
    console.log(`Action ${action} sur ${selectedOrders.length} commandes`);
    setShowActions(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec recherche et action */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search style={styles.searchIcon}/>
            {/* <Text style={styles.searchIcon}>🔍</Text> */}
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowActions(!showActions)}
          >
            <Text style={styles.actionText}>Action</Text>
            <ChevronDown size={20} color={'gray'} fill={'gray'}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions en masse */}
      {hasSelectedOrders && (
        <View style={styles.bulkActionsContainer}>
          <Text style={styles.selectedCount}>
            {selectedOrders.length} commande{selectedOrders.length > 1 ? 's' : ''} sélectionnée{selectedOrders.length > 1 ? 's' : ''}
          </Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity 
              style={[styles.bulkActionBtn, styles.editBtn]}
              onPress={() => handleBulkAction('edit')}
            >
              <Text style={styles.bulkActionText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionBtn, styles.duplicateBtn]}
              onPress={() => handleBulkAction('duplicate')}
            >
              <Text style={styles.bulkActionText}>Dupliquer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionBtn, styles.exportBtn]}
              onPress={() => handleBulkAction('export')}
            >
              <Text style={styles.bulkActionText}>Exporter</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionBtn, styles.deleteBtn]}
              onPress={() => handleBulkAction('delete')}
            >
              <Text style={[styles.bulkActionText, styles.deleteText]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Actions dropdown */}
      {showActions && (
        <View style={styles.actionsDropdown}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleSelectAll}
          >
            <Text style={styles.actionItemText}>
              {ordersList.every(order => order.isSelected) ? 'Désélectionner tout' : 'Sélectionner tout'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={onActionPress}>
            <Text style={styles.actionItemText}>Trier par prix</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={onActionPress}>
            <Text style={styles.actionItemText}>Trier par stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={onActionPress}>
            <Text style={styles.actionItemText}>Filtrer par catégorie</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des commandes */}
      <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
        {filteredOrders.map((order) => (
          <OrderItem
            key={order.id}
            order={order}
            onPress={() => onOrderPress?.(order)}
            onSelect={() => handleSelectOrder(order.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Composant pour chaque item de commande
const OrderItem: React.FC<{ 
  order: Order; 
  onPress?: () => void;
  onSelect?: () => void;
}> = ({ order, onPress, onSelect }) => {
  
  const getProductIcon = (category: Order['category']) => {
    switch (category) {
      case 'bag':
        return '👜';
      case 'wallet':
        return '👛';
      case 'backpack':
        return '🎒';
      case 'hat':
        return '🧢';
      default:
        return '📦';
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { text: 'stock 0', color: '#EF4444' };
    } else if (stock < 20) {
      return { text: `stock ${stock}`, color: '#F59E0B' };
    } else {
      return { text: `stock ${stock}`, color: '#10B981' };
    }
  };

  const stockStatus = getStockStatus(order.stock);

  return (
    <View style={styles.orderItem}>
      {/* Checkbox */}
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={onSelect}
      >
        <View style={[
          styles.checkbox,
          order.isSelected && styles.checkboxSelected
        ]}>
          {order.isSelected && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Contenu de la commande */}
      <TouchableOpacity 
        style={styles.orderContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Icône du produit */}
        <View style={styles.productIcon}>
          <Text style={styles.productIconText}>
            {getProductIcon(order.category)}
          </Text>
        </View>

        {/* Informations du produit */}
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.productName}>{order.productName}</Text>
            <Text style={styles.orderPrice}>${order.price.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.brandName}>{order.brand}</Text>
          
          <View style={styles.orderDetails}>
            <Text style={styles.orderIdText}>ID {order.orderId}</Text>
            <Text style={[styles.stockText, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
            <Text style={styles.variantText}>VAR {order.variant}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Boutons d'actions individuelles */}
      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>⋯</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E2EA',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#92929D',
  },
  searchInput: {
    flex: 1,
    fontSize: 19,
    color: '#111827',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    // backgroundColor: '#F8F9FA',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 5
  },
  bulkActionsContainer: {
    backgroundColor: '#F0F9FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedCount: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
    marginBottom: 8,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  duplicateBtn: {
    backgroundColor: '#F0F9FF',
    borderColor: '#06B6D4',
  },
  exportBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  bulkActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  deleteText: {
    color: '#EF4444',
  },
  actionsDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionItemText: {
    fontSize: 14,
    color: '#374151',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  orderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productIconText: {
    fontSize: 20,
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  brandName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderIdText: {
    fontSize: 12,
    color: '#6B7280',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  variantText: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderActions: {
    marginLeft: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
});

export default OrdersScreen;