import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
  pure: true
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string, 
    limit: number = 25, 
    trail: string = '...', 
    wordBoundary: boolean = false
  ): string {
    if (!value) return '';
    
    if (value.length <= limit) {
      return value;
    }

    if (wordBoundary) {
      // Truncar en límite de palabra
      const truncated = value.substring(0, limit);
      const lastSpace = truncated.lastIndexOf(' ');
      
      if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + trail;
      }
    }

    return value.substring(0, limit) + trail;
  }
}