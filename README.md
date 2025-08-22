# LAB 1: TEMPLATE-DRIVEN FORMS

## 📋 INFORMACIÓN DEL LABORATORIO

**Duración:** 30 minutos  
**Nivel:** Intermedio  
**Instructor:** Ing. Jhonny Alexander Ramirez Chiroque  

## 🎯 OBJETIVOS DE APRENDIZAJE

- Dominar la creación de formularios Template-driven en Angular 18
- Implementar validaciones HTML5 y Angular integradas
- Manejar estados de formulario (valid, invalid, touched, dirty)
- Crear UX profesional con manejo inteligente de errores
- Trabajar con binding bidireccional [(ngModel)]

## 📚 MARCO TEÓRICO

### ¿Qué son los Template-driven Forms?

> *"Los formularios Template-driven son como llenar un formulario físico que mágicamente se digitaliza. La lógica vive en el HTML, usa directivas como ngModel para binding bidireccional."*

#### Ventajas ✅
- **Fácil de aprender** - Se parece a HTML tradicional con superpoderes
- **Menos código TypeScript** - Menor superficie para bugs
- **Binding automático** - ngModel sincroniza modelo y vista automáticamente
- **Ideal para formularios simples** - Login, contacto, búsqueda

#### Desventajas ❌
- **Testing unitario complejo** - La lógica está en el template
- **Menor control del estado** - Como auto automático vs manual
- **Validaciones limitadas** - Solo lo que Angular ofrece nativamente
- **Problemas de escalabilidad** - Formularios complejos se vuelven difíciles

### Anatomía de un Template-driven Form

#### Los Actores Principales

**1. ngForm - El Director de Orquesta**
```html
<form #contactForm="ngForm" (ngSubmit)="onSubmit()">
```

**2. ngModel - El Caballo de Batalla**
```html
<input [(ngModel)]="model.name" name="name" required>
```

**3. Estados del Formulario - Sistema de Semáforos**
- **pristine/dirty** - ¿El usuario modificó algo?
- **valid/invalid** - ¿Los datos son correctos?
- **touched/untouched** - ¿El usuario interactuó con el campo?

## 🚀 EJERCICIOS PRÁCTICOS

### PARTE 1: Formulario de Contacto (15 min)
- Modelo de datos tipado
- Validaciones básicas HTML5
- Estados de formulario
- Integración con servicios

### PARTE 2: Registro de Usuario (15 min)
- Validaciones avanzadas
- Campos condicionales
- Validación de DNI peruano
- Email corporativo @provias.gob.pe

## 💻 COMANDOS ÚTILES

```bash
# Generar modelos
ng generate interface models/contact --type=model

# Generar servicios  
ng generate service services/contact --skip-tests

# Generar componentes
ng generate component forms/template-contact --standalone

# Iniciar desarrollo
npm run dev
```

## 📋 CHECKLIST DE VALIDACIÓN

- [ ] ✅ Proyecto Angular 18 configurado
- [ ] ✅ FormsModule importado
- [ ] ✅ Modelos TypeScript definidos
- [ ] ✅ Validaciones funcionando
- [ ] ✅ Estados de error manejados
- [ ] ✅ UX inteligente implementada

## 🔗 PRÓXIMO LABORATORIO

**LAB 2: REACTIVE FORMS** - Control programático total con FormBuilder y validaciones dinámicas.

---
*PROVIAS DESCENTRALIZADO - Angular v18*