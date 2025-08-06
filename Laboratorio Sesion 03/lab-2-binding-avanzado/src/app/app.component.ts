import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Lab 2: Binding Avanzado';
  subtitle = 'NgClass, NgStyle y HostListener';
  currentYear = new Date().getFullYear();

  constructor() {
    console.log('🎯 LAB 2: App Component inicializado');
    console.log('📊 Angular v18 - Binding Avanzado');
    console.log('🎨 NgClass, NgStyle, HostListener');
  }
}