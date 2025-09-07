// src/types/product.ts
export interface Attribute {
  id: string;
  name: string;
  categoryId: string;
}

export interface AttributeValue {
  id: string;
  value: string;
  variantId: string;
  attributeId: string;
  attribute: Attribute;
}

export interface Variant {
  id: string;
  sku: string;
  barcode: string | null;
  price: string;
  purchasePrice: string;
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number;
  lotPrice: string;
  imageUrl: string;
  productId: string;
  attributeValues: AttributeValue[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  attributes: Attribute[];
}

export interface Products {
  id: string;
  name: string;
  description: string;
  salesUnit: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  businessId: string;
  categoryId: string;
  category: Category;
  variants: Variant[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  brand: string;
  model: string;
  image: string;
  description: string;
  city: string;
  isLiked: boolean;
}

export interface NewProduct {
  name: string;
  description: string;
  price: string;
  city: string;
  image?: string;
}

export interface FilterOptions {
  category?: string;
  brand?: string;
  priceRange?: string;
}

export type ScreenType = "catalog" | "import" | "form" | "preview";
