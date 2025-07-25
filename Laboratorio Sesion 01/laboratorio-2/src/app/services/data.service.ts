import { Injectable } from '@angular/core';

export interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  technologies: string[];
}

export interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private courses: Course[] = [
    {
      id: 1,
      title: 'Angular Fundamentals',
      description: 'Aprende los conceptos básicos de Angular 18',
      duration: '30 horas',
      level: 'Beginner',
      technologies: ['Angular', 'TypeScript', 'RxJS']
    },
    {
      id: 2,
      title: 'Advanced Angular',
      description: 'Técnicas avanzadas y mejores prácticas',
      duration: '40 horas',
      level: 'Advanced',
      technologies: ['Angular', 'NgRx', 'Testing', 'Performance']
    },
    {
      id: 3,
      title: 'Angular with .NET',
      description: 'Integración completa con backend .NET',
      duration: '50 horas',
      level: 'Intermediate',
      technologies: ['Angular', '.NET Core', 'Entity Framework', 'SignalR']
    }
  ];

  private students: Student[] = [
    {
      id: 1,
      name: 'Ana García',
      email: 'ana.garcia@provias.gob.pe',
      course: 'Angular Fundamentals',
      progress: 75
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos.lopez@provias.gob.pe',
      course: 'Advanced Angular',
      progress: 45
    },
    {
      id: 3,
      name: 'María Rodriguez',
      email: 'maria.rodriguez@provias.gob.pe',
      course: 'Angular with .NET',
      progress: 90
    }
  ];

  getCourses(): Course[] {
    return this.courses;
  }

  getStudents(): Student[] {
    return this.students;
  }
}
