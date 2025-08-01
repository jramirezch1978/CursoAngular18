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
  title = 'Sesión 2 - LAB 1: Ciclo de Vida de Componentes';
  showLifecycleDemo = true;
  inputDataForChild = 'Datos iniciales desde componente padre';
  
  /**
   * 🔄 Toggle para mostrar/ocultar componente y demostrar ngOnDestroy
   */
  toggleLifecycleDemo(): void {
    this.showLifecycleDemo = !this.showLifecycleDemo;
    console.log(`%c🎮 [AppComponent] Demo ${this.showLifecycleDemo ? 'CREADO' : 'DESTRUIDO'}`, 
      'color: purple; font-weight: bold; font-size: 14px;');
  }
  
  /**
   * 🎯 Cambiar datos del input para demostrar ngOnChanges
   */
  updateInputData(): void {
    this.inputDataForChild = `Actualizado desde padre: ${new Date().toLocaleTimeString()}`;
    console.log(`%c📤 [AppComponent] Input data actualizado`, 
      'color: green; font-weight: bold;');
  }
}