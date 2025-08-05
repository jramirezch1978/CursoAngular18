/**
 * Interfaz para el modelo de Producto
 * Representa los materiales y equipos de PROVIAS
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  inStock: boolean;
  discount: number;
  rating: number;
  featured: boolean;
  supplier: string;
  specifications: ProductSpecification[];
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export type ProductCategory = 
  | 'materiales'
  | 'equipos'
  | 'herramientas'
  | 'seguridad'
  | 'vehiculos'
  | 'tecnologia';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
}