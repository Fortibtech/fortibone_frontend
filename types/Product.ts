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
  
  export type ScreenType = 'catalog' | 'import' | 'form' | 'preview';