import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="main-header">
      <div class="brand-section">
        <div class="logo">
          <div class="logo-text">
            <h1>{{ title }}</h1>
            <p>{{ subtitle }}</p>
          </div>
        </div>
      </div>

      <nav class="navigation">
        <a routerLink="/home" routerLinkActive="active" class="nav-link">🏠 Inicio</a>
        <a routerLink="/tasks" routerLinkActive="active" class="nav-link">📋 Tareas</a>
        <a href="#" (click)="onContactClick(); $event.preventDefault()" class="nav-link">📞 Contacto</a>
      </nav>
    </header>
  `,
  styles: [`
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #1e3a8a, #3b82f6);
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .brand-section .logo .logo-text h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .brand-section .logo .logo-text p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .navigation {
      display: flex;
      gap: 1.5rem;
    }
    
    .nav-link {
      padding: 0.75rem 1.25rem;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
    
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }
    
    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    @media (max-width: 768px) {
      .main-header {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }
    }
  `]
})
export class HeaderComponent {
  title = 'PROVIAS DESCENTRALIZADO';
  subtitle = 'Lab 3: Pipes Built-in y Async';

  onContactClick(): void {
    alert('📞 Contacto PROVIAS\n📧 info@provias.gob.pe\n📱 (01) 615-7800\n\n🎯 Lab 3: Pipes Built-in y Async\nDemostración de transformación de datos');
  }
}
