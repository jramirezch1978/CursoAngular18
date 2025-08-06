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
  welcomeTitle = 'Laboratorio 2: Binding Avanzado';
  currentYear = new Date().getFullYear();
  lastUpdate = new Date();
  
  // 🎯 Características del Lab 2
  features = [
    {
      icon: '🎨',
      title: 'NgClass Dinámico',
      description: 'Aplicación de múltiples clases CSS de forma condicional usando NgClass',
      route: '/dashboard',
      concepts: ['[ngClass]', 'Clases condicionales', 'Objetos de clases', 'Arrays de clases']
    },
    {
      icon: '🎭',
      title: 'NgStyle Avanzado',
      description: 'Estilos dinámicos y calculados usando NgStyle para efectos visuales',
      route: '/dashboard',
      concepts: ['[ngStyle]', 'Estilos condicionales', 'Cálculos CSS', 'Responsive styles']
    },
    {
      icon: '🎧',
      title: 'HostListener Events',
      description: 'Manejo de eventos globales y del DOM usando HostListener decorador',
      route: '/dashboard',
      concepts: ['@HostListener', 'Eventos globales', 'Window events', 'Document events']
    },
    {
      icon: '🎯',
      title: 'Attribute Binding',
      description: 'Enlace de atributos HTML personalizados y estándares dinámicamente',
      route: '/dashboard',
      concepts: ['[attr.*]', 'Atributos dinámicos', 'ARIA labels', 'Data attributes']
    }
  ];

  // 🏢 Información de PROVIAS
  provias = {
    fullName: 'Proyecto Especial de Infraestructura de Transporte Descentralizado',
    mission: 'Gestión avanzada de interfaces de usuario para sistemas viales',
    labObjective: 'Dominar las técnicas avanzadas de data binding en Angular v18'
  };

  constructor() {
    console.log('🏠 Lab 2 - HomeComponent inicializado');
  }

  ngOnInit(): void {
    console.log('🎯 Lab 2 - Datos cargados:', {
      features: this.features.length,
      lastUpdate: this.lastUpdate
    });
  }

  // 🎯 Método para demostrar event binding
  onFeatureClick(feature: any): void {
    console.log(`🎯 Feature clickeada: ${feature.title}`);
    alert(`🎯 ${feature.title}\n\n${feature.description}\n\n📚 Conceptos:\n${feature.concepts.join('\n• ')}`);
  }

  // 🎨 Método para obtener clases dinámicas
  getFeatureClasses(index: number): { [key: string]: boolean } {
    return {
      'feature-card': true,
      'feature-primary': index === 0,
      'feature-secondary': index === 1,
      'feature-tertiary': index === 2,
      'feature-quaternary': index === 3
    };
  }

  // 🎭 Método para obtener estilos dinámicos
  getFeatureStyles(index: number): { [key: string]: string } {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const delays = ['0.1s', '0.2s', '0.3s', '0.4s'];
    
    return {
      '--accent-color': colors[index] || '#3b82f6',
      'animation-delay': delays[index] || '0.1s',
      'border-left-color': colors[index] || '#3b82f6'
    };
  }
}