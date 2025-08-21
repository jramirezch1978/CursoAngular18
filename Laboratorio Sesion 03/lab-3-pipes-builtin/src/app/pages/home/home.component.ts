import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      
      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">{{ welcomeTitle }}</h1>
          <p class="hero-subtitle">{{ provias.labObjective }}</p>
          
          <div class="hero-actions">
            <button [routerLink]="'/tasks'" class="cta-button primary">
              📋 Explorar Gestor de Tareas
            </button>
          </div>
        </div>
      </section>

      <!-- FEATURES SECTION -->
      <section class="features-section">
        <div class="section-header">
          <h2>🔧 Pipes y Transformaciones</h2>
          <p>Explora las técnicas de transformación de datos</p>
        </div>

        <div class="features-grid">
          @for (feature of features; track feature.title; let i = $index) {
            <article class="feature-card" (click)="onFeatureClick(feature)">
              <div class="feature-icon">{{ feature.icon }}</div>
              <div class="feature-content">
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
                
                <ul class="concepts-list">
                  @for (concept of feature.concepts; track concept) {
                    <li class="concept-item">
                      <code>{{ concept }}</code>
                    </li>
                  }
                </ul>
              </div>

              <div class="feature-actions">
                <button [routerLink]="feature.route" class="feature-btn">
                  🚀 Explorar
                </button>
              </div>
            </article>
          }
        </div>
      </section>

      <!-- PIPES DEMO -->
      <section class="pipes-demo-section">
        <h2>🎯 Demostraciones en Vivo</h2>
        
        <div class="demo-grid">
          
          <div class="demo-card">
            <h3>🔤 Pipes de Texto</h3>
            <div class="demo-examples">
              <p><strong>Original:</strong> {{ demoText }}</p>
              <p><strong>Uppercase:</strong> {{ demoText | uppercase }}</p>
              <p><strong>Titlecase:</strong> {{ demoText | titlecase }}</p>
              <p><strong>Slice:</strong> {{ demoText | slice:0:30 }}...</p>
            </div>
          </div>

          <div class="demo-card">
            <h3>🔢 Pipes Numéricos</h3>
            <div class="demo-examples">
              <p><strong>Número:</strong> {{ demoNumber | number:'1.2-2' }}</p>
              <p><strong>Porcentaje:</strong> {{ demoPercent | percent:'1.1-1' }}</p>
              <p><strong>Moneda:</strong> {{ demoNumber | currency:'PEN':'symbol':'1.0-0' }}</p>
            </div>
          </div>

          <div class="demo-card">
            <h3>📅 Pipes de Fecha</h3>
            <div class="demo-examples">
              <p><strong>Corta:</strong> {{ demoDate | date:'dd/MM/yy' }}</p>
              <p><strong>Completa:</strong> {{ demoDate | date:'fullDate':'':'es' }}</p>
              <p><strong>Hora:</strong> {{ demoDate | date:'HH:mm:ss' }}</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  `,
  styles: [`
    .home-container {
      width: 100%;
      min-height: 100vh;
    }
    
    .hero-section {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #10b981 100%);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.95;
    }
    
    .cta-button {
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      background: #fbbf24;
      color: #1e3a8a;
    }
    
    .cta-button:hover {
      background: #f59e0b;
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(251, 191, 36, 0.4);
    }
    
    .features-section {
      padding: 4rem 2rem;
      background: #f8fafc;
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .section-header h2 {
      font-size: 2.5rem;
      color: #1e3a8a;
      margin-bottom: 1rem;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .feature-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
    }
    
    .feature-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .feature-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1rem;
    }
    
    .feature-description {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .concepts-list {
      list-style: none;
      padding: 0;
      margin-bottom: 2rem;
    }
    
    .concept-item code {
      background: #e2e8f0;
      color: #1e293b;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
    }
    
    .feature-btn {
      width: 100%;
      padding: 0.75rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: block;
      text-align: center;
    }
    
    .pipes-demo-section {
      padding: 4rem 2rem;
      background: white;
    }
    
    .pipes-demo-section h2 {
      text-align: center;
      font-size: 2.5rem;
      color: #1e3a8a;
      margin-bottom: 3rem;
    }
    
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .demo-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
    }
    
    .demo-card h3 {
      color: #1e3a8a;
      margin-bottom: 1rem;
    }
    
    .demo-examples p {
      margin: 0.5rem 0;
      font-family: 'Courier New', monospace;
      background: white;
      padding: 0.5rem;
      border-radius: 4px;
      border-left: 4px solid #3b82f6;
    }
    
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .features-grid, .demo-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  
  welcomeTitle = 'Laboratorio 3: Pipes Built-in y Async';
  currentYear = new Date().getFullYear();
  lastUpdate = new Date();
  
  // Datos para demostrar pipes
  demoText = 'gestión de infraestructura vial descentralizada';
  demoNumber = 1234567.89;
  demoPercent = 0.685;
  demoDate = new Date();
  
  features = [
    {
      icon: '🔤',
      title: 'Pipes de Texto',
      description: 'Transformación de strings con uppercase, titlecase, slice',
      route: '/tasks',
      concepts: ['uppercase', 'titlecase', 'lowercase', 'slice']
    },
    {
      icon: '🔢',
      title: 'Pipes Numéricos',
      description: 'Formateo de números, porcentajes y monedas',
      route: '/tasks',
      concepts: ['number', 'percent', 'currency', 'decimal']
    },
    {
      icon: '📅',
      title: 'Pipes de Fecha',
      description: 'Formateo de fechas con localización en español',
      route: '/tasks',
      concepts: ['date', 'fullDate', 'shortDate', 'time']
    },
    {
      icon: '🚀',
      title: 'Async Pipe',
      description: 'Manejo automático de Observables y Promises',
      route: '/tasks',
      concepts: ['async', 'Observable', 'BehaviorSubject', 'subscription']
    }
  ];

  provias = {
    labObjective: 'Dominar la transformación de datos y programación reactiva con Angular v18'
  };

  ngOnInit(): void {
    console.log('🏠 Lab 3 - HomeComponent inicializado');
  }

  onFeatureClick(feature: any): void {
    console.log(`🎯 Feature: ${feature.title}`);
    alert(`🎯 ${feature.title}\n\n${feature.description}\n\n📚 Conceptos:\n• ${feature.concepts.join('\n• ')}`);
  }
}
