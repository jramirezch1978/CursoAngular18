import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  title = 'PROVIAS DESCENTRALIZADO';
  subtitle = 'Sistema de Gestión Vial';
  
  // Menu items
  navigationItems = [
    { path: '/home', label: '🏠 Inicio', icon: '🏠' },
    { path: '/products', label: '🛍️ Productos', icon: '🛍️' },
    { path: '#', label: '📞 Contacto', icon: '📞' }
  ];

  constructor() {
    console.log('🎯 HeaderComponent inicializado');
  }

  onContactClick(): void {
    alert('📞 Contacto: info@provias.gob.pe\n📱 Teléfono: (01) 615-7800');
  }
}