import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavigationComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <span class="logo-icon">🏗️</span>
            <div class="logo-text">
              <h1>PROVIAS Nacional</h1>
              <p>Laboratorio Completo - Directivas Angular 18</p>
            </div>
          </div>
          
          <nav class="main-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="nav-icon">🏠</span>
              Inicio
            </a>
            <a routerLink="/navigation" routerLinkActive="active">
              <span class="nav-icon">🧭</span>
              Navegación
            </a>
          </nav>
        </div>
      </header>
      
      <main class="app-main">
        <app-navigation></app-navigation>
      </main>
      
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2025 PROVIAS Nacional - Laboratorio Completo Angular v18</p>
          <p class="tech-stack">
            🚀 Directivas Estructurales | 🎨 Directivas de Atributo | ⚡ Directivas Personalizadas
          </p>
        </div>
      </footer>
    </div>

    <router-outlet />
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      font-size: 3rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    }

    .logo-text h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .logo-text p {
      margin: 0.5rem 0 0 0;
      font-size: 1.2rem;
      opacity: 0.9;
      font-weight: 300;
    }

    .main-nav {
      display: flex;
      gap: 2rem;
    }

    .main-nav a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .main-nav a:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .main-nav a.active {
      background: rgba(255, 255, 255, 0.2);
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    .app-main {
      flex: 1;
      padding: 2rem 0;
    }

    .app-footer {
      background: #2c3e50;
      color: white;
      padding: 2rem 0;
      text-align: center;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .footer-content p {
      margin: 0.5rem 0;
    }

    .tech-stack {
      font-size: 1.1rem;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }
      
      .logo-section {
        flex-direction: column;
        text-align: center;
      }
      
      .logo-text h1 {
        font-size: 2rem;
      }
      
      .logo-text p {
        font-size: 1rem;
      }
      
      .main-nav {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'laboratorio-jarch';
}
