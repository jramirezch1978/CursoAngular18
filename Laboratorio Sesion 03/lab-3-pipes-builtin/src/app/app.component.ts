import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TaskManagerComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>📋 LAB 3: PIPES BUILT-IN Y ASYNC</h1>
        <p>Gestor de Tareas - PROVIAS DESCENTRALIZADO</p>
      </header>
      
      <main class="app-main">
        <app-task-manager></app-task-manager>
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
  title = 'LAB 3: Pipes Built-in y Async';
}