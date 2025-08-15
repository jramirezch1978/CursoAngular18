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
  
  // Loading states específicos del LAB2
  isLoadingList = this.productService.isLoadingList;
  isCreating = this.productService.isCreating;
  isUpdating = this.productService.isUpdating;
  isDeleting = this.productService.isDeleting;
  
  // Signals locales para UI
  searchTerm = signal('');
  selectedCategory = signal<string>('');
  sortBy = signal<string>('name');
  showCreateForm = signal(false);
  editingProduct = signal<Product | null>(null);
  
  // Formulario para producto
  formProduct = signal<CreateProductDto>(createEmptyProduct());
  
  // Modal de confirmación
  showDeleteModal = signal(false);
  productToDelete = signal<Product | null>(null);
  
  // Filtros de precio
  minPrice: number | null = null;
  maxPrice: number | null = null;
  stockFilter = '';
  
  categories: ProductCategory[] = ['laptops', 'monitors', 'accessories', 'components', 'software', 'networking', 'storage'];
  
  // Computed signals
  hasActiveFilters = computed(() => {
    return !!(this.searchTerm() || 
             this.selectedCategory() || 
             this.minPrice || 
             this.maxPrice || 
             this.stockFilter);
  });
  
  filteredProducts = computed(() => {
    const products = this.products();
    const search = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    
    return products.filter(product => {
      const matchesSearch = !search || 
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search);
      
      const matchesCategory = !category || product.category === category;
      
      const matchesMinPrice = !this.minPrice || product.price >= this.minPrice;
      const matchesMaxPrice = !this.maxPrice || product.price <= this.maxPrice;
      
      const matchesStock = !this.stockFilter || 
        (this.stockFilter === 'inStock' && product.stock > 0) ||
        (this.stockFilter === 'outOfStock' && product.stock === 0) ||
        (this.stockFilter === 'lowStock' && product.stock > 0 && product.stock < 10);
      
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
    });
  });
  
  ngOnInit(): void {
    console.log('🚀 [LAB2] ProductListComponent inicializado con manejo de errores');
    this.loadProducts();
  }
  
  loadProducts(): void {
    const filters: ProductFilters = {};
    
    if (this.selectedCategory()) {
      filters.category = this.selectedCategory();
    }
    
    if (this.searchTerm()) {
      filters.search = this.searchTerm();
    }
    
    if (this.sortBy()) {
      filters.sortBy = this.sortBy() as any;
      filters.sortOrder = 'asc';
    }
    
    this.productService.getProducts(filters).subscribe({
      next: () => {
        console.log('✅ [LAB2] Productos cargados con manejo de errores');
        if (this.error()) {
          this.productService.clearError();
        }
      },
      error: (err) => {
        console.error('❌ [LAB2] Error al cargar productos:', err);
        this.notificationService.error(
          'Error al cargar productos',
          'No se pudieron cargar los productos. Por favor, inténtelo nuevamente.'
        );
      }
    });
  }
  
  createProduct(): void {
    const product = this.formProduct();
    console.log('🏗️ [LAB2] Creando producto con validación robusta:', product);
    
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
        console.log('✅ [LAB2] Producto creado:', createdProduct);
        this.hideForm();
        this.notificationService.success('¡Producto creado!', 'Los cambios se han grabado satisfactoriamente');
      },
      error: (err) => {
        console.error('❌ [LAB2] Error al crear producto:', err);
        this.notificationService.error(
          'Error al crear producto',
          'No se pudo crear el producto. Verifique los datos e inténtelo nuevamente.'
        );
      }
    });
  }
  
  editProduct(product: Product): void {
    console.log('✏️ [LAB2] Editando producto:', product.name);
    this.editingProduct.set(product);
    this.formProduct.set({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl || ''
    });
    this.showCreateForm.set(true);
  }
  
  updateProduct(): void {
    const editing = this.editingProduct();
    if (!editing || !editing.id) {
      console.error('❌ [LAB2] No hay producto para editar');
      this.notificationService.error('Error', 'No se ha seleccionado un producto para editar');
      return;
    }
    
    const formData = this.formProduct();
    const updates: UpdateProductDto = {
      id: editing.id,
      ...formData
    };
    console.log('🔄 [LAB2] Actualizando producto con retry automático:', editing.id, updates);
    
    this.productService.updateProduct(editing.id, updates).subscribe({
      next: (updatedProduct) => {
        console.log('✅ [LAB2] Producto actualizado:', updatedProduct);
        this.hideForm();
        this.notificationService.success('¡Producto actualizado!', 'Los cambios se han grabado satisfactoriamente');
      },
      error: (err) => {
        console.error('❌ [LAB2] Error al actualizar producto:', err);
        this.notificationService.error(
          'Error al actualizar producto',
          'No se pudo actualizar el producto. Inténtelo nuevamente.'
        );
      }
    });
  }
  
  deleteProduct(product: Product): void {
    if (!product.id) return;
    
    console.log('🗑️ [LAB2] Eliminando producto con confirmación:', product.name);
    
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        console.log('✅ [LAB2] Producto eliminado');
        this.notificationService.success('¡Producto eliminado!', `El producto "${product.name}" ha sido eliminado exitosamente`);
      },
      error: (err) => {
        console.error('❌ [LAB2] Error al eliminar producto:', err);
        this.notificationService.error(
          'Error al eliminar producto',
          'No se pudo eliminar el producto. Inténtelo nuevamente.'
        );
      }
    });
  }

  onFormSubmit(): void {
    if (this.editingProduct()) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }
  
  saveProduct(): void {
    if (this.editingProduct()) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }
  
  showCreateProductForm(): void {
    console.log('➕ [LAB2] Mostrando formulario de creación');
    this.editingProduct.set(null);
    this.formProduct.set(createEmptyProduct());
    this.showCreateForm.set(true);
  }
  
  hideForm(): void {
    this.showCreateForm.set(false);
    this.editingProduct.set(null);
    this.formProduct.set(createEmptyProduct());
  }
  
  showForm(): boolean {
    return this.showCreateForm();
  }
  
  onFilterChange(): void {
    console.log('🔍 [LAB2] Aplicando filtros con manejo de errores');
    this.loadProducts();
  }
  
  onSearchChange(): void {
    console.log('🔍 [LAB2] Búsqueda:', this.searchTerm());
    this.onFilterChange();
  }
  
  closeModalOnOverlay(event: Event): void {
    if (event.target === event.currentTarget) {
      this.hideForm();
    }
  }
  
  showDeleteConfirmation(product: Product): void {
    console.log('🗑️ [LAB2] Mostrando confirmación de eliminación para:', product.name);
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }
  
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
  }
  
  confirmDeleteProduct(): void {
    const product = this.productToDelete();
    if (product) {
      this.deleteProduct(product);
      this.closeDeleteModal();
    }
  }
  
  clearFilters(): void {
    console.log('🧹 [LAB2] Limpiando filtros');
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.sortBy.set('name');
    this.minPrice = null;
    this.maxPrice = null;
    this.stockFilter = '';
    this.loadProducts();
  }
  
  refreshProducts(): void {
    console.log('🔄 [LAB2] Refrescando productos manualmente');
    this.productService.refreshProducts().subscribe({
      next: () => {
        this.notificationService.success('¡Actualizado!', 'La lista de productos se ha actualizado correctamente');
      },
      error: (err) => {
        console.error('❌ [LAB2] Error al refrescar:', err);
        this.notificationService.error('Error', 'No se pudo actualizar la lista de productos');
      }
    });
  }
  
  // Método para mostrar información de errores (LAB2 específico)
  showErrorDetails(): void {
    const errorStats = this.productService.getErrorStatistics();
    if (errorStats.hasErrors) {
      console.group('🔍 [LAB2] Detalles del último error:');
      console.log('Error:', errorStats.lastError);
      console.log('Contexto:', errorStats.lastErrorContext);
      console.groupEnd();
      
      this.notificationService.info(
        'Información de Error',
        `Último error: ${errorStats.lastError}`
      );
    } else {
      this.notificationService.info('Sin errores', 'No hay errores recientes registrados');
    }
  }
  
  // Método para simular error (testing)
  simulateError(): void {
    console.log('🧪 [LAB2] Simulando error para testing');
    this.productService.getProduct('non-existent-id').subscribe({
      next: () => {},
      error: () => {
        this.notificationService.warning('Error simulado', 'Esta es una demostración del manejo de errores');
      }
    });
  }
}
