# LAB 0: CONFIGURACIÓN DEL ENTORNO Y VERIFICACIÓN

## 🎯 Objetivo
Preparar el entorno específico para trabajar con Directivas avanzadas en Angular 18

## ⏱️ Duración: 15 minutos

## 📋 Conceptos Clave

### 1. Entorno de Desarrollo Angular 18
- **Node.js v18+**: Runtime base para Angular CLI
- **Angular CLI v18**: Herramientas de desarrollo y build
- **Angular DevTools**: Extensión crítica para debugging de directivas
- **VS Code Extensions**: Angular Language Service, Angular Snippets

### 2. Directivas en Angular 18
- **Nuevas directivas de control flow**: @if, @for, @switch
- **Directivas standalone**: Arquitectura modular sin NgModules
- **Tree-shaking mejorado**: Eliminación de código no utilizado

### 3. Estructura de Proyecto para Directivas
```
src/app/
├── directives/
│   ├── structural/     # Directivas estructurales personalizadas
│   ├── attribute/      # Directivas de atributo personalizadas
│   └── custom/         # Directivas complejas
├── components/
│   └── directivas-demo/
├── interfaces/         # Tipos para demos
└── utils/              # Utilidades compartidas
```

## 🛠️ Implementación Paso a Paso

### PASO 1: Verificación del Proyecto Base (5 minutos)

```bash
# Navegar al proyecto
cd mi-primera-app-angular

# Verificar branch de trabajo
git status
# Si no está en git, inicializar:
git init
git add .
git commit -m "Estado inicial Sesión 4"

# Crear branch para esta sesión
git checkout -b sesion-4-directivas
```

**Actualizar dependencias necesarias:**
```bash
# Actualizar Angular a la última versión 18.x
ng update @angular/core @angular/cli

# Instalar dependencias adicionales para esta sesión
npm install --save intersection-observer
npm install --save-dev @types/intersection-observer

# Verificar FormsModule (necesario para NgModel)
npm list @angular/forms
```

**Verificar estructura de carpetas:**
```bash
# Crear estructura necesaria para la sesión
mkdir -p src/app/directives/structural
mkdir -p src/app/directives/attribute
mkdir -p src/app/directives/custom
mkdir -p src/app/components/directivas-demo
mkdir -p src/app/interfaces
mkdir -p src/app/utils
```

### PASO 2: Configuración de VS Code para Directivas (5 minutos)

**Crear/Actualizar configuración del workspace:**

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
  "editor.snippetSuggestions": "top",
  "emmet.includeLanguages": {
    "typescript": "html"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "angular.schematicsDefaultOptions": {
    "directive": {
      "standalone": true
    }
  }
}
```

**Configurar snippets personalizados para directivas:**

Crear archivo `.vscode/angular-directives.code-snippets`:
```json
{
  "Angular Directive": {
    "prefix": "a-directive",
    "body": [
      "import { Directive, ElementRef, HostListener, HostBinding, Input, Renderer2 } from '@angular/core';",
      "",
      "@Directive({",
      "  selector: '[app${1:DirectiveName}]',",
      "  standalone: true",
      "})",
      "export class ${2:DirectiveName}Directive {",
      "  @Input() app${2:DirectiveName} = '';",
      "",
      "  constructor(",
      "    private el: ElementRef,",
      "    private renderer: Renderer2",
      "  ) {}",
      "",
      "  @HostListener('${3:event}')",
      "  on${4:Event}() {",
      "    ${5:// Implementation}",
      "  }",
      "}"
    ],
    "description": "Crear una directiva Angular personalizada"
  },
  "Structural Directive": {
    "prefix": "a-structural",
    "body": [
      "import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';",
      "",
      "@Directive({",
      "  selector: '[app${1:StructuralName}]',",
      "  standalone: true",
      "})",
      "export class ${2:StructuralName}Directive {",
      "  private hasView = false;",
      "",
      "  constructor(",
      "    private templateRef: TemplateRef<any>,",
      "    private viewContainer: ViewContainerRef",
      "  ) {}",
      "",
      "  @Input() set app${2:StructuralName}(condition: boolean) {",
      "    if (condition && !this.hasView) {",
      "      this.viewContainer.createEmbeddedView(this.templateRef);",
      "      this.hasView = true;",
      "    } else if (!condition && this.hasView) {",
      "      this.viewContainer.clear();",
      "      this.hasView = false;",
      "    }",
      "  }",
      "}"
    ],
    "description": "Crear una directiva estructural personalizada"
  }
}
```

### PASO 3: Configuración de Angular DevTools (3 minutos)

**Instalar Angular DevTools:**
1. Abrir Chrome/Edge
2. Ir a `chrome://extensions/` o `edge://extensions/`
3. Buscar "Angular DevTools"
4. Instalar la extensión oficial
5. Reiniciar el navegador

**Verificar funcionamiento:**
```bash
# Iniciar la aplicación
ng serve --open

# En el navegador:
# 1. Abrir DevTools (F12)
# 2. Verificar pestaña "Angular"
# 3. Debe mostrar el árbol de componentes
```

### PASO 4: Crear Archivo de Configuración Global (2 minutos)

Crear archivo `src/app/config/directives.config.ts`:
```typescript
// Configuración global para directivas
export const DirectivesConfig = {
  // Configuración para tooltips
  tooltip: {
    defaultPosition: 'top' as const,
    showDelay: 500,
    hideDelay: 100,
    maxWidth: 200
  },
  
  // Configuración para lazy loading
  lazyLoad: {
    rootMargin: '50px',
    threshold: 0.1,
    defaultPlaceholder: 'assets/images/placeholder.jpg'
  },
  
  // Configuración para drag & drop
  dragDrop: {
    dragClass: 'dragging',
    dropClass: 'drop-zone',
    overClass: 'drag-over'
  },
  
  // Configuración para validación
  validation: {
    showErrorsOnBlur: true,
    showErrorsOnSubmit: true,
    errorClass: 'field-error',
    successClass: 'field-success'
  }
};
```

## ✅ CHECKLIST DE VERIFICACIÓN LAB 0

- [ ] Node.js v18+ instalado y funcionando
- [ ] Angular CLI v18 instalado globalmente  
- [ ] Proyecto base de sesiones anteriores funcionando
- [ ] VS Code con todas las extensiones instaladas
- [ ] Angular DevTools funcionando en navegador
- [ ] Estructura de carpetas para directivas creada
- [ ] Snippets de directivas configurados
- [ ] Branch git para sesión 4 creado
- [ ] Servidor de desarrollo ejecutándose sin errores

## 🎓 Conocimientos Adquiridos

Al completar este laboratorio habrás:
- ✅ Configurado un entorno optimizado para desarrollo con directivas
- ✅ Preparado herramientas de debugging especializadas
- ✅ Establecido una estructura de proyecto escalable
- ✅ Creado snippets para desarrollo rápido de directivas

## 🚀 Siguiente Paso

Una vez completada la configuración, estarás listo para el **LAB 1: Directivas Estructurales Modernas** donde implementarás el nuevo control flow de Angular 18 (@if, @for, @switch).

---

*Este laboratorio establece las bases técnicas para una sesión intensiva de 3 horas enfocada en directivas avanzadas. La configuración correcta del entorno es crucial para el éxito de los laboratorios posteriores.*
