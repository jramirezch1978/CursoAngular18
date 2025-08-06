export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  category: ProductCategory;
  stock: number;
  isAvailable: boolean;
  rating: number;
  reviews: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductCategory {
  CONSTRUCCION = 'construccion',
  HERRAMIENTAS = 'herramientas',
  MATERIALES = 'materiales',
  SEGURIDAD = 'seguridad',
  VEHICULOS = 'vehiculos'
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
  discount: number;
  finalTotal: number;
}
