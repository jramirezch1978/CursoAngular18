import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HighlightDirective } from './directives/highlight.directive';
import { UppercasePipe } from './pipes/uppercase.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    LoginComponent, 
    DashboardComponent, 
    HighlightDirective, 
    UppercasePipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Laboratorio 3 - Angular Avanzado - PROVIAS DESCENTRALIZADO';
}
