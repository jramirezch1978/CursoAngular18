import { Observable } from 'rxjs';

export interface Entity {
  id: string;
}

export abstract class Repository<T extends Entity> {
  abstract getAll(): Observable<T[]>;
  abstract getById(id: string): Observable<T | null>;
  abstract create(entity: Omit<T, 'id'>): Observable<T>;
  abstract update(id: string, entity: Partial<T>): Observable<T>;
  abstract delete(id: string): Observable<boolean>;
  abstract exists(id: string): Observable<boolean>;
  abstract count(): Observable<number>;
  abstract query(criteria: any): Observable<T[]>;
}
