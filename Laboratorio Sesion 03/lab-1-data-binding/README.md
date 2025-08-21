# 🛍️ LAB 1: FUNDAMENTOS DE DATA BINDING

**PROVIAS DESCENTRALIZADO - Angular v18**  
**Curso: Desarrollo de Aplicaciones Web con Angular**  
**Instructor: Ing. Jhonny Alexander Ramirez Chiroque**  

---

## 🎯 **¿QUÉ VAS A APRENDER EN ESTE LAB?**

En este laboratorio vas a construir un **sistema completo de gestión de productos** para PROVIAS, similar a un e-commerce profesional. Pero lo más importante es que dominarás los **4 tipos fundamentales de Data Binding** que son la base de cualquier aplicación Angular moderna.

**Al final de este lab podrás:**
- ✅ Conectar datos del componente con la vista usando **interpolación**
- ✅ Controlar propiedades de elementos HTML con **property binding**
- ✅ Responder a acciones del usuario con **event binding**
- ✅ Sincronizar formularios automáticamente con **two-way binding**
- ✅ Aplicar estilos dinámicos con **class y style binding**

---

## 🏗️ **¿QUÉ VAS A CONSTRUIR?**

### **Sistema de Productos PROVIAS**
Imagina que PROVIAS necesita un sistema para gestionar su inventario de materiales de construcción, equipos y herramientas. Vas a crear:

🛍️ **Catálogo de Productos Interactivo**
- Productos reales de PROVIAS (cemento, excavadoras, equipos de seguridad)
- Filtros avanzados por categoría, precio y disponibilidad
- Búsqueda en tiempo real mientras escribes
- Vista grid y lista intercambiables

🛒 **Carrito de Compras Funcional**
- Agregar/quitar productos con un click
- Actualizar cantidades dinámicamente
- Cálculo automático de subtotales, impuestos y total
- Sidebar que aparece cuando hay productos

📊 **Dashboard de Estadísticas**
- Contador de productos en tiempo real
- Precios promedio calculados automáticamente
- Indicadores de stock disponible
- Todo actualizado instantáneamente

---

## 🔤 **LOS 4 TIPOS DE DATA BINDING EXPLICADOS**

### **1. INTERPOLACIÓN `{{ }}` - "Mostrar Datos"**

**¿Qué hace?** Toma datos del componente y los muestra en el HTML.

```html
<!-- En el template -->
<h2>{{ product.name }}</h2>
<p>Precio: {{ product.price | currency:'PEN' }}</p>

<!-- En el componente -->
product = {
  name: 'Cemento Portland',
  price: 28.50
};
```

**Resultado en pantalla:**
```
Cemento Portland
Precio: S/ 28.50
```

**💡 Piénsalo como:** Un espejo que refleja automáticamente los datos del componente.

### **2. PROPERTY BINDING `[property]` - "Controlar Elementos"**

**¿Qué hace?** Conecta propiedades del componente con atributos de elementos HTML.

```html
<!-- En el template -->
<img [src]="product.image" [alt]="product.name">
<button [disabled]="!product.inStock">Comprar</button>

<!-- En el componente -->
product = {
  image: 'https://ejemplo.com/cemento.jpg',
  name: 'Cemento Portland',
  inStock: true
};
```

**Resultado:** La imagen se muestra automáticamente y el botón se habilita/deshabilita según el stock.

**💡 Piénsalo como:** Cables invisibles que conectan tus datos con las propiedades de los elementos HTML.

### **3. EVENT BINDING `(event)` - "Responder a Acciones"**

**¿Qué hace?** Ejecuta métodos del componente cuando el usuario interactúa con la página.

```html
<!-- En el template -->
<button (click)="addToCart(product)">Agregar al Carrito</button>
<input (keyup)="onSearch($event)" placeholder="Buscar...">

<!-- En el componente -->
addToCart(product: Product) {
  console.log('Producto agregado:', product.name);
  this.cartService.add(product);
}

onSearch(event: any) {
  this.searchTerm = event.target.value;
  this.filterProducts();
}
```

**Resultado:** Cuando haces click en "Agregar al Carrito", se ejecuta el método y el producto se agrega.

**💡 Piénsalo como:** Sensores que detectan las acciones del usuario y ejecutan respuestas automáticas.

### **4. TWO-WAY BINDING `[(ngModel)]` - "Sincronización Automática"**

**¿Qué hace?** Mantiene sincronizados los datos del componente con los valores de formularios.

```html
<!-- En el template -->
<input [(ngModel)]="searchTerm" placeholder="Buscar productos...">
<p>Estás buscando: {{ searchTerm }}</p>

<!-- En el componente -->
searchTerm = '';
```

**Resultado:** Mientras escribes en el input, la variable `searchTerm` se actualiza automáticamente Y viceversa.

**💡 Piénsalo como:** Una conversación telefónica donde ambas partes se escuchan y responden instantáneamente.

---

## 🚀 **CÓMO EJECUTAR EL LABORATORIO**

### **Paso 1: Preparar el Entorno**
```bash
# Navegar al directorio del lab
cd lab-1-data-binding

# Instalar dependencias (si es necesario)
npm install

# Levantar el servidor de desarrollo
npm run start
```

### **Paso 2: Abrir en el Navegador**
- Abre tu navegador en: http://localhost:4200
- Verás la página de inicio con información del lab
- Haz click en "🛍️ Productos" para acceder al catálogo

### **Paso 3: Explorar las Funcionalidades**
1. **🔍 Prueba la búsqueda:** Escribe "cemento" y ve cómo se filtran los productos
2. **🎛️ Usa los filtros:** Cambia categorías, ajusta precios, filtra por stock
3. **🛒 Agrega al carrito:** Haz click en "Agregar al Carrito" y ve el sidebar
4. **⚙️ Cambia cantidades:** Usa los botones +/- en el carrito
5. **👁️ Cambia la vista:** Alterna entre grid y lista

---

## 📚 **CONCEPTOS EN ACCIÓN - EJEMPLOS REALES**

### **Interpolación en Acción**
Cuando ves el nombre del producto en pantalla:
```html
<h3>{{ product.name }}</h3>
<!-- "Cemento Portland Tipo I" aparece automáticamente -->
```

### **Property Binding en Acción**
Cuando la imagen del producto se carga:
```html
<img [src]="product.image" [alt]="product.name">
<!-- La imagen se carga desde la URL del producto -->
```

### **Event Binding en Acción**
Cuando haces click en "Agregar al Carrito":
```html
<button (click)="addToCart(product)">Agregar al Carrito</button>
<!-- Se ejecuta el método addToCart() automáticamente -->
```

### **Two-Way Binding en Acción**
Cuando escribes en el campo de búsqueda:
```html
<input [(ngModel)]="searchTerm" placeholder="Buscar...">
<!-- Lo que escribes se guarda en searchTerm automáticamente -->
```

---

## 🎨 **FUNCIONALIDADES IMPLEMENTADAS**

### **🔍 Sistema de Búsqueda Inteligente**
- **Búsqueda en tiempo real** mientras escribes
- **Filtrado por múltiples campos** (nombre, descripción, proveedor)
- **Atajos de teclado** (Enter para buscar, Escape para limpiar)
- **Indicador visual** cuando hay texto en el campo

### **🎛️ Filtros Avanzados**
- **Filtro por categoría** (materiales, equipos, seguridad, etc.)
- **Rango de precios** con sliders duales
- **Filtro de stock** con checkbox
- **Ordenamiento** por nombre, precio o calificación

### **🛒 Carrito Reactivo**
- **Sidebar dinámico** que aparece cuando hay productos
- **Cálculos automáticos** de subtotal, descuentos e IGV
- **Control de cantidades** con botones +/-
- **Eliminación individual** de productos

### **📱 Diseño Responsive**
- **Adaptable a móviles** y tablets
- **Grid responsivo** que se ajusta al tamaño de pantalla
- **Menús optimizados** para touch
- **Textos legibles** en todos los dispositivos

---

## 💼 **¿POR QUÉ ES IMPORTANTE PARA PROVIAS?**

Este laboratorio simula sistemas reales que PROVIAS podría necesitar:

### **📦 Gestión de Inventario**
- Control de materiales de construcción
- Seguimiento de equipos y herramientas
- Gestión de proveedores y contratos

### **📊 Sistemas de Monitoreo**
- Dashboards de proyectos en tiempo real
- Indicadores de avance y presupuesto
- Alertas y notificaciones automáticas

### **📱 Aplicaciones Móviles**
- Apps para supervisores en campo
- Sistemas de reporte desde obra
- Consulta de especificaciones técnicas

---

## 🔧 **ESTRUCTURA TÉCNICA DEL PROYECTO**

```
lab-1-data-binding/
├── 📁 src/app/
│   ├── 📁 components/
│   │   ├── 📁 header/              ← Navegación principal
│   │   └── 📁 product-list/        ← Catálogo de productos
│   ├── 📁 pages/
│   │   └── 📁 home/                ← Página de inicio educativa
│   ├── 📁 models/
│   │   └── 📄 product.interface.ts ← Tipos de datos
│   ├── 📁 services/
│   │   └── 📄 cart.service.ts      ← Lógica del carrito
│   ├── 📄 app.component.ts         ← Componente principal
│   └── 📄 app.component.html       ← Template principal
├── 📄 package.json                 ← Dependencias
├── 📄 angular.json                 ← Configuración Angular
└── 📄 README.md                    ← Esta guía
```

---

## 🎓 **EJERCICIOS PARA PRACTICAR**

### **Ejercicio 1: Modificar Interpolación**
1. Ve al archivo `product-list.component.ts`
2. Cambia el título de "Catálogo de Productos PROVIAS"
3. Observa cómo cambia automáticamente en pantalla

### **Ejercicio 2: Agregar Property Binding**
1. En el template, encuentra las imágenes de productos
2. Agrega `[title]="product.description"` 
3. Pasa el mouse sobre una imagen y ve el tooltip

### **Ejercicio 3: Crear Event Binding**
1. Agrega un botón "Ver Detalles" a cada producto
2. Crea el método `showDetails(product)` en el componente
3. Haz que muestre una alerta con la información del producto

### **Ejercicio 4: Experimentar con Two-Way Binding**
1. Encuentra el campo de búsqueda
2. Escribe algo y observa cómo se filtran los productos
3. Borra el texto y ve cómo vuelven a aparecer todos

---

## ❓ **PREGUNTAS FRECUENTES**

### **P: ¿Por qué usar Data Binding en lugar de manipular el DOM directamente?**
**R:** Data Binding es más seguro, automático y mantenible. Angular se encarga de actualizar el DOM cuando cambian los datos, evitando errores y código repetitivo.

### **P: ¿Cuándo usar cada tipo de binding?**
**R:** 
- **Interpolación:** Para mostrar datos (títulos, precios, textos)
- **Property Binding:** Para controlar atributos (src, disabled, class)
- **Event Binding:** Para responder a acciones (clicks, teclas, hover)
- **Two-Way Binding:** Para formularios (inputs, selects, checkboxes)

### **P: ¿Qué es FormsModule y por qué lo necesito?**
**R:** FormsModule habilita `[(ngModel)]` para two-way binding. Sin él, no puedes usar ngModel en formularios.

### **P: ¿Cómo debuggear problemas de binding?**
**R:** 
1. Usa Angular DevTools en el navegador
2. Agrega `console.log()` en los métodos
3. Usa el pipe `| json` para ver objetos completos
4. Verifica la consola del navegador para errores

---

## 🏆 **CRITERIOS DE EVALUACIÓN**

### **Funcionalidad (40%)**
- ✅ Catálogo muestra productos correctamente
- ✅ Búsqueda filtra en tiempo real
- ✅ Carrito agrega/remueve productos
- ✅ Cálculos son correctos
- ✅ Navegación funciona sin errores

### **Técnica (40%)**
- ✅ Usa los 4 tipos de data binding apropiadamente
- ✅ Código está bien estructurado
- ✅ No hay errores en la consola
- ✅ Interfaces TypeScript están bien definidas
- ✅ Servicios manejan la lógica de negocio

### **UX/UI (20%)**
- ✅ Interfaz es intuitiva y fácil de usar
- ✅ Responsive design funciona en móvil
- ✅ Estados visuales son claros (loading, error, success)
- ✅ Animaciones mejoran la experiencia
- ✅ Accesibilidad básica implementada

---

## 🚀 **COMANDOS IMPORTANTES**

```bash
# Levantar el proyecto
npm run start

# Compilar para producción
ng build

# Ejecutar tests (si están configurados)
ng test

# Ver la estructura del proyecto
tree src/ (Linux/Mac) o dir src\ /s (Windows)
```

---

## 💡 **TIPS PARA EL ÉXITO**

### **🎯 Antes de Empezar**
1. **Lee este README completo** - Te ahorrará tiempo después
2. **Abre Angular DevTools** en tu navegador para debugging
3. **Ten la consola abierta** para ver logs y errores
4. **Usa un editor con soporte TypeScript** (VS Code recomendado)

### **🔧 Durante el Desarrollo**
1. **Prueba cada funcionalidad** después de implementarla
2. **Usa console.log()** para entender el flujo de datos
3. **Experimenta con los filtros** para ver el binding en acción
4. **Modifica valores** y observa cómo se actualiza la UI

### **🎓 Para Aprender Mejor**
1. **Comenta tu código** explicando qué hace cada binding
2. **Experimenta cambiando valores** en el componente
3. **Agrega nuevos productos** al array de datos
4. **Crea nuevos filtros** siguiendo los patrones existentes

---

## 🌟 **CASOS DE USO REALES EN PROVIAS**

### **📋 Sistema de Inventario**
```typescript
// Ejemplo real: Gestión de materiales
materials = [
  {
    name: 'Cemento Portland Tipo I',
    quantity: 150,
    unit: 'bolsas',
    supplier: 'UNACEM',
    lastUpdated: new Date()
  }
];
```

### **🚛 Control de Equipos**
```typescript
// Ejemplo real: Seguimiento de maquinaria
equipment = [
  {
    name: 'Excavadora CAT 320D',
    status: 'operational',
    location: 'Proyecto Norte KM 45',
    operator: 'Juan Pérez',
    hoursWorked: 1250
  }
];
```

### **📊 Dashboard Ejecutivo**
```typescript
// Ejemplo real: Métricas en tiempo real
statistics = {
  activeProjects: 42,
  budgetUsed: 89500000,
  completionRate: 0.685,
  lastUpdate: new Date()
};
```

---

## 🎯 **PRÓXIMOS PASOS**

Después de completar este lab, estarás listo para:

- **Lab 2:** Binding Avanzado (NgClass, NgStyle, HostListener)
- **Lab 3:** Pipes Built-in y Async (Transformación de datos)
- **Lab 4:** Pipes Personalizados (Crear tus propias herramientas)

Cada lab construye sobre el anterior, así que asegúrate de entender bien los conceptos antes de continuar.

---

## 📞 **¿NECESITAS AYUDA?**

### **🐛 Si encuentras errores:**
1. Revisa la consola del navegador (F12)
2. Verifica que FormsModule esté importado
3. Asegúrate de que no hay errores TypeScript
4. Consulta la documentación oficial de Angular

### **💭 Si tienes dudas conceptuales:**
1. Relee las explicaciones de cada tipo de binding
2. Experimenta modificando el código
3. Usa Angular DevTools para inspeccionar el binding
4. Consulta con el instructor

### **🎯 Para profundizar:**
- [Documentación oficial de Data Binding](https://angular.dev/guide/templates/binding)
- [Guía de FormsModule](https://angular.dev/guide/forms)
- [Best Practices de Angular](https://angular.dev/guide/styleguide)

---

**¡Prepárate para convertirte en un maestro del Data Binding! 🚀**

*Este lab es tu primer paso hacia el dominio completo de Angular v18*