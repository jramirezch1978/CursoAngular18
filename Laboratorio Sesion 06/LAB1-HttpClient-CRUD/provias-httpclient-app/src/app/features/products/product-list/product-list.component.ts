import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/http/product.service';
import { 
  Product, 
  CreateProductDto, 
  UpdateProductDto,
  ProductFilters, 
  ProductCategory,
  createEmptyProduct
} from '../../../core/models/product.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  
  // Signals del servicio
  products = this.productService.products;
  loading = this.productService.loading;
  error = this.productService.error;
  statistics = this.productService.statistics;
  selectedProduct = this.productService.selectedProduct;
  
  // Signals locales
  searchTerm = signal('');
  selectedCategory = signal<string>('');
  minPrice: number | null = null;
  maxPrice: number | null = null;
  stockFilter = '';
  sortBy = signal<string>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  showCreateForm = signal(false);
  editingProduct = signal<Product | null>(null);
  formProduct = signal<CreateProductDto>(createEmptyProduct());
  
  // Signals para modal de confirmación de eliminación
  showDeleteModal = signal(false);
  productToDelete = signal<Product | null>(null);
  
  // Computed signals
  availableCategories = computed(() => {
    const products = this.products();
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
  });
  
  currentFilters = computed((): ProductFilters => ({
    search: this.searchTerm() || undefined,
    category: this.selectedCategory() || undefined,
    sortBy: this.sortBy() as any,
    sortOrder: this.sortOrder()
  }));
  
  filteredProducts = computed(() => {
    const products = this.products();
    const filters = this.currentFilters();
    return this.applyLocalFilters(products, filters);
  });
  
  formButtonText = computed(() => 
    this.editingProduct() ? 'Actualizar Producto' : 'Crear Producto'
  );
  
  formTitle = computed(() => 
    this.editingProduct() ? 'Editar Producto' : 'Nuevo Producto'
  );
  
  ProductCategory = ProductCategory;
  
  categoryOptions = [
    { value: ProductCategory.LAPTOPS, label: 'Laptops' },
    { value: ProductCategory.MONITORS, label: 'Monitores' },
    { value: ProductCategory.ACCESSORIES, label: 'Accesorios' },
    { value: ProductCategory.TABLETS, label: 'Tablets' }
  ];
  
  ngOnInit(): void {
    console.log('🚀 ProductListComponent inicializado');
    this.loadProducts();
  }
  
  loadProducts(): void {
    console.log('📦 Cargando productos...');
    const filters = this.currentFilters();
    
    this.productService.getProducts(filters).subscribe({
      next: (products) => {
        console.log(`✅ ${products.length} productos cargados exitosamente`);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
      }
    });
  }
  
  refreshProducts(): void {
    console.log('🔄 Recargando productos...');
    this.productService.clearError();
    this.loadProducts();
  }
  
  onSearchInput(): void {
    console.log(`🔍 Buscando: "${this.searchTerm()}"`);
  }
  
  onCategoryChange(): void {
    console.log(`📂 Filtrando por categoría: "${this.selectedCategory()}"`);
  }
  
  onSortChange(): void {
    console.log(`🔄 Ordenando por: ${this.sortBy()} ${this.sortOrder()}`);
  }
  
  clearFilters(): void {
    console.log('🗑️ Limpiando filtros...');
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.minPrice = null;
    this.maxPrice = null;
    this.stockFilter = '';
    this.sortBy.set('name');
    this.sortOrder.set('asc');
  }
  
  showCreateProductForm(): void {
    console.log('➕ Mostrando formulario de nuevo producto');
    this.editingProduct.set(null);
    this.formProduct.set(createEmptyProduct());
    this.showCreateForm.set(true);
  }

  showForm(): boolean {
    return this.showCreateForm();
  }
  
  createProduct(): void {
    const product = this.formProduct();
    console.log('🏗️ Creando producto:', product);
    
    if (!product.name.trim()) {
      this.notificationService.warning('Campo requerido', 'El nombre del producto es requerido');
      return;
    }
    
    if (product.price <= 0) {
      this.notificationService.warning('Precio inválido', 'El precio debe ser mayor a 0');
      return;
    }
    
    this.productService.createProduct(product).subscribe({
      next: (createdProduct) => {
        console.log('✅ Producto creado:', createdProduct);
        this.hideForm();
        this.notificationService.success('¡Producto creado!', 'Los cambios se han grabado satisfactoriamente');
      },
      error: (err) => {
        console.error('❌ Error al crear producto:', err);
      }
    });
  }
  
  editProduct(product: Product): void {
    console.log('✏️ Editando producto:', product);
    this.editingProduct.set(product);
    this.formProduct.set({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl
    });
    this.showCreateForm.set(true);
  }
  
  updateProduct(): void {
    const editing = this.editingProduct();
    if (!editing || !editing.id) {
      console.error('❌ No hay producto para editar');
      return;
    }
    
    const formData = this.formProduct();
    const updates: UpdateProductDto = {
      id: editing.id,
      ...formData
    };
    console.log('🔄 Actualizando producto:', editing.id, updates);
    
    this.productService.updateProduct(editing.id, updates).subscribe({
      next: (updatedProduct) => {
        console.log('✅ Producto actualizado:', updatedProduct);
        this.hideForm();
        this.notificationService.success('¡Producto actualizado!', 'Los cambios se han grabado satisfactoriamente');
      },
      error: (err) => {
        console.error('❌ Error al actualizar producto:', err);
      }
    });
  }
  
  deleteProduct(product: Product): void {
    if (!product.id) return;
    
    console.log('🗑️ Eliminando producto:', product);
    
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        console.log('✅ Producto eliminado exitosamente');
        // Mostrar notificación de éxito más elegante
        this.showSuccessNotification(`Producto "${product.name}" eliminado exitosamente`);
      },
      error: (err) => {
        console.error('❌ Error al eliminar producto:', err);
        this.showErrorNotification('Error al eliminar el producto. Inténtalo nuevamente.');
      }
    });
  }

  // 🎉 Mostrar notificación de éxito (reemplaza alert)
  private showSuccessNotification(message: string): void {
    // Por ahora usamos console.log, pero se puede implementar un sistema de notificaciones más elegante
    console.log(`✅ ${message}`);
    // Temporal: usar alert hasta implementar notificaciones toast
    alert(message);
  }

  // ❌ Mostrar notificación de error
  private showErrorNotification(message: string): void {
    console.error(`❌ ${message}`);
    alert(message);
  }
  
  onFormSubmit(): void {
    if (this.editingProduct()) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }
  
  cancelForm(): void {
    console.log('❌ Formulario cancelado');
    this.hideForm();
  }
  
  hideForm(): void {
    this.showCreateForm.set(false);
    this.editingProduct.set(null);
    this.formProduct.set(createEmptyProduct());
    console.log('👎 Formulario ocultado');
  }

  saveProduct(): void {
    if (this.editingProduct()) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }
  
  selectProduct(product: Product): void {
    console.log('🎯 Producto seleccionado:', product);
    this.productService.selectProduct(product);
  }
  
  clearSelection(): void {
    console.log('🗑️ Selección limpiada');
    this.productService.clearSelection();
  }
  
  clearError(): void {
    this.productService.clearError();
  }
  
  private applyLocalFilters(products: Product[], filters: ProductFilters): Product[] {
    let filtered = [...products];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const direction = filters.sortOrder === 'desc' ? -1 : 1;
        
        switch (filters.sortBy) {
          case 'name':
            return direction * a.name.localeCompare(b.name);
          case 'price':
            return direction * (a.price - b.price);
          case 'stock':
            return direction * (a.stock - b.stock);
          case 'createdAt':
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return direction * (dateA - dateB);
          default:
            return 0;
        }
      });
    }
    
    return filtered;
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  }
  
  getStockClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
  }

  // 🔍 Verificar si hay filtros activos
  hasActiveFilters(): boolean {
    return !!(this.searchTerm() || this.selectedCategory() || this.minPrice || this.maxPrice || this.stockFilter);
  }

  // 🔄 Manejar cambios en los filtros
  onFilterChange(): void {
    console.log('🔍 Aplicando filtros:', {
      searchTerm: this.searchTerm(),
      category: this.selectedCategory(),
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      stockFilter: this.stockFilter,
      sortBy: this.sortBy()
    });
  }

  // 🔍 Manejar cambios en la búsqueda
  onSearchChange(): void {
    console.log('🔍 Búsqueda:', this.searchTerm());
    this.onFilterChange();
  }

  // 🚪 Cerrar modal al hacer click en el overlay
  closeModalOnOverlay(event: Event): void {
    if (event.target === event.currentTarget) {
      this.hideForm();
    }
  }

  // 🔄 Mostrar loading global
  showGlobalLoading(): boolean {
    return false; // Deshabilitado por defecto para evitar doble loading
  }

  // 🗑️ Mostrar modal de confirmación de eliminación
  showDeleteConfirmation(product: Product): void {
    console.log('🗑️ Mostrando confirmación de eliminación para:', product.name);
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  // ❌ Cerrar modal de confirmación
  closeDeleteModal(): void {
    console.log('✕ Cerrando modal de confirmación');
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
  }

  // ⚠️ Confirmar eliminación definitiva
  confirmDeleteProduct(): void {
    const product = this.productToDelete();
    if (product) {
      console.log('💀 Eliminando producto:', product.name);
      this.deleteProduct(product);
      this.closeDeleteModal();
    }
  }
  
  getStockMessage(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock < 10) return 'Stock bajo';
    return 'Disponible';
  }
}