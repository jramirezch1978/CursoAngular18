import { Routes } from '@angular/router';

export const routes: Routes = [
  // 🎯 Ruta principal - redirige a productos
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  
  // 📦 Ruta para el listado de productos
  { 
    path: 'products', 
    loadComponent: () => import('./features/products/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  
  // 🔄 Ruta comodín para rutas no encontradas
  { path: '**', redirectTo: '/products' }
];
