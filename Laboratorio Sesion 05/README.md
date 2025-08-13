# LABORATORIOS SESIÓN 5: MÓDULOS, COMPONENTES Y SERVICIOS

## Angular v18 - PROVIAS DESCENTRALIZADO

### 📚 INFORMACIÓN GENERAL

**Curso:** Angular v18 - 30 horas académicas  
**Modalidad:** 100% Online Live - Formato Laboratorio Intensivo  
**Instructor:** Ing. Jhonny Alexander Ramirez Chiroque  
**Sesión:** 5 - Módulos, Componentes y Servicios  

---

## 🎯 CONCEPTOS FUNDAMENTALES

### Inyección de Dependencias Moderna
Los servicios son la sangre que lleva datos y funcionalidad a todos los componentes. Angular 18 introduce `inject()` que revoluciona la inyección de dependencias.

### Signals: El Futuro del Estado Reactivo
Los Signals representan un cambio de paradigma más simple y eficiente que Observables para estado de UI.

### Componentes Standalone
Eliminan la necesidad de NgModules, simplificando la arquitectura de aplicaciones Angular.

---

## 📋 LABORATORIOS

- **LAB 0:** Configuración del Entorno (15 min)
- **LAB 1:** Sistema de Gestión con Servicios y Signals (45 min)
- **LAB 2:** Migración a Componentes Standalone (45 min)
- **LAB 3:** Providers y Jerarquía de Inyectores (45 min)
- **LAB 4:** Arquitectura de Servicios Empresariales (25 min)

---

## 🚀 COMANDOS PRINCIPALES

```bash
# Crear proyecto
ng new mi-primera-app-angular --routing --style=scss --standalone

# Generar servicios
ng generate service core/services/task-state --skip-tests

# Generar componentes standalone
ng generate component features/task-manager/task-list --standalone

# Compilar y verificar
ng build
ng serve --open
```

**¡Comencemos este viaje hacia la arquitectura moderna de Angular! 🚀**