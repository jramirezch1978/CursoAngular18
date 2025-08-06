import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false // Para actualizar automáticamente con el tiempo
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    const now = new Date();
    const date = new Date(value);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) {
      return 'En el futuro';
    }

    if (seconds < 30) {
      return 'Justo ahora';
    }

    const intervals = [
      { label: 'año', seconds: 31536000, plural: 'años' },
      { label: 'mes', seconds: 2592000, plural: 'meses' },
      { label: 'semana', seconds: 604800, plural: 'semanas' },
      { label: 'día', seconds: 86400, plural: 'días' },
      { label: 'hora', seconds: 3600, plural: 'horas' },
      { label: 'minuto', seconds: 60, plural: 'minutos' },
      { label: 'segundo', seconds: 1, plural: 'segundos' }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        const label = count === 1 ? interval.label : interval.plural;
        return `hace ${count} ${label}`;
      }
    }

    return 'hace un momento';
  }
}