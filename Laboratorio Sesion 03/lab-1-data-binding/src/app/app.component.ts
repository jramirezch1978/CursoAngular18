import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ProductListComponent } from './components/product-list/product-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProductListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'LAB 1: Fundamentos de Data Binding';
  subtitle = 'PROVIAS DESCENTRALIZADO - Angular v18';
  
  currentYear = new Date().getFullYear();
  
  constructor() {
    console.log('🚀 App Component inicializado - Lab 1: Data Binding');
  }
}