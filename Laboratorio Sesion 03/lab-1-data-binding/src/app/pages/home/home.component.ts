import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  
  // 📊 Datos para demostrar interpolación
  welcomeTitle = 'Bienvenido a PROVIAS DESCENTRALIZADO';
  currentYear = new Date().getFullYear();
  lastUpdate = new Date();
  
  // 📈 Estadísticas de ejemplo
  statistics = {
    projectsCount: 42,
    roadsBuilt: 1350, // km
    bridgesBuilt: 89,
    investmentTotal: 2450000000 // en soles
  };

  // 🎯 Características del sistema
  features = [
    {
      icon: '🛍️',
      title: 'Gestión de Productos',
      description: 'Sistema completo de gestión de materiales y equipos para proyectos viales',
      route: '/products',
      benefits: ['Catálogo completo', 'Carrito de compras', 'Filtros avanzados']
    },
    {
      icon: '🔧',
      title: 'Data Binding',
      description: 'Demostración completa de los 4 tipos de data binding de Angular',
      route: '/products',
      benefits: ['Interpolación', 'Property Binding', 'Event Binding', 'Two-way Binding']
    },
    {
      icon: '📊',
      title: 'Pipes y Transformaciones',
      description: 'Uso de pipes built-in para formateo de datos empresariales',
      route: '/products',
      benefits: ['Currency Pipe', 'Date Pipe', 'Number Pipe', 'Custom Pipes']
    }
  ];

  // 🏢 Información de PROVIAS
  provias = {
    fullName: 'Proyecto Especial de Infraestructura de Transporte Descentralizado',
    mission: 'Contribuir al desarrollo del país mediante la gestión de la infraestructura vial descentralizada',
    vision: 'Ser la entidad líder en gestión vial descentralizada del país'
  };

  constructor() {
    console.log('🏠 HomeComponent inicializado');
  }

  ngOnInit(): void {
    console.log('🎯 Datos cargados:', {
      statistics: this.statistics,
      features: this.features.length,
      lastUpdate: this.lastUpdate
    });
  }

  // 🎯 Método para demostrar event binding
  onFeatureClick(feature: any): void {
    console.log(`🎯 Feature clickeada: ${feature.title}`);
    alert(`🎯 ${feature.title}\n\n${feature.description}`);
  }

  // 📊 Método para formatear números grandes
  formatLargeNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // 🎨 Método para obtener clases dinámicas
  getFeatureClasses(index: number): { [key: string]: boolean } {
    return {
      'feature-card': true,
      'feature-primary': index === 0,
      'feature-secondary': index === 1,
      'feature-tertiary': index === 2
    };
  }
}