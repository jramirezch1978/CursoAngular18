import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, CartItem, CartSummary } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private readonly TAX_RATE = 0.18; // IGV en Perú

  constructor() {
    console.log('🛒 CartService inicializado');
  }

  /**
   * Observable de los items del carrito
   */
  get items$(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  /**
   * Observable del resumen del carrito con cálculos
   */
  get summary$(): Observable<CartSummary> {
    return this.cartItems.pipe(
      map(items => this.calculateSummary(items))
    );
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        addedAt: new Date()
      };
      currentItems.push(newItem);
    }

    this.cartItems.next([...currentItems]);
    console.log(`✅ Agregado al carrito: ${product.name} (x${quantity})`);
  }

  /**
   * Actualizar cantidad de un producto
   */
  updateQuantity(productId: number, quantity: number): void {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.product.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.cartItems.next([...currentItems]);
        console.log(`🔄 Cantidad actualizada: ${item.product.name} (x${quantity})`);
      }
    }
  }

  /**
   * Remover producto del carrito
   */
  removeFromCart(productId: number): void {
    const currentItems = this.cartItems.value;
    const filteredItems = currentItems.filter(item => item.product.id !== productId);
    
    this.cartItems.next(filteredItems);
    console.log(`🗑️ Producto removido del carrito: ID ${productId}`);
  }

  /**
   * Limpiar todo el carrito
   */
  clearCart(): void {
    this.cartItems.next([]);
    console.log('🧹 Carrito limpiado');
  }

  /**
   * Verificar si un producto está en el carrito
   */
  isInCart(productId: number): Observable<boolean> {
    return this.cartItems.pipe(
      map(items => items.some(item => item.product.id === productId))
    );
  }

  /**
   * Obtener cantidad de un producto en el carrito
   */
  getProductQuantity(productId: number): Observable<number> {
    return this.cartItems.pipe(
      map(items => {
        const item = items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
      })
    );
  }

  /**
   * Calcular resumen del carrito
   */
  private calculateSummary(items: CartItem[]): CartSummary {
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = item.product.price * (1 - item.product.discount / 100);
      return sum + (itemPrice * item.quantity);
    }, 0);

    const discountAmount = items.reduce((sum, item) => {
      const originalPrice = item.product.price * item.quantity;
      const discountedPrice = originalPrice * (item.product.discount / 100);
      return sum + discountedPrice;
    }, 0);

    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      itemCount
    };
  }

  /**
   * Simular proceso de checkout
   */
  checkout(): Observable<boolean> {
    return new Observable(observer => {
      console.log('🚀 Iniciando proceso de checkout...');
      
      // Simular procesamiento asíncrono
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% de éxito
        
        if (success) {
          console.log('✅ Checkout exitoso');
          this.clearCart();
          observer.next(true);
        } else {
          console.log('❌ Error en checkout');
          observer.next(false);
        }
        
        observer.complete();
      }, 2000);
    });
  }
}