import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectListComponent } from './components/project-list/project-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProjectListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Laboratorio 4 - HTTP Client y RxJS - PROVIAS DESCENTRALIZADO';
}
