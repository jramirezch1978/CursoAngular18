import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesShowcaseComponent } from './components/pipes-demo/pipes-showcase.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PipesShowcaseComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>🔧 LAB 4: PIPES PERSONALIZADOS</h1>
        <p>Showcase Interactivo - PROVIAS DESCENTRALIZADO</p>
      </header>
      
      <main class="app-main">
        <app-pipes-showcase></app-pipes-showcase>
      </main>
      
      <footer class="app-footer">
        <p>© 2025 PROVIAS DESCENTRALIZADO - Angular v18</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: linear-gradient(135deg, #1e3a8a, #3b82f6);
      color: white;
      text-align: center;
      padding: 2rem;
    }
    
    .app-main {
      flex: 1;
    }
    
    .app-footer {
      background: #1e3a8a;
      color: white;
      text-align: center;
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'LAB 4: Pipes Personalizados';
}