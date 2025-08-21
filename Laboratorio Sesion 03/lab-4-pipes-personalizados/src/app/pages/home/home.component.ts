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
            <button [routerLink]="'/pipes'" class="cta-button primary">
              🔧 Explorar Pipes Personalizados
            </button>
          </div>
        </div>
      </section>

      <!-- PIPES SECTION -->
      <section class="pipes-section">
        <div class="section-header">
          <h2>🔧 Pipes Personalizados Creados</h2>
          <p>Suite completa de transformadores para casos de uso reales</p>
        </div>

        <div class="pipes-grid">
          @for (pipe of customPipes; track pipe.name; let i = $index) {
            <article class="pipe-card" (click)="onPipeClick(pipe)">
              <div class="pipe-icon">{{ pipe.icon }}</div>
              <div class="pipe-content">
                <h3 class="pipe-name">{{ pipe.name }}</h3>
                <p class="pipe-description">{{ pipe.description }}</p>
                
                <div class="pipe-syntax">
                  <code>{{ pipe.syntax }}</code>
                </div>

                <div class="pipe-features">
                  @for (feature of pipe.features; track feature) {
                    <span class="feature-tag">{{ feature }}</span>
                  }
                </div>

                <div class="pipe-performance">
                  <span class="performance-badge" [class]="pipe.performance">
                    {{ pipe.isPure ? '🟢 Puro' : '🟡 Impuro' }}
                  </span>
                </div>
              </div>

              <div class="pipe-actions">
                <button [routerLink]="'/pipes'" class="pipe-btn">
                  🎯 Ver Demo
                </button>
              </div>
            </article>
          }
        </div>
      </section>

      <!-- BENEFITS SECTION -->
      <section class="benefits-section">
        <h2>💡 Beneficios de los Pipes Personalizados</h2>
        
        <div class="benefits-grid">
          
          <div class="benefit-card">
            <h3>🔄 Reutilización</h3>
            <p>Crea una vez, usa en toda la aplicación</p>
            <ul>
              <li>✅ Lógica centralizada</li>
              <li>✅ Mantenimiento simplificado</li>
              <li>✅ Consistencia en toda la app</li>
            </ul>
          </div>

          <div class="benefit-card">
            <h3>⚡ Performance</h3>
            <p>Optimizados para máximo rendimiento</p>
            <ul>
              <li>✅ Pipes puros cuando es posible</li>
              <li>✅ Memoización para cálculos costosos</li>
              <li>✅ Detección de cambios optimizada</li>
            </ul>
          </div>

          <div class="benefit-card">
            <h3>🛡️ Seguridad</h3>
            <p>Manejo seguro de contenido HTML</p>
            <ul>
              <li>✅ DomSanitizer integrado</li>
              <li>✅ Escape de caracteres especiales</li>
              <li>✅ Validación de inputs</li>
            </ul>
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
    
    .pipes-section {
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
    
    .pipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .pipe-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .pipe-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
      border-color: #3b82f6;
    }
    
    .pipe-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .pipe-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1rem;
    }
    
    .pipe-description {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .pipe-syntax {
      background: #1e293b;
      color: #e2e8f0;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    
    .pipe-syntax code {
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
    }
    
    .pipe-features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .feature-tag {
      background: #e2e8f0;
      color: #1e293b;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .performance-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .performance-badge.pure {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }
    
    .performance-badge.impure {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }
    
    .pipe-btn {
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
    
    .benefits-section {
      padding: 4rem 2rem;
      background: white;
    }
    
    .benefits-section h2 {
      text-align: center;
      font-size: 2.5rem;
      color: #1e3a8a;
      margin-bottom: 3rem;
    }
    
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .benefit-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      border-left: 4px solid #3b82f6;
    }
    
    .benefit-card h3 {
      color: #1e3a8a;
      margin-bottom: 1rem;
    }
    
    .benefit-card p {
      color: #64748b;
      margin-bottom: 1rem;
    }
    
    .benefit-card ul {
      list-style: none;
      padding: 0;
    }
    
    .benefit-card li {
      padding: 0.25rem 0;
      color: #374151;
    }
    
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .pipes-grid, .benefits-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  
  welcomeTitle = 'Laboratorio 4: Pipes Personalizados';
  currentYear = new Date().getFullYear();
  
  customPipes = [
    {
      name: 'FilterPipe',
      icon: '🔍',
      description: 'Filtrado inteligente con búsqueda en múltiples campos',
      syntax: 'array | filter:searchTerm:field',
      features: ['Case-insensitive', 'Propiedades anidadas', 'Búsqueda global'],
      isPure: false,
      performance: 'impure'
    },
    {
      name: 'TruncatePipe',
      icon: '✂️',
      description: 'Truncado de texto respetando límites de palabra',
      syntax: 'text | truncate:limit:trail:wordBoundary',
      features: ['Word boundary', 'Trail personalizable', 'Alta performance'],
      isPure: true,
      performance: 'pure'
    },
    {
      name: 'FileSizePipe',
      icon: '📁',
      description: 'Conversión de bytes a unidades legibles',
      syntax: 'bytes | fileSize:decimals:units',
      features: ['Unidades binarias/decimales', 'Precisión configurable', 'Formato correcto'],
      isPure: true,
      performance: 'pure'
    },
    {
      name: 'TimeAgoPipe',
      icon: '⏰',
      description: 'Tiempo relativo humanizado en español',
      syntax: 'date | timeAgo',
      features: ['Actualización automática', 'Formato humanizado', 'Localización ES'],
      isPure: false,
      performance: 'impure'
    },
    {
      name: 'SearchHighlightPipe',
      icon: '🖍️',
      description: 'Resaltado seguro de términos de búsqueda',
      syntax: 'text | searchHighlight:term:class',
      features: ['HTML seguro', 'DomSanitizer', 'Escape regex'],
      isPure: true,
      performance: 'pure'
    },
    {
      name: 'SortByPipe',
      icon: '📊',
      description: 'Ordenamiento avanzado por múltiples criterios',
      syntax: 'array | sortBy:field:direction:dataType',
      features: ['Múltiples tipos', 'Propiedades anidadas', 'Localización'],
      isPure: false,
      performance: 'impure'
    }
  ];

  provias = {
    labObjective: 'Crear herramientas de transformación de datos reutilizables y optimizadas'
  };

  ngOnInit(): void {
    console.log('🏠 Lab 4 - HomeComponent inicializado');
  }

  onPipeClick(pipe: any): void {
    console.log(`🔧 Pipe: ${pipe.name}`);
    alert(`🔧 ${pipe.name}\n\n${pipe.description}\n\n📝 Sintaxis: ${pipe.syntax}\n\n⚡ Performance: ${pipe.isPure ? 'Puro (Óptimo)' : 'Impuro (Cuidado)'}`);
  }
}
