# Conceptos Clave Laboratorio 2: Componentes y Arquitectura

## Componentes
- Un componente es una unidad funcional y visual reutilizable en Angular.
- Se define con un decorador `@Component` y consta de clase, template y estilos.
- Los componentes standalone no requieren NgModules y son recomendados en Angular v18.

## Servicios e Inyección de Dependencias
- Un servicio encapsula lógica de negocio o acceso a datos y se inyecta en componentes.
- Decorador `@Injectable({ providedIn: 'root' })` para servicios singleton.
- Inyección de dependencias facilita el testing y la reutilización.

## Data Binding
- **Interpolación:** `{{ variable }}` para mostrar datos.
- **Property binding:** `[prop]="valor"` para enlazar propiedades.
- **Event binding:** `(evento)="funcion()"` para manejar eventos.
- **Two-way binding:** `[(ngModel)]="variable"` para sincronización bidireccional.

## Arquitectura Angular
- Basada en componentes, servicios y directivas.
- Uso de interfaces TypeScript para modelar datos.
- Diseño responsive y buenas prácticas de organización.

---
Dominar estos conceptos te permitirá crear aplicaciones Angular robustas y escalables. 