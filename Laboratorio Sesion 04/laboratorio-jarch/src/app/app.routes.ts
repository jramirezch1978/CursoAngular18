import { Routes } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ProjectDashboardComponent } from './components/directivas-demo/project-dashboard/project-dashboard.component';
import { ThemeConfiguratorComponent } from './components/directivas-demo/theme-configurator/theme-configurator.component';
import { CustomDirectivesComponent } from './components/directivas-demo/custom-directives/custom-directives.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: NavigationComponent },
  // LAB 1: Directivas Estructurales Modernas
  { path: 'project-dashboard', component: ProjectDashboardComponent },
  // LAB 2: Directivas de Atributo Avanzadas
  { path: 'theme-configurator', component: ThemeConfiguratorComponent },
  // LAB 3: Directivas Personalizadas
  { path: 'custom-directives', component: CustomDirectivesComponent },
  // LAB 4: Drag & Drop Kanban (próximamente)
  // { path: 'kanban-board', component: KanbanBoardComponent },
  { path: '**', redirectTo: '/home' }
];

