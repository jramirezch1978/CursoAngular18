import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskManagerComponent } from './features/task-manager/task-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TaskManagerComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>🏗️ LAB 4: Arquitectura de Servicios Empresariales</h1>
        <p>Repository Pattern, Unit of Work y Global Store con Signals</p>
      </header>
      
      <main class="app-main">
        <app-task-manager></app-task-manager>
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
  title = 'lab4-patterns';
}
