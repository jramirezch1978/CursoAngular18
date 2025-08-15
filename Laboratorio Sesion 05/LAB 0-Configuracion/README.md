# LAB 0: CONFIGURACIÓN DEL ENTORNO Y VERIFICACIÓN

**Duración:** 15 minutos  
**Objetivo:** Preparar el entorno específico para trabajar con Servicios e Inyección de Dependencias

## 🔧 PASO 1: Verificación del Proyecto Base (5 minutos)

### 1.1 Verificar proyecto existente

```bash
# Navegar al proyecto
cd mi-primera-app-angular

# Verificar branch de trabajo
git status

# Si no está en git, inicializar:
git init
git add .
git commit -m "Estado inicial Sesión 5"

# Crear branch para esta sesión
git checkout -b sesion-5-servicios
```

### 1.2 Actualizar dependencias necesarias

```bash
# Actualizar Angular a la última versión 18.x
ng update @angular/core @angular/cli

# Instalar dependencias adicionales para esta sesión
npm install --save @angular/animations
npm install --save-dev @angular-devkit/build-angular

# Verificar signals (debe estar incluido en Angular 18)
ng version
```

### 1.3 Verificar estructura de carpetas

```bash
# Crear estructura necesaria para la sesión
mkdir -p src/app/core/services
mkdir -p src/app/core/interfaces
mkdir -p src/app/core/tokens
mkdir -p src/app/core/providers
mkdir -p src/app/shared/services
mkdir -p src/app/features/task-manager
mkdir -p src/app/features/user-management
```

## ⚙️ PASO 2: Configuración de VS Code para Servicios (5 minutos)

### 2.1 Crear/Actualizar configuración del workspace

Crear archivo `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit",
    "source.fixAll": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "angular.enable-strict-mode-prompt": false,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 2000,
  "angular.schematicsDefaultOptions": {
    "service": {
      "flat": false,
      "skipTests": false
    },
    "component": {
      "standalone": true,
      "changeDetection": "OnPush"
    }
  }
}
```

### 2.2 Configurar snippets personalizados para servicios

Crear archivo `.vscode/angular-services.code-snippets`:

```json
{
  "Angular Service with Signals": {
    "prefix": "a-service-signals",
    "body": [
      "import { Injectable, signal, computed } from '@angular/core';",
      "",
      "@Injectable({",
      "  providedIn: 'root'",
      "})",
      "export class ${1:ServiceName}Service {",
      "  // State signals",
      "  private ${2:items}Signal = signal<${3:Item}[]>([]);",
      "  private loadingSignal = signal<boolean>(false);",
      "  private errorSignal = signal<string | null>(null);",
      "",
      "  // Public computed signals",
      "  ${2:items} = computed(() => this.${2:items}Signal());",
      "  loading = computed(() => this.loadingSignal());",
      "  error = computed(() => this.errorSignal());",
      "",
      "  constructor() {",
      "    console.log('${1:ServiceName}Service initialized');",
      "  }",
      "}"
    ],
    "description": "Create an Angular service with signals"
  }
}
```

## 🌐 PASO 3: Configuración de Angular DevTools (3 minutos)

### 3.1 Instalar Angular DevTools

1. Abrir Chrome/Edge
2. Ir a chrome://extensions/ o edge://extensions/
3. Buscar "Angular DevTools"
4. Instalar la extensión oficial
5. Reiniciar el navegador

### 3.2 Verificar funcionamiento

```bash
# Iniciar la aplicación
ng serve --open

# En el navegador:
# 1. Abrir DevTools (F12)
# 2. Verificar pestaña "Angular"
# 3. Navegar a "Injector Tree" para ver jerarquía de servicios
```

## 📁 PASO 4: Crear Archivo de Configuración Global (2 minutos)

Crear archivo `src/app/core/config/app.config.ts`:

```typescript
// Configuración global de la aplicación
export const AppConfig = {
  // API Configuration
  api: {
    baseUrl: 'https://api.provias.gob.pe/v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Cache Configuration
  cache: {
    defaultTTL: 300000, // 5 minutos
    maxSize: 100,
    strategy: 'memory' as 'memory' | 'localStorage' | 'sessionStorage'
  },
  
  // Logging Configuration
  logging: {
    level: 'debug' as 'debug' | 'info' | 'warn' | 'error',
    enableRemote: false,
    remoteUrl: 'https://logs.provias.gob.pe'
  },
  
  // Feature Flags
  features: {
    enableSignals: true,
    enableStandalone: true,
    enableNewTaskManager: true,
    enableAdvancedReporting: false
  },
  
  // Application Metadata
  app: {
    name: 'PROVIAS Task Management System',
    version: '2.0.0',
    environment: 'development'
  }
};
```

## ✅ CHECKLIST DE VERIFICACIÓN LAB 0

- [ ] Node.js v18+ instalado y funcionando
- [ ] Angular CLI v18 instalado globalmente
- [ ] Proyecto base de sesiones anteriores funcionando
- [ ] VS Code con todas las extensiones instaladas
- [ ] Angular DevTools funcionando en navegador
- [ ] Estructura de carpetas para servicios creada
- [ ] Snippets de servicios configurados
- [ ] Branch git para sesión 5 creado
- [ ] Servidor de desarrollo ejecutándose sin errores

## 🎯 ¡Listo para LAB 1!

Con el entorno configurado, estás preparado para dominar la inyección de dependencias moderna y crear servicios reactivos con Signals.
