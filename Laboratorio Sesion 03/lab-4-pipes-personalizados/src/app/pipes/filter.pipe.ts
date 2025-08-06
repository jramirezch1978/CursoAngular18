import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
  pure: false // Necesario para arrays que cambian dinámicamente
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, field?: string): any[] {
    if (!items || !searchText) {
      return items;
    }

    const filterValue = searchText.toLowerCase();

    return items.filter(item => {
      if (field) {
        // Buscar en un campo específico
        const fieldValue = this.getNestedProperty(item, field);
        return fieldValue?.toString().toLowerCase().includes(filterValue);
      } else {
        // Buscar en todas las propiedades del objeto
        return this.searchInAllProperties(item, filterValue);
      }
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private searchInAllProperties(obj: any, searchValue: string): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }

    // Convertir a string y buscar
    if (typeof obj === 'string' || typeof obj === 'number') {
      return obj.toString().toLowerCase().includes(searchValue);
    }

    // Si es un array, buscar en cada elemento
    if (Array.isArray(obj)) {
      return obj.some(item => this.searchInAllProperties(item, searchValue));
    }

    // Si es un objeto, buscar en cada propiedad
    if (typeof obj === 'object') {
      return Object.values(obj).some(value => 
        this.searchInAllProperties(value, searchValue)
      );
    }

    return false;
  }
}