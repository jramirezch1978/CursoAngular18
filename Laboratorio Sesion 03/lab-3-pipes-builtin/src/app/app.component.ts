import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <div class="footer-content">
          <p>© {{ currentYear }} PROVIAS DESCENTRALIZADO - {{ title }}</p>
          <p class="tech-info">🚀 Angular v18 | 🎯 {{ subtitle }} | 💻 Pipes Built-in y Async</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
    }
    
    .main-content {
      flex: 1;
    }
    
    .app-footer {
      background: #1e293b;
      color: white;
      text-align: center;
      padding: 2rem;
    }
    
    .footer-content p {
      margin: 0.5rem 0;
    }
    
    .tech-info {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  `]
})
export class AppComponent {
  title = 'Lab 3: Pipes Built-in y Async';
  subtitle = 'Transformación de Datos y Programación Reactiva';
  currentYear = new Date().getFullYear();

  constructor() {
    console.log('🎯 LAB 3: App Component inicializado');
  }
}