import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserDashboardComponent } from './features/user-management/user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UserDashboardComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>🏢 PROVIAS - Sistema de Gestión de Usuarios</h1>
        <p>Componentes Standalone con Signals</p>
      </header>
      
      <main class="app-main">
        <app-user-dashboard></app-user-dashboard>
      </main>
      
      <router-outlet />
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .app-header {
      background: white;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h1 {
        color: #2c3e50;
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
      }
      
      p {
        color: #7f8c8d;
        margin: 0;
      }
    }
    
    .app-main {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  title = 'lab2-standalone';
}
