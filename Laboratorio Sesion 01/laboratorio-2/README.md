# Laboratorio 2: Componentes, Servicios y Arquitectura

## Propósito
Crear componentes personalizados, entender la arquitectura de Angular, implementar servicios e inyección de dependencias, y aplicar data binding.

## Pasos Detallados

### 1. Crear Componentes Standalone
```bash
ng generate component components/header --standalone
ng generate component components/footer --standalone
ng generate component pages/home --standalone
```
- Personaliza los archivos `.html` y `.scss` de cada componente según el diseño propuesto.

### 2. Integrar Componentes en la App Principal
- Importa los componentes en `app.component.ts` y actualiza el template para incluir `<app-header>`, `<app-home>`, y `<app-footer>`.

### 3. Crear Servicio de Datos
```bash
ng generate service services/data
```
- Implementa interfaces y lógica de ejemplo en `data.service.ts` para cursos y estudiantes.
- Inyecta el servicio en el componente Home y muestra datos usando data binding y directivas (`*ngFor`).

### 4. Diseño Responsive y Buenas Prácticas
- Aplica estilos SCSS para lograr un diseño profesional y adaptable.
- Usa directivas estructurales y property binding.

## Ejemplo de Código: Servicio de Datos
```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private courses = [/* ... */];
  private students = [/* ... */];
  getCourses() { return this.courses; }
  getStudents() { return this.students; }
}
```

## Checklist de Validación
- [ ] Componentes personalizados creados e integrados
- [ ] Servicio de datos implementado y funcionando
- [ ] Data binding dinámico en Home
- [ ] Diseño responsive aplicado
- [ ] Uso de directivas y property binding
- [ ] Aplicación compila y funciona correctamente

---
¡Componentes y servicios listos! Continúa con el Laboratorio 3 para dominar CLI avanzado y herramientas de desarrollo. 