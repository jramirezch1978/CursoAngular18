# 🛍️ LAB 1: FUNDAMENTOS DE DATA BINDING

**PROVIAS DESCENTRALIZADO - Angular v18**

*Duración: 40 minutos*  
*Objetivo: Dominar los 4 tipos de Data Binding implementando un sistema de productos completo*

---

## 📚 CONCEPTOS TEÓRICOS

### ¿Qué es Data Binding?

El **Data Binding** es el corazón palpitante de Angular. Es el mecanismo que permite la comunicación entre la lógica del componente (TypeScript) y la presentación (HTML Template). 

Imaginen el data binding como el **sistema circulatorio** de una aplicación: permite que la información fluya entre la lógica de negocio y lo que el usuario ve en pantalla.

### Los 4 Tipos de Data Binding

#### 1. 🔤 **Interpolación** `{{ }}`
- **Dirección**: Componente → Vista (Unidireccional)
- **Uso**: Mostrar datos dinámicos en el template
- **Sintaxis**: `{{ expression }}`

```html
<h2>{{ product.name }}</h2>
<p>Precio: {{ price | currency }}</p>
```

Es como tener un **espejo mágico** que siempre refleja el estado actual de los datos.

#### 2. 🎯 **Property Binding** `[property]`
- **Dirección**: Componente → Vista (Unidireccional)
- **Uso**: Enlazar propiedades del componente a atributos/propiedades del DOM
- **Sintaxis**: `[property]="expression"`

```html
<img [src]="product.image" [alt]="product.name">
<button [disabled]="!isValid">Comprar</button>
```

Es como tener **cables directos** que conectan las variables del componente con las propiedades de los elementos HTML.

#### 3. 🎪 **Event Binding** `(event)`
- **Dirección**: Vista → Componente (Unidireccional)
- **Uso**: Capturar eventos del DOM y ejecutar métodos del componente
- **Sintaxis**: `(event)="handler($event)"`

```html
<button (click)="addToCart(product)">Agregar al Carrito</button>
<input (keyup)="onSearch($event)">
```

Es como instalar **sensores** en la aplicación que detectan las acciones del usuario.

#### 4. 🔄 **Two-Way Binding** `[(ngModel)]`
- **Dirección**: Bidireccional (Componente ↔ Vista)
- **Uso**: Sincronización automática entre modelo y vista
- **Sintaxis**: `[(ngModel)]="property"`

```html
<input [(ngModel)]="searchTerm" placeholder="Buscar productos...">
```

Es como tener una **conversación telefónica** donde ambas partes se escuchan y responden instantáneamente.

### 🎨 Class y Style Binding

#### Class Binding
```html
<!-- Clase única condicional -->
<div [class.active]="isActive">Estado</div>

<!-- Múltiples clases -->
<div [ngClass]="{'active': isActive, 'featured': isFeatured}">Producto</div>
```

#### Style Binding
```html
<!-- Estilo único -->
<div [style.color]="textColor">Texto</div>

<!-- Múltiples estilos -->
<div [ngStyle]="{'color': textColor, 'font-size.px': fontSize}">Contenido</div>
```

---

## 🏗️ ESTRUCTURA DEL PROYECTO

```
lab-1-data-binding/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── product-list/
│   │   │       ├── product-list.component.ts
│   │   │       ├── product-list.component.html
│   │   │       └── product-list.component.scss
│   │   ├── models/
│   │   │   └── product.interface.ts
│   │   ├── services/
│   │   │   └── cart.service.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── package.json
├── angular.json
├── tsconfig.json
└── README.md
```

---

## 🎯 OBJETIVOS ESPECÍFICOS

Al completar este laboratorio, serás capaz de:

1. ✅ **Implementar interpolación** para mostrar datos dinámicos
2. ✅ **Aplicar property binding** para atributos y propiedades del DOM
3. ✅ **Configurar event binding** para manejar interacciones del usuario
4. ✅ **Usar two-way binding** con ngModel para formularios
5. ✅ **Aplicar class binding** dinámico según estados
6. ✅ **Crear un carrito funcional** con todas las operaciones CRUD

---

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### Sistema de Productos Completo
- **Catálogo de productos** con información dinámica
- **Carrito de compras** funcional
- **Búsqueda en tiempo real** con filtrado
- **Estados visuales** (descuentos, agotado, favoritos)
- **Cálculos automáticos** (subtotal, total, descuentos)

### Tipos de Data Binding en Acción
- **Interpolación**: Nombres, precios, descripciones
- **Property Binding**: Imágenes, estados de botones, atributos
- **Event Binding**: Clicks, búsqueda, eventos del carrito
- **Two-Way Binding**: Campo de búsqueda, cantidad de productos
- **Class Binding**: Estados visuales, temas, alertas

---

## 💡 CASOS DE USO EMPRESARIALES

Este laboratorio simula escenarios reales de PROVIAS:

1. **Sistema de Inventario**: Gestión de materiales y equipos
2. **Catálogo de Proveedores**: Listado de empresas contratistas
3. **Panel de Proyectos**: Dashboard de obras en ejecución
4. **Gestión de Documentos**: Biblioteca de planos y especificaciones

---

## 🎨 CARACTERÍSTICAS VISUALES

- **Diseño Responsive**: Adaptable a móviles y tablets
- **Estados Interactivos**: Hover, focus, active
- **Feedback Visual**: Animaciones suaves y transiciones
- **Accesibilidad**: Etiquetas semánticas y ARIA
- **Temas**: Colores corporativos de PROVIAS

---

## 📝 NOTAS IMPORTANTES

### Performance
- Usar **Pure Pipes** para transformaciones
- Evitar llamadas a funciones en templates
- Implementar **OnPush Change Detection** cuando sea apropiado

### Mejores Prácticas
- **Tipado fuerte** con interfaces TypeScript
- **Nombres descriptivos** para propiedades y métodos
- **Componentes pequeños** y enfocados
- **Separación de responsabilidades**

### Debugging
- Usar **Angular DevTools** para inspeccionar binding
- **Console.log** en métodos de event binding
- **JSON Pipe** para inspeccionar objetos

---

## 🔗 CONCEPTOS RELACIONADOS

### Próximas Sesiones
- **Lab 2**: Binding Avanzado (NgClass, NgStyle, Events avanzados)
- **Lab 3**: Pipes Built-in y Async
- **Lab 4**: Pipes Personalizados

### Tecnologías Integradas
- **FormsModule**: Para ngModel y formularios
- **CommonModule**: Para directivas estructurales
- **RxJS**: Para programación reactiva (opcional)

---

## 🏆 ENTREGABLES ESPERADOS

1. **Aplicación Angular** completamente funcional
2. **Componente de productos** con todos los tipos de binding
3. **Servicio de carrito** con lógica de negocio
4. **Interfaz de usuario** responsive y profesional
5. **Código limpio** y bien documentado

---

*¡Prepárate para convertirte en un maestro del Data Binding! 🚀*

**Instrucciones detalladas en los archivos del proyecto** 📋