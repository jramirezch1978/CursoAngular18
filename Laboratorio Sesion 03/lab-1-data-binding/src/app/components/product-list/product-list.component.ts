import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { Product, CartItem, CartSummary, ProductCategory } from '../../models/product.interface';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  // 🎯 Propiedades para Data Binding
  searchTerm = '';
  selectedCategory: ProductCategory | 'all' = 'all';
  minPrice = 0;
  maxPrice = 10000;
  showOnlyInStock = false;
  sortBy: 'name' | 'price' | 'rating' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // 📊 Estados de la aplicación
  isLoading = false;
  viewMode: 'grid' | 'list' = 'grid';
  currentPage = 1;
  itemsPerPage = 8;

  // 🛍️ Datos de productos (simulando API de PROVIAS)
  products: Product[] = [
    {
      id: 1,
      name: 'Cemento Portland Tipo I',
      description: 'Cemento de alta calidad para construcción de infraestructura vial. Ideal para obras de pavimentación y estructuras de concreto.',
      price: 28.50,
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
      category: 'materiales',
      inStock: true,
      discount: 10,
      rating: 4.5,
      featured: true,
      supplier: 'UNACEM S.A.A.',
      specifications: [
        { name: 'Peso', value: '42.5', unit: 'kg' },
        { name: 'Resistencia', value: '420', unit: 'kg/cm²' },
        { name: 'Norma', value: 'NTP 334.009' }
      ]
    },
    {
      id: 2,
      name: 'Excavadora Caterpillar 320D',
      description: 'Excavadora hidráulica de última generación para movimiento de tierras en proyectos viales. Potente y eficiente.',
      price: 8500.00,
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
      category: 'equipos',
      inStock: true,
      discount: 5,
      rating: 4.8,
      featured: true,
      supplier: 'Ferreyros S.A.',
      specifications: [
        { name: 'Potencia', value: '145', unit: 'HP' },
        { name: 'Peso', value: '20.5', unit: 'ton' },
        { name: 'Alcance', value: '9.2', unit: 'm' }
      ]
    },
    {
      id: 3,
      name: 'Asfalto Líquido RC-250',
      description: 'Asfalto de curado rápido para imprimación y riegos de liga en pavimentos flexibles. Cumple especificaciones técnicas.',
      price: 1250.00,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      category: 'materiales',
      inStock: false,
      discount: 0,
      rating: 4.2,
      featured: false,
      supplier: 'Refinería La Pampilla',
      specifications: [
        { name: 'Viscosidad', value: '250', unit: 'cSt' },
        { name: 'Penetración', value: '120-300', unit: 'dmm' },
        { name: 'Destilado', value: '45-70', unit: '%' }
      ]
    },
    {
      id: 4,
      name: 'Casco de Seguridad ANSI Z89.1',
      description: 'Casco de protección personal certificado para obras de construcción vial. Resistente a impactos y penetración.',
      price: 45.00,
      image: 'https://images.unsplash.com/photo-1581092795442-8d8d9a9a1b2d?w=400',
      category: 'seguridad',
      inStock: true,
      discount: 15,
      rating: 4.6,
      featured: false,
      supplier: '3M Perú S.A.',
      specifications: [
        { name: 'Material', value: 'Polietileno', unit: '' },
        { name: 'Certificación', value: 'ANSI Z89.1', unit: '' },
        { name: 'Colores', value: 'Blanco, Amarillo, Azul', unit: '' }
      ]
    },
    {
      id: 5,
      name: 'Compactadora Vibrátoria CP533E',
      description: 'Rodillo compactador vibratorio para compactación de suelos y asfalto. Ideal para mantenimiento vial.',
      price: 12800.00,
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400',
      category: 'equipos',
      inStock: true,
      discount: 8,
      rating: 4.7,
      featured: true,
      supplier: 'CASE Construction',
      specifications: [
        { name: 'Peso', value: '5.2', unit: 'ton' },
        { name: 'Ancho', value: '1.68', unit: 'm' },
        { name: 'Frecuencia', value: '70', unit: 'Hz' }
      ]
    },
    {
      id: 6,
      name: 'GPS Trimble R10',
      description: 'Receptor GNSS de precisión para levantamientos topográficos y control de calidad en obras viales.',
      price: 18500.00,
      image: 'https://images.unsplash.com/photo-1572098392491-f1a06d3b32c6?w=400',
      category: 'tecnologia',
      inStock: true,
      discount: 12,
      rating: 4.9,
      featured: true,
      supplier: 'Trimble Perú',
      specifications: [
        { name: 'Precisión', value: '1', unit: 'cm' },
        { name: 'Canales', value: '440', unit: '' },
        { name: 'Autonomía', value: '7', unit: 'hrs' }
      ]
    }
  ];

  // 🧮 Productos filtrados (computed property simulado)
  filteredProducts: Product[] = [];

  // 🛒 Observables del carrito
  cartItems$: Observable<CartItem[]>;
  cartSummary$: Observable<CartSummary>;

  // 🎨 Configuración de vista
  categories: Array<{value: ProductCategory | 'all', label: string}> = [
    { value: 'all', label: 'Todas las Categorías' },
    { value: 'materiales', label: 'Materiales' },
    { value: 'equipos', label: 'Equipos' },
    { value: 'herramientas', label: 'Herramientas' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'vehiculos', label: 'Vehículos' },
    { value: 'tecnologia', label: 'Tecnología' }
  ];

  constructor(private cartService: CartService) {
    // Inicializar observables del carrito
    this.cartItems$ = this.cartService.items$;
    this.cartSummary$ = this.cartService.summary$;
  }

  ngOnInit(): void {
    console.log('🚀 ProductListComponent inicializado');
    this.filterProducts();
  }

  // 🔍 Métodos de filtrado y búsqueda
  onSearchChange(): void {
    console.log(`🔍 Búsqueda: "${this.searchTerm}"`);
    this.filterProducts();
  }

  onCategoryChange(): void {
    console.log(`📂 Categoría seleccionada: ${this.selectedCategory}`);
    this.filterProducts();
  }

  onPriceRangeChange(): void {
    console.log(`💰 Rango de precio: ${this.minPrice} - ${this.maxPrice}`);
    this.filterProducts();
  }

  onStockFilterChange(): void {
    console.log(`📦 Solo en stock: ${this.showOnlyInStock}`);
    this.filterProducts();
  }

  filterProducts(): void {
    let filtered = [...this.products];

    // Filtrar por búsqueda
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.supplier.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por categoría
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Filtrar por rango de precio
    filtered = filtered.filter(product => {
      const finalPrice = product.price * (1 - product.discount / 100);
      return finalPrice >= this.minPrice && finalPrice <= this.maxPrice;
    });

    // Filtrar por stock
    if (this.showOnlyInStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'price':
          const priceA = a.price * (1 - a.discount / 100);
          const priceB = b.price * (1 - b.discount / 100);
          comparison = priceA - priceB;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        default: // name
          comparison = a.name.localeCompare(b.name);
      }

      return this.sortDirection === 'desc' ? -comparison : comparison;
    });

    this.filteredProducts = filtered;
  }

  // 🛒 Métodos del carrito
  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.cartService.addToCart(product);
  }

  updateCartQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  // 🎨 Métodos de presentación
  getFinalPrice(product: Product): number {
    return product.price * (1 - product.discount / 100);
  }

  getDiscountAmount(product: Product): number {
    return product.price * (product.discount / 100);
  }

  getStockStatus(product: Product): {text: string, class: string} {
    return product.inStock 
      ? {text: 'En Stock', class: 'in-stock'}
      : {text: 'Agotado', class: 'out-of-stock'};
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    
    const emptyStars = 5 - Math.ceil(rating);
    stars += '☆'.repeat(emptyStars);
    
    return stars;
  }

  getCategoryIcon(category: ProductCategory): string {
    const icons = {
      'materiales': '🧱',
      'equipos': '🚜',
      'herramientas': '🔧',
      'seguridad': '🦺',
      'vehiculos': '🚚',
      'tecnologia': '📱'
    };
    return icons[category] || '📦';
  }

  // 🎛️ Métodos de control de vista
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    console.log(`👁️ Modo de vista: ${this.viewMode}`);
  }

  changeSortOrder(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    console.log(`🔄 Orden: ${this.sortDirection}`);
    this.filterProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.minPrice = 0;
    this.maxPrice = 10000;
    this.showOnlyInStock = false;
    this.sortBy = 'name';
    this.sortDirection = 'asc';
    
    console.log('🔄 Filtros reiniciados');
    this.filterProducts();
  }

  // 🎯 Métodos para demostrar Event Binding
  onProductHover(product: Product, isEntering: boolean): void {
    console.log(`${isEntering ? '🖱️ Hover enter' : '🖱️ Hover leave'}: ${product.name}`);
  }

  onProductFocus(product: Product): void {
    console.log(`🎯 Focus en: ${product.name}`);
  }

  onKeyboardSearch(event: KeyboardEvent): void {
    console.log(`⌨️ Tecla presionada: ${event.key}`);
    
    // Demostrar event binding avanzado
    if (event.key === 'Enter') {
      console.log('🔍 Búsqueda activada con Enter');
    }
    
    if (event.key === 'Escape') {
      this.searchTerm = '';
      this.filterProducts();
      console.log('🚫 Búsqueda limpiada con Escape');
    }
  }

  // 🧮 Métodos computados para demostrar binding dinámico
  get totalProductsCount(): number {
    return this.products.length;
  }

  get filteredProductsCount(): number {
    return this.filteredProducts.length;
  }

  get averagePrice(): number {
    if (this.filteredProducts.length === 0) return 0;
    
    const total = this.filteredProducts.reduce((sum, product) => 
      sum + this.getFinalPrice(product), 0
    );
    
    return total / this.filteredProducts.length;
  }

  get inStockCount(): number {
    return this.filteredProducts.filter(p => p.inStock).length;
  }
}