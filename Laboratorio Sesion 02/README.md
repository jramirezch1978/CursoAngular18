# 🏗️ SESIÓN 02: COMPONENTES Y ENRUTAMIENTO - ANGULAR v18
**PROVIAS DESCENTRALIZADO - Curso Angular v18**

---

## 📋 INFORMACIÓN GENERAL

- **Curso:** Angular v18 - 30 horas académicas
- **Modalidad:** 100% Online Live - Formato Laboratorio Intensivo
- **Instructor:** Ing. Jhonny Alexander Ramirez Chiroque
- **Sesión:** 2 - Componentes y Enrutamiento
- **Duración Total:** 180 minutos (5 laboratorios de 30-35 min c/u)
- **Metodología:** 100% Práctica - Código desde el primer minuto

---

## 🎯 OBJETIVOS DE LA SESIÓN

Al completar esta sesión, los estudiantes serán capaces de:

✅ **Dominar el ciclo de vida de componentes Angular**
- Implementar todos los lifecycle hooks correctamente
- Optimizar el rendimiento mediante limpieza adecuada de recursos
- Entender cuándo usar cada hook para diferentes casos de uso

✅ **Implementar comunicación efectiva entre componentes**
- Comunicación Parent → Child via @Input
- Comunicación Child → Parent via @Output  
- Comunicación entre siblings via Services
- Manejo de estado global reactivo

✅ **Configurar navegación SPA profesional**
- Rutas básicas y parametrizadas
- Guards de autenticación y autorización
- Lazy loading para optimización
- Manejo de errores 404

✅ **Construir una Single Page Application completa**
- Layout responsivo profesional
- Sistema de autenticación funcional
- Navegación fluida sin recargas
- Arquitectura escalable y mantenible

---

## 🧪 ESTRUCTURA DE LABORATORIOS

### [LAB 0: Configuración Avanzada](./lab-0-configuracion/README.md) ✅
**⏱️ Duración: 10 minutos**

Preparación del entorno de desarrollo y verificación de herramientas.

**🎯 Objetivos:**
- Verificar proyecto base de Sesión 1
- Configurar Angular DevTools
- Preparar VS Code para debugging
- Crear estructura de carpetas organizada

**📁 Entregables:**
- Proyecto base funcionando
- DevTools configurado
- Estructura de carpetas lista

---

### [LAB 1: Ciclo de Vida de Componentes](./lab-1-lifecycle/README.md) ✅
**⏱️ Duración: 30 minutos**

Dominio completo de lifecycle hooks con implementación práctica.

**🎯 Objetivos:**
- Implementar todos los lifecycle hooks
- Crear Logger Service para monitoreo
- Demostrar limpieza de recursos
- Gestión correcta de subscripciones

**📁 Entregables:**
- Componente con todos los hooks implementados
- Logger service funcionando
- Demo interactivo de creación/destrucción

**💾 Código incluido:**
- `LifecycleDemoComponent` con todos los hooks
- `LoggerService` con múltiples niveles
- Templates y estilos profesionales
- Integración completa en app principal

---

### [LAB 2: Comunicación entre Componentes](./lab-2-communication/README.md) ✅
**⏱️ Duración: 30 minutos**

Sistema completo de comunicación entre componentes con casos reales.

**🎯 Objetivos:**
- Comunicación @Input/@Output
- Services para estado compartido
- CRUD completo con comunicación reactiva
- Manejo de eventos complejos

**📁 Entregables:**
- Sistema de gestión de usuarios
- Comunicación padre-hijo-hermano
- CRUD funcionando completamente

**💾 Código incluido:**
- Modelos de datos (User, UserRole)
- `UserManagementService` con BehaviorSubject
- `UserListComponent` (padre)
- `UserCardComponent` (hijo)
- `UserDetailsComponent` (sibling)
- Templates y estilos completos

---

### [LAB 3: Angular Router - Configuración Básica](./lab-3-router/README.md) ✅
**⏱️ Duración: 30 minutos**

Implementación de navegación SPA con rutas básicas y parametrizadas.

**🎯 Objetivos:**
- Configurar rutas principales
- Rutas parametrizadas
- Navigation component
- Breadcrumb dinámico

**📁 Entregables:**
- Navegación SPA completa
- Rutas parametrizadas funcionando
- Página 404 implementada

**💾 Código incluido:**
- Configuración completa de `app.routes.ts`
- `NavigationComponent` con breadcrumbs
- Componentes de páginas (Dashboard, Users, Projects)
- `NotFoundComponent` profesional

---

### [LAB 4: Rutas Avanzadas y Guards](./lab-4-guards/README.md) ✅
**⏱️ Duración: 30 minutos**

Sistema de seguridad y optimización con guards y lazy loading.

**🎯 Objetivos:**
- Authentication Service
- Guards de autenticación y autorización
- Lazy loading implementation
- Manejo de cambios no guardados

**📁 Entregables:**
- Sistema de autenticación funcional
- Guards implementados y probados
- Lazy loading funcionando

**💾 Código incluido:**
- `AuthService` completo con persistencia
- `authGuard`, `adminGuard`, `unsavedChangesGuard`
- `AdminComponent` con lazy loading
- Interfaces para componentes con guards

---

### [LAB 5: SPA Completa con Navegación](./lab-5-spa-completa/README.md) ✅
**⏱️ Duración: 35 minutos**

Integración completa en una aplicación profesional.

**🎯 Objetivos:**
- Layout profesional responsivo
- Header con autenticación dinámica
- Estado global integrado
- Animaciones y transiciones

**📁 Entregables:**
- SPA completamente funcional
- UI/UX profesional
- Todas las funcionalidades integradas

**💾 Código incluido:**
- `HeaderComponent` con autenticación dinámica
- Layout principal integrado (`app.component`)
- `FooterComponent` con estado global
- Estilos globales profesionales (`styles.scss`)
- Animaciones y transiciones suaves

---

## 🛠️ STACK TECNOLÓGICO

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Angular** | 18.x | Framework principal |
| **TypeScript** | 5.x | Lenguaje de desarrollo |
| **RxJS** | 7.x | Programación reactiva |
| **Angular Router** | 18.x | Navegación SPA |
| **Angular CLI** | 18.x | Herramientas de desarrollo |

---

## 🚀 INSTRUCCIONES DE INICIO

### 1. Preparación del Entorno
```bash
# Verificar versiones
node --version  # v18.19.0+
ng version     # Angular CLI 18.x

# Navegar al proyecto base
cd mi-primera-app-angular

# Verificar que funciona
ng serve
```

### 2. Secuencia de Laboratorios
1. **Comenzar con LAB 0** para verificar configuración
2. **Seguir orden secuencial** - cada lab construye sobre el anterior
3. **Completar cada README** antes de comenzar el código
4. **Probar funcionamiento** al final de cada lab

### 3. Estructura Final del Proyecto
```
mi-primera-app-angular/
├── src/app/
│   ├── components/           # Componentes reutilizables
│   │   ├── header/
│   │   ├── footer/
│   │   ├── lifecycle-demo/
│   │   ├── user-list/
│   │   ├── user-card/
│   │   └── user-details/
│   ├── pages/               # Páginas principales
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── admin/
│   │   └── not-found/
│   ├── services/            # Servicios globales
│   │   ├── logger.service.ts
│   │   ├── auth.service.ts
│   │   └── user-management.service.ts
│   ├── guards/              # Guards de seguridad
│   │   ├── auth.guard.ts
│   │   ├── admin.guard.ts
│   │   └── unsaved-changes.guard.ts
│   ├── models/              # Interfaces y tipos
│   │   ├── user.ts
│   │   └── project.ts
│   ├── shared/              # Componentes compartidos
│   │   └── navigation/
│   └── app.routes.ts        # Configuración de rutas
```

---

## 📚 CONCEPTOS CLAVE CUBIERTOS

### 🔄 Lifecycle Hooks
- **Constructor:** Inyección de dependencias únicamente
- **ngOnInit:** Inicialización del componente y carga de datos
- **ngOnChanges:** Reacción a cambios en @Input properties
- **ngAfterViewInit:** Manipulación segura del DOM
- **ngOnDestroy:** Limpieza de recursos y subscripciones

### 📡 Comunicación de Componentes
- **@Input():** Datos del padre hacia el hijo
- **@Output():** Eventos del hijo hacia el padre
- **Services:** Estado compartido entre componentes no relacionados
- **RxJS Subjects:** Comunicación reactiva global

### 🛣️ Angular Router
- **Rutas básicas:** Navegación entre vistas
- **Rutas parametrizadas:** URLs dinámicas con parámetros
- **Route Guards:** Protección y validación de acceso
- **Lazy Loading:** Carga bajo demanda para optimización

### 🏗️ Arquitectura SPA
- **Component-based:** Modularidad y reutilización
- **Service-oriented:** Lógica de negocio centralizada
- **Route-driven:** Navegación declarativa
- **Reactive:** Flujo de datos unidireccional

---

## ✅ CRITERIOS DE EVALUACIÓN

### Funcionalidad (40%)
- [ ] Todos los lifecycle hooks implementados correctamente
- [ ] Comunicación entre componentes funcionando
- [ ] Navegación SPA completa sin errores
- [ ] Guards de seguridad operativos

### Código (30%)
- [ ] Estructura de archivos organizada
- [ ] Código comentado y autodocumentado
- [ ] Implementación de mejores prácticas Angular
- [ ] Manejo adecuado de subscripciones

### UI/UX (20%)
- [ ] Interfaz responsive y profesional
- [ ] Navegación intuitiva
- [ ] Feedback visual apropiado
- [ ] Manejo de estados de carga y error

### Documentación (10%)
- [ ] README completos en cada laboratorio
- [ ] Comentarios explicativos en código
- [ ] Documentación de decisiones técnicas

---

## 🆘 RECURSOS DE AYUDA

### 📖 Documentación Oficial
- [Angular Official Docs](https://angular.io/docs)
- [Angular Router Guide](https://angular.io/guide/router)
- [RxJS Documentation](https://rxjs.dev/)

### 🔧 Herramientas de Debug
- **Angular DevTools:** Inspección de componentes
- **VS Code Angular Snippets:** Generación rápida de código
- **Browser DevTools:** Debug general

### 🎥 Videos de Referencia
- Angular Component Lifecycle
- Angular Router Deep Dive
- RxJS Patterns in Angular

---

## 👨‍🏫 SOPORTE DEL INSTRUCTOR

**Ing. Jhonny Alexander Ramirez Chiroque**

- **Durante la sesión:** Levanta la mano para dudas inmediatas
- **Chat del curso:** Para consultas rápidas
- **Office hours:** Disponible 30 min después de cada sesión

---

## 🎊 ¡IMPORTANTE!

> **Esta sesión es 100% práctica.** Cada concepto se implementa inmediatamente en código. No te quedes solo leyendo, ¡programa junto con las instrucciones!

> **Cada error es una oportunidad de aprendizaje.** Si algo no funciona, no te frustres. Los bugs son maestros excelentes.

> **Al final de esta sesión tendrás una aplicación profesional** que podrías mostrar en cualquier entrevista técnica.

---

**¡Comencemos a construir algo increíble! 🚀**