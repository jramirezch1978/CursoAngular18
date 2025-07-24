# Ejemplos Laboratorio 2: Componentes y Servicios

## 1. Generación de Componentes
```bash
ng generate component components/header --standalone
ng generate component components/footer --standalone
ng generate component pages/home --standalone
```

## 2. Ejemplo de Servicio de Datos
```typescript
// src/app/services/data.service.ts
import { Injectable } from '@angular/core';

export interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  technologies: string[];
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private courses: Course[] = [
    { id: 1, title: 'Angular Fundamentals', description: 'Aprende Angular 18', duration: '30h', level: 'Beginner', technologies: ['Angular', 'TypeScript'] }
  ];
  getCourses() { return this.courses; }
}
```

## 3. Uso de Data Binding en Home
```html
<!-- home.component.html -->
<ul>
  <li *ngFor="let course of courses">{{ course.title }} - {{ course.level }}</li>
</ul>
```

## 4. Integración de Componentes
```typescript
// app.component.ts
imports: [HeaderComponent, FooterComponent, HomeComponent]
```

---
¡Experimenta agregando más datos y componentes antes de pasar al Laboratorio 3! 