import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // LAB 1: Directivas Estructurales Modernas
  // LAB 4: Drag & Drop Kanban (próximamente)
  // { path: 'kanban-board', component: KanbanBoardComponent },
  { path: '**', redirectTo: '/home' }
];

