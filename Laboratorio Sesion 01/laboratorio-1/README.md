# Laboratorio 1: Creación del Primer Proyecto Angular

## Propósito
Crear, configurar y ejecutar tu primer proyecto Angular v18, comprendiendo la estructura de archivos y personalizando la aplicación base.

## Pasos Detallados

### 1. Crear Directorio de Trabajo
```bash
# Windows
mkdir C:\Angular-Projects
cd C:\Angular-Projects
# macOS/Linux
mkdir ~/Angular-Projects
cd ~/Angular-Projects
```

### 2. Crear Nuevo Proyecto Angular
```bash
ng new mi-primera-app-angular --routing --style=scss --skip-git=false --package-manager=npm
```
- Responde a los prompts:
  - ¿Add Angular routing? → Yes (Y)
  - ¿Stylesheet format? → SCSS

### 3. Explorar y Personalizar Archivos Principales
- Navega al proyecto:
  ```bash
  cd mi-primera-app-angular
  code .
  ```
- Modifica `app.component.html` y `app.component.scss` para personalizar el mensaje de bienvenida y los estilos.

### 4. Ejecutar y Probar la Aplicación
```bash
ng serve
```
- Abre [http://localhost:4200](http://localhost:4200) en tu navegador.
- Prueba el hot reload modificando el template y guardando los cambios.

## Ejemplo de Código Personalizado
```html
<!-- app.component.html -->
<div class="main-container">
  <h1>¡Bienvenidos a Angular 18!</h1>
  <h2>{{ title }}</h2>
  <p>Mi primera aplicación Angular está funcionando perfectamente.</p>
</div>
<router-outlet></router-outlet>
```

## Checklist de Validación
- [ ] Proyecto Angular v18 creado exitosamente
- [ ] Estructura de archivos comprendida
- [ ] Personalización básica aplicada
- [ ] Servidor de desarrollo funcionando
- [ ] Hot reload operativo
- [ ] Aplicación visible en navegador

---
¡Primer proyecto listo! Continúa con el Laboratorio 2 para crear componentes y servicios. 