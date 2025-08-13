import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, catchError, retry, throwError } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '../interfaces/task.interface';
import { AppConfig } from '../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${AppConfig.api.baseUrl}/tasks`;
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.getAuthToken()
    })
  };

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, this.httpOptions)
      .pipe(
        retry(AppConfig.api.retryAttempts),
        catchError(this.handleError)
      );
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        retry(AppConfig.api.retryAttempts),
        catchError(this.handleError)
      );
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, dto, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, dto, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  uploadAttachment(taskId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(
      `${this.apiUrl}/${taskId}/attachments`,
      formData,
      { headers: new HttpHeaders({ 'Authorization': 'Bearer ' + this.getAuthToken() }) }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private getAuthToken(): string {
    // En producción, obtener de un servicio de autenticación
    return localStorage.getItem('auth_token') || 'mock-token';
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
