import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomDirectivesShowcaseComponent } from './components/custom-directives-showcase/custom-directives-showcase.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CustomDirectivesShowcaseComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <span class="logo-icon">🏗️</span>
            <div class="logo-text">
              <h1>PROVIAS Nacional</h1>
              <p>Laboratorio 03 - Directivas Personalizadas</p>
            </div>
          </div>
        </div>
      </header>
      
      <main class="app-main">
        <app-custom-directives-showcase></app-custom-directives-showcase>
      </main>
      
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2025 PROVIAS Nacional - Laboratorio Angular 18 - Directivas Personalizadas</p>
          <p class="version">Lab 03 - HostListener, HostBinding, Renderer2</p>
        </div>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      font-size: 2.5rem;
    }

    .logo-text h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .logo-text p {
      margin: 0;
      opacity: 0.9;
      font-size: 1rem;
    }

    .app-main {
      flex: 1;
      background: #f8f9fa;
    }

    .app-footer {
      background: #2c3e50;
      color: white;
      padding: 1.5rem 0;
      text-align: center;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .footer-content p {
      margin: 0.25rem 0;
    }

    .version {
      opacity: 0.8;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 1rem;
      }
      
      .logo-text h1 {
        font-size: 1.5rem;
      }
      
      .logo-text p {
        font-size: 0.9rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'lab03-directivas-personalizadas';
}
