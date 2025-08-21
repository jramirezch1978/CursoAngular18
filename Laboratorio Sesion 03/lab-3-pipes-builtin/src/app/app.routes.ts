import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'tasks', component: TaskManagerComponent },
  { path: '**', redirectTo: '/home' }
];
