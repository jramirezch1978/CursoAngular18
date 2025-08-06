import { Pipe, PipeTransform } from '@angular/core';

type SortDirection = 'asc' | 'desc';

@Pipe({
  name: 'sortBy',
  standalone: true,
  pure: false
})
export class SortByPipe implements PipeTransform {
  transform(
    array: any[], 
    field: string, 
    direction: SortDirection = 'asc',
    dataType: 'string' | 'number' | 'date' = 'string'
  ): any[] {
    if (!array || !field) {
      return array;
    }

    const sortedArray = [...array].sort((a, b) => {
      const aValue = this.getNestedProperty(a, field);
      const bValue = this.getNestedProperty(b, field);

      let comparison = 0;

      switch (dataType) {
        case 'number':
          comparison = (Number(aValue) || 0) - (Number(bValue) || 0);
          break;
          
        case 'date':
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          comparison = aDate.getTime() - bDate.getTime();
          break;
          
        default: // string
          const aStr = (aValue || '').toString().toLowerCase();
          const bStr = (bValue || '').toString().toLowerCase();
          comparison = aStr.localeCompare(bStr);
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return sortedArray;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}