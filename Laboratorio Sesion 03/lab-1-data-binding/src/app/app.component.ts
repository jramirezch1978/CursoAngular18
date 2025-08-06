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
  title = 'Sistema de Gestión PROVIAS';
  subtitle = 'Lab 1: Fundamentos de Data Binding';
  currentYear = new Date().getFullYear();

  constructor() {
    console.log('🎯 LAB 1: App Component inicializado');
    console.log('📊 Angular v18 - Standalone Components');
    console.log('🎨 Data Binding Fundamentals');
  }
}