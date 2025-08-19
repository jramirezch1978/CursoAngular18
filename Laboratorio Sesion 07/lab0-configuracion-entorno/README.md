# 🛠️ LAB 0: CONFIGURACIÓN DEL ENTORNO Y HERRAMIENTAS

**PROVIAS DESCENTRALIZADO - ANGULAR v18**  
**Instructor:** Ing. Jhonny Alexander Ramirez Chiroque  
**Duración:** 15 minutos  
**Modalidad:** Preparación del entorno de desarrollo

## 📋 INFORMACIÓN IMPORTANTE

### Pre-requisitos Necesarios
Para realizar los laboratorios de esta sesión necesitas tener:
- ✅ Node.js v18.19.0 o superior instalado
- ✅ Angular CLI v18 instalado globalmente
- ✅ Visual Studio Code
- ✅ Git instalado y configurado

> **Nota:** Si ya tienes un proyecto Angular de sesiones anteriores, puedes usarlo como base. Si NO tienes proyecto base, seguiremos estos pasos para crear uno desde cero.

## 🔧 PASO 1: HERRAMIENTAS Y EXTENSIONES VS CODE

### 1.1 Extensiones VS Code Requeridas

Instala estas extensiones esenciales en VS Code:

```
• Angular Language Service (Angular) - Soporte completo para Angular
• RxJS Snippets (vin-e) - Snippets útiles para RxJS  
• TypeScript Hero (rbbit) - Mejor experiencia TypeScript
• Error Lens (usernamehw) - Visualización de errores en línea
• Thunder Client - Cliente REST para probar APIs
```

### 1.2 Verificar Instalación de Node.js y Angular CLI

```bash
# Verificar versiones
node --version  # Debe ser v18.19.0+
npm --version   # Debe estar actualizado
ng version      # Debe ser Angular CLI 18+

# Si no tienes Angular CLI instalado:
npm install -g @angular/cli@18
```

## 🚀 PASO 2: CREACIÓN DEL PROYECTO BASE

### 2.1 Crear Proyecto Angular

```bash
# Crear proyecto con configuración optimizada para laboratorios
ng new provias-reactive-lab --routing --style=scss --standalone

# Navegar al proyecto
cd provias-reactive-lab
```

### 2.2 Instalar Dependencias Adicionales

```bash
# RxJS (específica versión para compatibilidad)
npm install rxjs@7.8.1

# Dependencias de desarrollo
npm install --save-dev @types/node
npm install --save-dev concurrently
```

## ⚙️ PASO 3: CONFIGURACIÓN DEL PROYECTO

### 3.1 Actualizar tsconfig.json

Actualiza el archivo `tsconfig.json` con esta configuración:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@app/*": ["src/app/*"],
      "@services/*": ["src/app/services/*"],
      "@models/*": ["src/app/models/*"],
      "@components/*": ["src/app/components/*"]
    },
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "dom"],
    "target": "ES2022"
  }
}
```

### 3.2 Configurar HttpClient en app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([])),
    provideAnimations()
  ]
};
```

## 📡 PASO 4: CONFIGURAR API MOCK CON JSON SERVER

### 4.1 Instalar JSON Server

```bash
# Instalar globalmente para simular API REST
npm install -g json-server
```

### 4.2 Crear archivo db.json

Crea el archivo `db.json` en la raíz del proyecto:

```json
{
  "users": [
    { "id": 1, "name": "Ana García", "email": "ana@provias.gob.pe", "role": "admin", "isActive": true },
    { "id": 2, "name": "Carlos López", "email": "carlos@provias.gob.pe", "role": "user", "isActive": true },
    { "id": 3, "name": "María Rodriguez", "email": "maria@provias.gob.pe", "role": "user", "isActive": false }
  ],
  "products": [
    { "id": 1, "name": "Laptop Dell", "price": 2500, "stock": 10, "category": "electronics" },
    { "id": 2, "name": "Mouse Logitech", "price": 50, "stock": 100, "category": "electronics" },
    { "id": 3, "name": "Teclado Mecánico", "price": 150, "stock": 50, "category": "electronics" }
  ],
  "orders": [
    { "id": 1, "userId": 1, "products": [1, 2], "total": 2550, "status": "pending" },
    { "id": 2, "userId": 2, "products": [2, 3], "total": 200, "status": "completed" }
  ],
  "notifications": [
    { "id": 1, "userId": 1, "message": "Nueva orden recibida", "read": false, "type": "info" },
    { "id": 2, "userId": 1, "message": "Pago procesado", "read": false, "type": "success" }
  ]
}
```

### 4.3 Configurar Scripts en package.json

Actualiza la sección `scripts` en `package.json`:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "api": "json-server --watch db.json --port 3000 --delay 500",
    "dev": "concurrently \"npm run api\" \"npm start\"",
    "test": "ng test",
    "test:coverage": "ng test --no-watch --code-coverage"
  }
}
```

### 4.4 Configurar Proxy para API

Crea el archivo `proxy.conf.json` en la raíz:

```json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

### 4.5 Actualizar angular.json para Proxy

En `angular.json`, actualiza la configuración de serve:

```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "configurations": {
    "development": {
      "buildTarget": "provias-reactive-lab:build:development",
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

## 🧪 PASO 5: VERIFICACIÓN DEL ENTORNO

### 5.1 Probar la Configuración

```bash
# Terminal 1: Iniciar JSON Server
npm run api

# Terminal 2: Iniciar Angular con proxy
ng serve --proxy-config proxy.conf.json
```

### 5.2 URLs de Verificación

- **Angular:** http://localhost:4200
- **API Mock:** http://localhost:3000
- **Test API:** http://localhost:4200/api/users

### 5.3 Componente de Prueba de Conectividad

Crea este componente para verificar la conexión:

```typescript
// src/app/test-connection.component.ts
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h2>🔗 Test de Conectividad API</h2>
      <button (click)="testAPI()" [disabled]="loading">
        {{ loading ? 'Probando...' : 'Probar API' }}
      </button>
      <pre *ngIf="result">{{ result | json }}</pre>
    </div>
  `
})
export class TestConnectionComponent {
  private http = inject(HttpClient);
  
  loading = false;
  result: any = null;
  
  async testAPI() {
    this.loading = true;
    try {
      const users = await this.http.get('/api/users').toPromise();
      this.result = { success: true, data: users };
      console.log('✅ API funcionando correctamente:', users);
    } catch (error) {
      this.result = { success: false, error };
      console.error('❌ Error conectando con API:', error);
    } finally {
      this.loading = false;
    }
  }
}
```

## 🎯 SIGUIENTES PASOS

Una vez completada esta configuración, estarás listo para:

1. **LAB 1:** Fundamentos de Asincronía (Callbacks, Promises, Async/Await)
2. **LAB 2:** RxJS y Observables (Patrones reactivos)
3. **LAB 3:** Angular Signals (Nueva API de reactividad)
4. **LAB 4:** Migración y Estado Global (RxJS → Signals)

## 📝 NOTAS IMPORTANTES

- **No saltarse este LAB:** Todos los laboratorios siguientes dependen de esta configuración
- **Mantener JSON Server corriendo:** Los laboratorios requieren la API mock
- **Probar todo:** Verificar que Angular y la API funcionan antes de continuar
- **Documentar problemas:** Si algo no funciona, revisa las versiones de Node.js y Angular CLI

---

**¡Entorno listo para la programación reactiva con Angular 18! 🚀**

> "La diferencia entre una fila de banco tradicional y hacer múltiples transacciones en cajeros automáticos simultáneamente. En el mundo síncrono, todo espera su turno. En el asíncrono, múltiples operaciones ocurren en paralelo, maximizando eficiencia." - Ing. Jhonny Ramirez
