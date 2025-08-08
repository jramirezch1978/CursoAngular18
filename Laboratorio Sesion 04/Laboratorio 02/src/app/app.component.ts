import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <span class="material-icons logo-icon">account_balance</span>
            <div class="logo-text">
              <h1>PROVIAS Nacional</h1>
              <p>Sistema de Gestión de Proyectos</p>
            </div>
          </div>
          
          <nav class="main-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="material-icons">dashboard</span>
              Dashboard
            </a>
            <a routerLink="/demo" routerLinkActive="active">
              <span class="material-icons">science</span>
              Demo Directivas
            </a>
          </nav>
        </div>
      </header>
      
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2024 PROVIAS Nacional - Laboratorio Angular 18 - Directivas de Atributo</p>
          <p class="version">Lab 02 - NgClass, NgStyle, NgModel</p>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Laboratorio 02 - Directivas de Atributo';
}
