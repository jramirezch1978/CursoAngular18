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
  subtitle = 'Lab 2: Binding Avanzado';
  
  // Navigation items with routes
  navigationItems = [
    { path: '/home', label: '🏠 Inicio', icon: '🏠' },
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '#', label: '📞 Contacto', icon: '📞' }
  ];

  constructor() {
    console.log('🎯 Lab 2 - HeaderComponent inicializado');
  }

  onContactClick(): void {
    alert('📞 Contacto PROVIAS\n📧 info@provias.gob.pe\n📱 (01) 615-7800\n\n🎯 Lab 2: Binding Avanzado\nDemostración de NgClass, NgStyle, HostListener');
  }
}