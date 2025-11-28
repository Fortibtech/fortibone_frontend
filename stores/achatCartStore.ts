// stores/useProCartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProductVariant } from "@/api";

export interface ProCartItem {
  id: string; // clé unique : `${productId}-${variantId}-${supplierBusinessId}`
  productId: string;
  productName: string;
  variant: ProductVariant;
  quantity: number;
  imageUrl?: string | null;
  addedAt: number;
  supplierBusinessId: string;
}

interface ProCartStore {
  items: ProCartItem[];

  addItem: (
    productId: string,
    productName: string,
    variant: ProductVariant,
    quantity?: number,
    imageUrl?: string,
    supplierBusinessId?: string
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

const generateId = (
  productId: string,
  variantId: string,
  supplierBusinessId?: string
) => `${productId}-${variantId}-${supplierBusinessId}`;

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
        const id = generateId(productId, variant.id, supplierBusinessId);

        set((state: any) => {
          const existing = state.items.find((i:any) => i.id === id);

          if (existing) {
            return {
              items: state.items.map((i:any) =>
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
                supplierBusinessId,
              },
            ],
          };
        });
      },

      removeItem: (productId, variantId, supplierBusinessId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => i.id !== generateId(productId, variantId, supplierBusinessId)
          ),
        })),

      updateQuantity: (productId, variantId, supplierBusinessId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) =>
                  i.id !== generateId(productId, variantId, supplierBusinessId)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.id === generateId(productId, variantId, supplierBusinessId)
                ? { ...i, quantity }
                : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = Number(item.variant.price) || 0;
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: "pro-cart-storage",
      storage: createJSONStorage(() => AsyncStorage), // Plus de warning !
    }
  )
);
