import { Routes } from '@angular/router';
import { ProjectDashboardComponent } from './components/directivas-demo/project-dashboard/project-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // ... rutas anteriores
  { path: 'project-dashboard', component: ProjectDashboardComponent },
  { path: '**', redirectTo: '/home' }
];

