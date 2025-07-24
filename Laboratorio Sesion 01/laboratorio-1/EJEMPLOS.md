# Ejemplos Laboratorio 1: Código y Comandos

## 1. Estructura de Archivos Generada
```
mi-primera-app-angular/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/
│   ├── environments/
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
└── ...
```

## 2. Personalización de app.component.html
```html
<div class="main-container">
  <h1>¡Bienvenidos a Angular 18!</h1>
  <h2>{{ title }}</h2>
  <p>Mi primera aplicación Angular está funcionando perfectamente.</p>
</div>
<router-outlet></router-outlet>
```

## 3. Comando para iniciar el servidor
```bash
ng serve
# Abre http://localhost:4200 en tu navegador
```

## 4. Hot Reload
- Modifica el texto en `app.component.html` y guarda.
- El navegador se actualizará automáticamente.

---
¡Sigue experimentando y personalizando antes de pasar al Laboratorio 2! 