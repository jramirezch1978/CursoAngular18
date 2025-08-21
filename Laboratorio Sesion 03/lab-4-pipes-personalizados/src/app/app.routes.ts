import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PipesShowcaseComponent } from './components/pipes-demo/pipes-showcase.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'pipes', component: PipesShowcaseComponent },
  { path: '**', redirectTo: '/home' }
];
