# LAB 1: TEMPLATE-DRIVEN FORMS

## 📋 INFORMACIÓN DEL LABORATORIO

**Duración:** 30 minutos  
**Tipo:** Template-driven Forms  
**Enfoque:** Formularios simples con validaciones básicas

## 🎯 OBJETIVOS

- Dominar la creación de formularios Template-driven
- Implementar validaciones HTML5 y Angular
- Manejar estados de formulario (valid, invalid, touched, dirty)
- Crear UX profesional con manejo de errores
- Trabajar con binding bidireccional

## 📚 CONCEPTOS CLAVE

### Template-driven Forms: Simplicidad Elegante

Los formularios Template-driven son como llenar un formulario físico que mágicamente se digitaliza. La lógica vive en el HTML, usa directivas como `ngModel` para binding bidireccional. Es perfecto para formularios simples sin complicaciones.

**Cuándo usar Template-driven:**
- Formularios simples (contacto, login, búsqueda)
- Validaciones básicas HTML5
- Proyectos pequeños o prototipos rápidos
- Equipos familiarizados con AngularJS

**Ventajas:**
- ✅ Fácil de aprender y implementar
- ✅ Menos código TypeScript
- ✅ Binding automático con ngModel
- ✅ Ideal para formularios simples

**Desventajas:**
- ❌ Testing unitario más difícil
- ❌ Menor control sobre el estado
- ❌ Validaciones limitadas
- ❌ No escala bien para formularios complejos

### Anatomía de un Template-driven Form

```html
<form #contactForm="ngForm" (ngSubmit)="onSubmit()">
  <input 
    type="text" 
    name="name"
    [(ngModel)]="model.name"
    #nameInput="ngModel"
    required
    minlength="3">
  
  <div *ngIf="nameInput.invalid && nameInput.touched">
    Error messages here
  </div>
</form>
```

**Componentes clave:**
- `ngForm` - Director de orquesta del formulario
- `ngModel` - Binding bidireccional y validación
- `name` - Identificador único (¡crítico!)
- Referencias locales (#) - Acceso al estado del campo

## 🚀 EJERCICIOS PRÁCTICOS

### PARTE 1: Formulario Simple de Contacto
- Crear modelo de contacto
- Implementar validaciones básicas
- Manejo de estados de formulario
- UX con mensajes de error

### PARTE 2: Formulario de Registro de Usuario
- Campos más complejos (selects, checkboxes, radio buttons)
- Validaciones avanzadas (patrones, DNI peruano)
- Feedback visual de estado
- Integración con servicios

### PARTE 3: Validaciones Personalizadas (Template-driven)
- Directivas de validación personalizadas
- Validación de DNI peruano
- Validación de email @provias.gob.pe
- Estados condicionales

## 📁 ESTRUCTURA DEL PROYECTO

```
src/app/
├── models/
│   ├── contact.model.ts
│   └── user.model.ts
├── services/
│   ├── contact.service.ts
│   └── user.service.ts
├── forms/
│   ├── template-contact/
│   ├── user-registration/
│   └── custom-validators/
└── shared/
    └── components/
```

## 🛠️ TECNOLOGÍAS UTILIZADAS

- **Angular 18** - Framework principal
- **FormsModule** - Formularios Template-driven
- **HttpClient** - Peticiones HTTP
- **JSON Server** - API mock para testing
- **SCSS** - Estilos avanzados
- **TypeScript** - Tipado fuerte

## ⚡ COMANDOS IMPORTANTES

```bash
# Generar componentes
ng generate component forms/template-contact --standalone

# Generar modelos
ng generate interface models/contact --type=model

# Generar servicios
ng generate service services/contact --skip-tests

# Iniciar desarrollo
npm run dev
```

## 🎨 CARACTERÍSTICAS DE UX

### Validación Inteligente
- Errores solo después de interacción (touched)
- Mensajes específicos por tipo de error
- Feedback visual con colores y iconos
- Botón submit habilitado solo cuando válido

### Estados Visuales
- **Pristine/Dirty** - ¿El usuario modificó algo?
- **Valid/Invalid** - ¿Los datos son correctos?
- **Touched/Untouched** - ¿El usuario interactuó?
- **Pending** - ¿Validación en progreso?

### Mejores Prácticas UX
- Labels claros y descriptivos
- Placeholders informativos
- Validación en tiempo real
- Mensajes de error útiles
- Indicadores de campos requeridos

## 🧪 CASOS DE PRUEBA

### Formulario de Contacto
- [ ] Validación de nombre (mínimo 3 caracteres)
- [ ] Validación de email formato válido
- [ ] Email debe ser @provias.gob.pe
- [ ] Mensaje requerido
- [ ] Departamento seleccionado
- [ ] Términos aceptados

### Registro de Usuario
- [ ] DNI exactamente 8 dígitos
- [ ] Edad entre 18 y 100 años
- [ ] Email único en el sistema
- [ ] Contraseña fuerte
- [ ] Confirmación de contraseña coincide

## 📋 CHECKLIST DE COMPLETITUD

**Funcionalidad Base:**
- [ ] ✅ Formulario renderiza correctamente
- [ ] ✅ Binding bidireccional funciona
- [ ] ✅ Validaciones básicas implementadas
- [ ] ✅ Estados de formulario manejados

**Validaciones:**
- [ ] ✅ Required fields marcados
- [ ] ✅ Formato de email validado
- [ ] ✅ Longitudes min/max implementadas
- [ ] ✅ Patrones regex funcionando

**UX/UI:**
- [ ] ✅ Errores solo después de touched
- [ ] ✅ Mensajes específicos por error
- [ ] ✅ Feedback visual claro
- [ ] ✅ Submit habilitado condicionalmente

**Integración:**
- [ ] ✅ Servicios conectados
- [ ] ✅ HTTP requests funcionando
- [ ] ✅ Manejo de errores implementado
- [ ] ✅ Loading states manejados

## 🔗 RECURSOS ADICIONALES

- [Angular Forms Guide](https://angular.io/guide/forms)
- [Template-driven Forms](https://angular.io/guide/forms#template-driven-forms)
- [Form Validation](https://angular.io/guide/form-validation)
- [Angular Material](https://material.angular.io/components/form-field)

## 🚀 PRÓXIMO LABORATORIO

**LAB 2: Reactive Forms** - Donde el verdadero poder se desata con FormBuilder, validaciones programáticas y control total sobre el estado del formulario.

---
*Los Template-driven Forms son el primer paso hacia el dominio de formularios en Angular. Simple, directo, efectivo.*