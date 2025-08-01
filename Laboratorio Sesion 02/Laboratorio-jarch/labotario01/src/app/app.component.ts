import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LifecycleDemoComponent } from './components/lifecycle-demo/lifecycle-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LifecycleDemoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Sesión 2 - Componentes y Enrutamiento';
  showLifecycleDemo = true;
  
  toggleLifecycleDemo(): void {
    this.showLifecycleDemo = !this.showLifecycleDemo;
  }
}
