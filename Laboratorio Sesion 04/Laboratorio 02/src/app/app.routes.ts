import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/project-dashboard/project-dashboard.component').then(m => m.ProjectDashboardComponent),
    title: 'Dashboard de Proyectos - PROVIAS'
  },
  {
    path: 'demo',
    loadComponent: () => import('./components/project-dashboard/project-dashboard.component').then(m => m.ProjectDashboardComponent),
    title: 'Demo Directivas - Lab 01'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
