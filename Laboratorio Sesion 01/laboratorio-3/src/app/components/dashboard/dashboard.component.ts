import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightDirective } from '../../directives/highlight.directive';
import { UppercasePipe } from '../../pipes/uppercase.pipe';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HighlightDirective, UppercasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;

  stats = {
    totalUsers: 150,
    activeProjects: 25,
    completedTasks: 89,
    pendingTasks: 12
  };

  recentActivities = [
    { id: 1, action: 'Usuario registrado', user: 'Ana García', time: '2 minutos' },
    { id: 2, action: 'Proyecto actualizado', user: 'Carlos López', time: '15 minutos' },
    { id: 3, action: 'Tarea completada', user: 'María Rodriguez', time: '1 hora' },
    { id: 4, action: 'Reporte generado', user: 'Juan Pérez', time: '2 horas' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
} 