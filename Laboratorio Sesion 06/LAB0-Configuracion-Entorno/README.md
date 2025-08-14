# LAB 0: CONFIGURACIÓN DEL ENTORNO Y HERRAMIENTAS
**PROVIAS DESCENTRALIZADO - Angular v18 - Sesión 6**  
**Duración:** 15 minutos  
**Objetivo:** Preparar el entorno específico para trabajar con HttpClient y APIs REST

## 📋 DESCRIPCIÓN DEL LABORATORIO

Este laboratorio prepara tu entorno de desarrollo para trabajar profesionalmente con comunicación HTTP en Angular v18. Es como preparar tu mesa de trabajo antes de empezar un proyecto: tener todas las herramientas necesarias organizadas y funcionando correctamente.

### ¿Por qué es importante este laboratorio?
- **JSON Server**: Simula una API REST real sin necesidad de backend
- **HttpClient**: El cliente HTTP oficial de Angular para comunicación con APIs
- **Interceptors**: Middleware para automatizar tareas comunes en HTTP
- **Variables de entorno**: Configuración diferente para desarrollo y producción

## 🛠️ HERRAMIENTAS Y SOFTWARE NECESARIO

### Software Principal
| Herramienta | Versión Mínima | Verificación | Instalación |
|------------|---------------|--------------|-------------|
| Node.js | v18.19.0 | `node --version` | https://nodejs.org |
| npm | v9.0.0 | `npm --version` | Incluido con Node.js |
| Angular CLI | v18.x | `ng version` | `npm install -g @angular/cli@18` |
| Visual Studio Code | Última | - | https://code.visualstudio.com |
| Git | v2.x | `git --version` | https://git-scm.com |
| Postman/Insomnia | Última | - | https://postman.com |
| JSON Server | Última | `json-server --version` | `npm install -g json-server` |

### 📦 Extensiones VS Code Requeridas
1. **Thunder Client** - Cliente REST integrado en VS Code
2. **Angular Language Service** - IntelliSense para Angular
3. **REST Client** - Archivos .http para testing
4. **Prettier** - Formateo automático
5. **Error Lens** - Errores inline

## 🚀 COMANDOS DE INSTALACIÓN

### Paso 1: Verificar Node.js y npm
```bash
# Verificar versiones instaladas
node --version
npm --version

# Si necesitas instalar Node.js, descarga desde https://nodejs.org
```

### Paso 2: Instalar Angular CLI
```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli@18

# Verificar instalación
ng version
```

### Paso 3: Instalar JSON Server y herramientas
```bash
# Instalar JSON Server globalmente (para simular API REST)
npm install -g json-server

# Instalar concurrently globalmente (para ejecutar múltiples comandos)
npm install -g concurrently

# Verificar instalaciones
json-server --version
concurrently --version
```

### Paso 4: Crear proyecto Angular
```bash
# Crear nuevo proyecto Angular con configuración específica
ng new mi-primera-app-angular --routing --style=scss --standalone --skip-git

# Navegar al proyecto
cd mi-primera-app-angular

# Instalar dependencias adicionales
npm install --save-dev concurrently
```

### Paso 5: Configurar estructura de carpetas
```bash
# Crear estructura necesaria para HTTP
mkdir -p src/app/core/services/http
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/models
mkdir -p src/app/core/utils
mkdir -p src/app/shared/components/loading
mkdir -p src/app/shared/services
mkdir -p src/app/features/products
```

### Paso 6: Crear base de datos mock (db.json)
```bash
# Crear archivo db.json en la raíz del proyecto
touch db.json
```

## 📄 CONTENIDO DEL ARCHIVO db.json

Copia este contenido en el archivo `db.json`:

```json
{
  "products": [
    {
      "id": 1,
      "name": "Laptop Dell XPS 13",
      "price": 1299.99,
      "description": "Ultrabook premium con procesador Intel Core i7",
      "category": "laptops",
      "stock": 15,
      "imageUrl": "https://via.placeholder.com/300x200",
      "createdAt": "2025-08-01T10:00:00Z",
      "updatedAt": "2025-08-14T15:30:00Z"
    },
    {
      "id": 2,
      "name": "Monitor LG 27\" 4K",
      "price": 449.99,
      "description": "Monitor IPS 4K con HDR10",
      "category": "monitors",
      "stock": 23,
      "imageUrl": "https://via.placeholder.com/300x200",
      "createdAt": "2025-08-02T11:00:00Z",
      "updatedAt": "2025-08-14T16:00:00Z"
    },
    {
      "id": 3,
      "name": "Teclado Mecánico RGB",
      "price": 129.99,
      "description": "Teclado gaming con switches Cherry MX",
      "category": "accessories",
      "stock": 45,
      "imageUrl": "https://via.placeholder.com/300x200",
      "createdAt": "2025-08-03T09:00:00Z",
      "updatedAt": "2025-08-14T14:00:00Z"
    }
  ],
  "users": [
    {
      "id": 1,
      "email": "admin@provias.gob.pe",
      "password": "admin123",
      "role": "admin",
      "name": "Administrador PROVIAS"
    },
    {
      "id": 2,
      "email": "user@provias.gob.pe",
      "password": "user123",
      "role": "user",
      "name": "Usuario PROVIAS"
    }
  ],
  "orders": [],
  "categories": [
    { "id": 1, "name": "laptops", "description": "Laptops y notebooks" },
    { "id": 2, "name": "monitors", "description": "Monitores y pantallas" },
    { "id": 3, "name": "accessories", "description": "Accesorios de computadora" }
  ]
}
```

## ⚙️ CONFIGURACIÓN DE JSON SERVER

### Crear archivo json-server.json:
```json
{
  "port": 3000,
  "watch": true,
  "delay": 500,
  "routes": "routes.json"
}
```

### Crear archivo routes.json:
```json
{
  "/api/*": "/$1"
}
```

## 📝 ACTUALIZAR package.json

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "server": "json-server --watch db.json --port 3000 --delay 500",
    "dev": "concurrently \"npm run server\" \"ng serve\"",
    "test": "ng test",
    "test:http": "ng test --include='**/services/**/*.spec.ts'",
    "lint": "ng lint"
  }
}
```

## 🔧 CONFIGURAR HttpClient EN ANGULAR

### Actualizar src/app/app.config.ts:
```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([])  // Aquí agregaremos interceptors más tarde
    ),
    provideAnimations()
  ]
};
```

## 🌍 CONFIGURAR VARIABLES DE ENTORNO

### Actualizar src/environments/environment.development.ts:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'PROVIAS Angular App - DEV',
  version: '1.0.0',
  features: {
    enableLogging: true,
    enableDebugMode: true,
    enableCache: true,
    cacheTimeout: 300000 // 5 minutos
  },
  retry: {
    count: 3,
    delay: 1000,
    maxDelay: 5000
  }
};
```

### Actualizar src/environments/environment.ts:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.provias.gob.pe/v1',
  appName: 'PROVIAS Angular App',
  version: '1.0.0',
  features: {
    enableLogging: false,
    enableDebugMode: false,
    enableCache: true,
    cacheTimeout: 600000 // 10 minutos
  },
  retry: {
    count: 3,
    delay: 1000,
    maxDelay: 5000
  }
};
```

## ✅ VERIFICACIÓN DEL ENTORNO

### Paso 1: Iniciar JSON Server
```bash
# En una terminal
npm run server

# Debería mostrar: JSON Server is running on port 3000
```

### Paso 2: Probar API con curl o navegador
```bash
# GET todos los productos
curl http://localhost:3000/api/products

# GET un producto específico
curl http://localhost:3000/api/products/1

# Verificar en navegador
# http://localhost:3000/api/products
```

### Paso 3: Iniciar aplicación Angular
```bash
# En otra terminal
ng serve

# O usar el comando combinado
npm run dev
```

## 🔍 COMANDOS DE TESTING

```bash
# Probar POST nuevo producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Mouse Logitech","price":29.99,"category":"accessories","stock":100}'

# Probar PUT actualizar producto
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Laptop Dell XPS 13 - Actualizada","price":1399.99,"category":"laptops","stock":10}'

# Probar DELETE eliminar producto
curl -X DELETE http://localhost:3000/api/products/3
```

## ✅ CHECKLIST DE VERIFICACIÓN LAB 0

- [ ] Node.js v18+ instalado y funcionando
- [ ] Angular CLI v18 instalado globalmente
- [ ] JSON Server instalado y configurado
- [ ] Base de datos mock (db.json) creada y poblada
- [ ] HttpClient configurado en app.config.ts
- [ ] Estructura de carpetas HTTP creada
- [ ] Variables de entorno configuradas correctamente
- [ ] API mock respondiendo en http://localhost:3000
- [ ] Scripts npm configurados en package.json
- [ ] VS Code con extensiones recomendadas instaladas
- [ ] Proyecto compilando sin errores (`ng serve`)
- [ ] JSON Server corriendo sin errores (`npm run server`)
- [ ] Comando combinado funcionando (`npm run dev`)

## 🚀 ¿QUÉ SIGUE?

Una vez completado este LAB 0, tendrás:

1. **Entorno completo**: Todas las herramientas necesarias funcionando
2. **API mock**: Servidor JSON simulando un backend real
3. **Proyecto base**: Angular configurado con HttpClient
4. **Variables de entorno**: Configuración para desarrollo y producción
5. **Scripts automatizados**: Comandos npm para tareas comunes

**Siguiente paso:** LAB 1 - Implementación de HttpClient y CRUD completo

## 📚 CONCEPTOS EDUCATIVOS CLAVE

### ¿Qué es JSON Server?
JSON Server es una herramienta que crea una API REST completa a partir de un archivo JSON. Es perfecto para:
- **Prototipado rápido**: No necesitas un backend real para empezar
- **Testing**: Datos consistentes y controlados
- **Desarrollo frontend**: Puedes trabajar independientemente del backend
- **Demostaciones**: APIs funcionales para presentaciones

### ¿Por qué usar HttpClient en lugar de fetch()?
HttpClient de Angular ofrece:
- **Integración con RxJS**: Observables para programación reactiva
- **Interceptors**: Middleware automático para todas las peticiones
- **Tipado fuerte**: TypeScript para mayor seguridad
- **Testing**: Herramientas integradas para pruebas
- **Error handling**: Manejo robusto de errores

### ¿Qué son las variables de entorno?
Las variables de entorno permiten:
- **Configuración por ambiente**: Diferentes URLs para desarrollo/producción
- **Seguridad**: Mantener secrets fuera del código
- **Flexibilidad**: Cambiar comportamiento sin recompilar
- **Mantenimiento**: Configuración centralizada

¡Listo para empezar con comunicación HTTP profesional en Angular v18! 🎉
