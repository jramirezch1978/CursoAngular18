import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Course, Student } from '../../services/data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  studentsCount = 0;
  sessionsCount = 10;
  hoursCount = 30;

  courses: Course[] = [];
  students: Student[] = [];
  statistics: any = {};

  features = [
    {
      icon: '🛠️',
      title: 'Componentes',
      description: 'Aprende a crear componentes reutilizables y modulares'
    },
    {
      icon: '🚀',
      title: 'Signals',
      description: 'Domina la nueva API de Signals para manejo de estado'
    },
    {
      icon: '🧭',
      title: 'Routing',
      description: 'Implementa navegación avanzada entre páginas'
    },
    {
      icon: '🔗',
      title: 'HTTP Client',
      description: 'Conecta con APIs REST de forma eficiente'
    },
    {
      icon: '🎨',
      title: 'Angular Material',
      description: 'Diseña interfaces modernas con Material Design'
    },
    {
      icon: '✅',
      title: 'Testing',
      description: 'Implementa pruebas unitarias y de integración'
    }
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.courses = this.dataService.getCourses();
    this.students = this.dataService.getStudents();
    this.studentsCount = this.students.length;
  }
}
