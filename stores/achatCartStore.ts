// stores/useProCartStore.ts (ou achatCartStore.ts)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProductVariant } from "@/api";

export interface ProCartItem {
  id: string;
  productId: string;
  productName: string;
  variant: ProductVariant;
  quantity: number;
  imageUrl?: string | null;
  addedAt: number;
  supplierBusinessId: string; // Toujours requis
}

interface ProCartStore {
  items: ProCartItem[];

  addItem: (
    productId: string,
    productName: string,
    variant: ProductVariant,
    quantity?: number,
    imageUrl?: string,
    supplierBusinessId: string
  ) => void;

  removeItem: (
    productId: string,
    variantId: string,
    supplierBusinessId: string
  ) => void;

  updateQuantity: (
    productId: string,
    variantId: string,
    supplierBusinessId: string,
    quantity: number
  ) => void;

  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// ID stable même si supplierBusinessId est vide
const generateId = (
  productId: string,
  variantId: string,
  supplierBusinessId: string
) => `${productId}-${variantId}-${supplierBusinessId || "no-supplier"}`;

export const useProCartStore = create<ProCartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (
        productId,
        productName,
        variant,
        quantity = 1,
        imageUrl,
        supplierBusinessId
      ) => {
        // Protection : si pas de supplier, on met une valeur par défaut
        const safeSupplierId = supplierBusinessId || "no-supplier";
        const variantId = variant.id || "no-variant";
        const id = generateId(productId, variantId, safeSupplierId);

        set((state) => {
          const existing = state.items.find((i) => i.id === id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id,
                productId,
                productName,
                variant,
                quantity,
                imageUrl: imageUrl ?? variant.imageUrl ?? null,
                addedAt: Date.now(),
                supplierBusinessId: safeSupplierId,
              },
            ],
          };
        });
      },

      removeItem: (productId, variantId, supplierBusinessId) => {
        const safeSupplierId = supplierBusinessId || "no-supplier";
        const id = generateId(productId, variantId, safeSupplierId);

        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (productId, variantId, supplierBusinessId, quantity) => {
        const safeSupplierId = supplierBusinessId || "no-supplier";
        const id = generateId(productId, variantId, safeSupplierId);

        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.id !== id),
            };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        const items = get().items;
        return items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getTotalPrice: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
          const price = Number(item.variant.price) || 0;
          return sum + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: "pro-cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
