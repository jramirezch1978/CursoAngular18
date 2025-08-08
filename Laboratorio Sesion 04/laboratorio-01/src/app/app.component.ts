import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectDashboardComponent } from './components/directivas-demo/project-dashboard/project-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProjectDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'laboratorio-01';
}
