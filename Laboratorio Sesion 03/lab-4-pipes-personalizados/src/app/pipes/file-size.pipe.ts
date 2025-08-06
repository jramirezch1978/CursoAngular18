import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true,
  pure: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number, decimals: number = 2, units: 'binary' | 'decimal' = 'binary'): string {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 0) return 'Invalid size';

    const k = units === 'binary' ? 1024 : 1000;
    const dm = decimals < 0 ? 0 : decimals;
    
    const sizes = units === 'binary' 
      ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
      : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${size} ${sizes[i]}`;
  }
}