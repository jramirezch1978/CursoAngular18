import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductCategory, CartItem, Cart } from '../../../models/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  // Datos del componente
  pageTitle = 'Catálogo de Productos PROVIAS';
  searchTerm = '';
  selectedCategory: ProductCategory | 'all' = 'all';
  
  // Productos mock para demostración
  products: Product[] = [
    {
      id: 1,
      name: 'Casco de Seguridad Industrial',
      description: 'Casco certificado con protección UV y sistema de ajuste rápido',
      price: 45.90,
      discount: 10,
      image: 'assets/images/casco.jpg',
      category: ProductCategory.SEGURIDAD,
      stock: 150,
      isAvailable: true,
      rating: 4.5,
      reviews: 23,
      tags: ['seguridad', 'epp', 'construccion'],
      createdAt: new Date('2025-07-01'),
      updatedAt: new Date('2025-08-01')
    },
    {
      id: 2,
      name: 'Taladro Percutor Profesional',
      description: 'Taladro percutor 800W con velocidad variable y mandril de 13mm',
      price: 289.90,
      discount: 15,
      image: 'assets/images/taladro.jpg',
      category: ProductCategory.HERRAMIENTAS,
      stock: 45,
      isAvailable: true,
      rating: 4.8,
      reviews: 67,
      tags: ['herramientas', 'electrico', 'profesional'],
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-08-03')
    },
    {
      id: 3,
      name: 'Cemento Portland Tipo I',
      description: 'Bolsa de 42.5 kg de cemento portland para uso general',
      price: 24.50,
      discount: 0,
      image: 'assets/images/cemento.jpg',
      category: ProductCategory.MATERIALES,
      stock: 500,
      isAvailable: true,
      rating: 4.2,
      reviews: 156,
      tags: ['materiales', 'construccion', 'cemento'],
      createdAt: new Date('2025-07-20'),
      updatedAt: new Date('2025-08-04')
    },
    {
      id: 4,
      name: 'Chaleco Reflectivo',
      description: 'Chaleco de seguridad con cintas reflectivas clase 2',
      price: 18.90,
      discount: 5,
      image: 'assets/images/chaleco.jpg',
      category: ProductCategory.SEGURIDAD,
      stock: 0,
      isAvailable: false,
      rating: 4.6,
      reviews: 89,
      tags: ['seguridad', 'epp', 'reflectivo'],
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-07-30')
    }
  ];

  // Carrito de compras
  cart: Cart = {
    items: [],
    total: 0,
    itemCount: 0,
    discount: 0,
    finalTotal: 0
  };

  // Categorías para el filtro
  categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: ProductCategory.CONSTRUCCION, label: 'Construcción' },
    { value: ProductCategory.HERRAMIENTAS, label: 'Herramientas' },
    { value: ProductCategory.MATERIALES, label: 'Materiales' },
    { value: ProductCategory.SEGURIDAD, label: 'Seguridad' },
    { value: ProductCategory.VEHICULOS, label: 'Vehículos' }
  ];

  ngOnInit(): void {
    console.log('🎯 LAB 1: Data Binding - Componente inicializado');
    this.logBindingExamples();
  }

  // Método para agregar al carrito (Event Binding)
  addToCart(product: Product): void {
    console.log(`🛒 Event Binding: Agregando ${product.name} al carrito`);
    
    const existingItem = this.cart.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity++;
      existingItem.subtotal = existingItem.quantity * this.getDiscountedPrice(product);
    } else {
      this.cart.items.push({
        product,
        quantity: 1,
        subtotal: this.getDiscountedPrice(product)
      });
    }
    
    this.updateCartTotals();
    this.showNotification(`${product.name} agregado al carrito`);
  }

  // Calcular precio con descuento
  getDiscountedPrice(product: Product): number {
    if (product.discount > 0) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  }

  // Actualizar totales del carrito
  private updateCartTotals(): void {
    this.cart.itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cart.total = this.cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.cart.finalTotal = this.cart.total - this.cart.discount;
  }

  // Mostrar notificación
  private showNotification(message: string): void {
    console.log(`📢 Notificación: ${message}`);
    // En una app real, aquí mostraríamos un toast o snackbar
  }

  // Obtener productos filtrados
  getFilteredProducts(): Product[] {
    let filtered = this.products;

    // Filtrar por categoría
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }

  // Método para demostrar tipos de binding
  private logBindingExamples(): void {
    console.log('📚 EJEMPLOS DE DATA BINDING:');
    console.log('1️⃣ Interpolación: {{ product.name }} - Muestra valores en el template');
    console.log('2️⃣ Property Binding: [src]="product.image" - Vincula propiedades');
    console.log('3️⃣ Event Binding: (click)="addToCart()" - Maneja eventos');
    console.log('4️⃣ Two-way Binding: [(ngModel)]="searchTerm" - Sincronización bidireccional');
  }

  // Limpiar carrito
  clearCart(): void {
    this.cart = {
      items: [],
      total: 0,
      itemCount: 0,
      discount: 0,
      finalTotal: 0
    };
    console.log('🗑️ Carrito limpiado');
  }

  // Remover item del carrito
  removeFromCart(item: CartItem): void {
    const index = this.cart.items.indexOf(item);
    if (index > -1) {
      this.cart.items.splice(index, 1);
      this.updateCartTotals();
      console.log(`🗑️ ${item.product.name} removido del carrito`);
    }
  }

  // Obtener clase CSS basada en disponibilidad
  getAvailabilityClass(product: Product): string {
    if (!product.isAvailable) return 'out-of-stock';
    if (product.stock < 10) return 'low-stock';
    return 'in-stock';
  }

  // Obtener texto de disponibilidad
  getAvailabilityText(product: Product): string {
    if (!product.isAvailable) return 'Sin stock';
    if (product.stock < 10) return `Solo ${product.stock} unidades`;
    return 'Disponible';
  }
}
