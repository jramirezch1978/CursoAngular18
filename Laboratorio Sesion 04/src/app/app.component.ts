import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, KanbanBoardComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <span class="logo-icon">🏗️</span>
            <div class="logo-text">
              <h1>PROVIAS Nacional</h1>
              <p>Laboratorio 04 - Drag & Drop con HostBinding y Renderer2</p>
            </div>
          </div>
        </div>
      </header>
      
      <main class="app-main">
        <app-kanban-board></app-kanban-board>
      </main>
      
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2025 PROVIAS Nacional - Laboratorio Angular v18</p>
          <p class="tech-stack">
            🚀 Angular 18 | 🎯 Signals | 📱 Responsive | 🎨 SCSS
          </p>
        </div>
      </footer>
    </div>
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
    }
  `]
})
export class AppComponent {
  title = 'lab04-drag-drop-kanban';
}