import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskFormComponent } from './features/task-manager/task-form/task-form.component';
import { LoggerDemoComponent } from './features/demos/logger-demo/logger-demo.component';
import { CacheDemoComponent } from './features/demos/cache-demo/cache-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TaskFormComponent, LoggerDemoComponent, CacheDemoComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>🚀 LAB 3: Providers y Jerarquía de Inyectores</h1>
        <p>Sistema avanzado con InjectionTokens, Multi-providers y Factory providers</p>
      </header>
      
      <main class="app-main">
        <div class="demo-grid">
          <section class="demo-section">
            <h2>📝 Formulario con Validadores Multi-provider</h2>
            <app-task-form></app-task-form>
          </section>
          
          <section class="demo-section">
            <h2>📊 Demo de Logger Contextual</h2>
            <app-logger-demo></app-logger-demo>
          </section>
          
          <section class="demo-section">
            <h2>💾 Demo de Estrategias de Caché</h2>
            <app-cache-demo></app-cache-demo>
          </section>
        </div>
      </main>
      
      <router-outlet />
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    
    .app-header {
      background: white;
      padding: 2rem;
      text-align: center;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      
      h1 {
        color: #2c3e50;
        margin: 0 0 0.5rem 0;
        font-size: 2.5rem;
        background: linear-gradient(45deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      p {
        color: #7f8c8d;
        margin: 0;
        font-size: 1.1rem;
      }
    }
    
    .app-main {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      
      .demo-section {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        
        h2 {
          color: #2c3e50;
          margin-top: 0;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }
      }
    }
    
    @media (max-width: 768px) {
      .app-container {
        padding: 1rem;
      }
      
      .app-header h1 {
        font-size: 1.8rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'lab3-providers';
}
