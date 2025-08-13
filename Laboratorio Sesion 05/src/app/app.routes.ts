import { Routes } from '@angular/router';
import { TaskListComponent } from './features/task-manager/task-list/task-list.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskFormComponent } from './features/task-manager/task-form/task-form.component';
import { NotificationsComponent } from './features/notifications/notifications.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    title: 'Dashboard - LAB 1 PROVIAS'
  },
  { 
    path: 'task-list', 
    component: TaskListComponent,
    title: 'Lista de Tareas - LAB 1 PROVIAS'
  },
  { 
    path: 'task-form', 
    component: TaskFormComponent,
    title: 'Crear Tarea - LAB 1 PROVIAS'
  },
  { 
    path: 'notifications', 
    component: NotificationsComponent,
    title: 'Notificaciones - LAB 1 PROVIAS'
  },
  { path: '**', redirectTo: '/dashboard' }
];