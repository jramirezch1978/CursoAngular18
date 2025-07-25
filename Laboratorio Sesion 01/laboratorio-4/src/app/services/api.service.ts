import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  budget: number;
  startDate: Date;
  endDate: Date;
  team: string[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://api.provias.gob.pe';
  private mockProjects: Project[] = [
    {
      id: 1,
      name: 'Carretera Interoceánica',
      description: 'Conectividad vial entre costa y selva',
      status: 'active',
      budget: 5000000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      team: ['Ing. Carlos López', 'Arq. Ana García', 'Téc. Juan Pérez']
    },
    {
      id: 2,
      name: 'Puente Río Amazonas',
      description: 'Construcción de puente colgante',
      status: 'pending',
      budget: 3000000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-06-30'),
      team: ['Ing. María Rodriguez', 'Téc. Luis Silva']
    },
    {
      id: 3,
      name: 'Aeropuerto Regional',
      description: 'Modernización de terminal aérea',
      status: 'completed',
      budget: 8000000,
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-02-28'),
      team: ['Ing. Pedro Torres', 'Arq. Carmen Vega']
    }
  ];

  constructor(private http: HttpClient) {}

  getProjects(): Observable<ApiResponse<Project[]>> {
    // Simulación de llamada HTTP con delay
    return of({
      data: this.mockProjects,
      message: 'Proyectos obtenidos exitosamente',
      success: true
    }).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error obteniendo proyectos:', error);
        return of({
          data: [],
          message: 'Error al obtener proyectos',
          success: false
        });
      })
    );
  }

  getProjectById(id: number): Observable<ApiResponse<Project | null>> {
    const project = this.mockProjects.find(p => p.id === id);
    
    return of({
      data: project || null,
      message: project ? 'Proyecto encontrado' : 'Proyecto no encontrado',
      success: !!project
    }).pipe(
      delay(500),
      catchError(error => {
        console.error('Error obteniendo proyecto:', error);
        return of({
          data: null,
          message: 'Error al obtener proyecto',
          success: false
        });
      })
    );
  }

  createProject(project: Omit<Project, 'id'>): Observable<ApiResponse<Project>> {
    const newProject: Project = {
      ...project,
      id: Math.max(...this.mockProjects.map(p => p.id)) + 1
    };
    
    this.mockProjects.push(newProject);
    
    return of({
      data: newProject,
      message: 'Proyecto creado exitosamente',
      success: true
    }).pipe(
      delay(800),
      catchError(error => {
        console.error('Error creando proyecto:', error);
        return of({
          data: newProject,
          message: 'Error al crear proyecto',
          success: false
        });
      })
    );
  }

  updateProject(id: number, updates: Partial<Project>): Observable<ApiResponse<Project | null>> {
    const index = this.mockProjects.findIndex(p => p.id === id);
    
    if (index !== -1) {
      this.mockProjects[index] = { ...this.mockProjects[index], ...updates };
      
      return of({
        data: this.mockProjects[index],
        message: 'Proyecto actualizado exitosamente',
        success: true
      }).pipe(
        delay(600),
        catchError(error => {
          console.error('Error actualizando proyecto:', error);
          return of({
            data: null,
            message: 'Error al actualizar proyecto',
            success: false
          });
        })
      );
    }
    
    return of({
      data: null,
      message: 'Proyecto no encontrado',
      success: false
    });
  }

  deleteProject(id: number): Observable<ApiResponse<boolean>> {
    const index = this.mockProjects.findIndex(p => p.id === id);
    
    if (index !== -1) {
      this.mockProjects.splice(index, 1);
      
      return of({
        data: true,
        message: 'Proyecto eliminado exitosamente',
        success: true
      }).pipe(
        delay(400),
        catchError(error => {
          console.error('Error eliminando proyecto:', error);
          return of({
            data: false,
            message: 'Error al eliminar proyecto',
            success: false
          });
        })
      );
    }
    
    return of({
      data: false,
      message: 'Proyecto no encontrado',
      success: false
    });
  }
} 