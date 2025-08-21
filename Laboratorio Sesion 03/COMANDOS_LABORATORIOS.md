# 🚀 **COMANDOS PARA EJECUTAR LOS LABORATORIOS**

**PROVIAS DESCENTRALIZADO - Angular v18**

---

## 📋 **LABORATORIOS DISPONIBLES:**

### **🛍️ LAB 1: FUNDAMENTOS DE DATA BINDING**
```bash
cd lab-1-data-binding
npm install
npm run start
```
**🌐 URL:** http://localhost:4200  
**🎯 Funcionalidad:** Sistema de productos con carrito funcional  
**📚 Conceptos:** Interpolación, Property Binding, Event Binding, Two-Way Binding  
**🧭 Navegación:** Vista integrada con toggle Home/Products  

---

### **📊 LAB 2: BINDING AVANZADO**
```bash
cd lab-2-binding-avanzado
npm install
ng serve --port 4201
```
**🌐 URL:** http://localhost:4201  
**🎯 Funcionalidad:** Dashboard ejecutivo interactivo  
**📚 Conceptos:** NgClass, NgStyle, HostListener, HostBinding  
**🧭 Rutas:** `/home`, `/dashboard`  

---

### **📋 LAB 3: PIPES BUILT-IN Y ASYNC**
```bash
cd lab-3-pipes-builtin
npm install
ng serve --port 4202
```
**🌐 URL:** http://localhost:4202  
**🎯 Funcionalidad:** Gestor de tareas con filtrado reactivo  
**📚 Conceptos:** Pipes de texto, número, fecha, async pipe, programación reactiva  
**🧭 Rutas:** `/home`, `/tasks`  

---

### **🔧 LAB 4: PIPES PERSONALIZADOS**
```bash
cd lab-4-pipes-personalizados
npm install
ng serve --port 4203
```
**🌐 URL:** http://localhost:4203  
**🎯 Funcionalidad:** Showcase interactivo de 6 pipes personalizados  
**📚 Conceptos:** FilterPipe, TruncatePipe, FileSizePipe, TimeAgoPipe, SearchHighlightPipe, SortByPipe  
**🧭 Rutas:** `/home`, `/pipes`  

---

## 🎯 **COMANDOS RÁPIDOS:**

### **🚀 Levantar todos los labs simultáneamente:**
```bash
# Terminal 1
cd lab-1-data-binding && npm run start

# Terminal 2  
cd lab-2-binding-avanzado && ng serve --port 4201

# Terminal 3
cd lab-3-pipes-builtin && ng serve --port 4202

# Terminal 4
cd lab-4-pipes-personalizados && ng serve --port 4203
```

### **📦 Instalar dependencias en todos:**
```bash
cd lab-1-data-binding && npm install
cd ../lab-2-binding-avanzado && npm install
cd ../lab-3-pipes-builtin && npm install
cd ../lab-4-pipes-personalizados && npm install
```

### **🏗️ Build de producción:**
```bash
# Lab específico
ng build --configuration production

# Todos los labs
cd lab-1-data-binding && ng build
cd ../lab-2-binding-avanzado && ng build
cd ../lab-3-pipes-builtin && ng build
cd ../lab-4-pipes-personalizados && ng build
```

---

## 🎓 **OBJETIVOS PEDAGÓGICOS POR LAB:**

### **LAB 1:** Fundamentos de Data Binding
- ✅ Dominar los 4 tipos básicos de binding
- ✅ Implementar carrito de compras funcional
- ✅ Usar pipes built-in básicos
- ✅ Crear interfaces interactivas

### **LAB 2:** Binding Avanzado
- ✅ Aplicar NgClass y NgStyle dinámicos
- ✅ Implementar HostListener para eventos globales
- ✅ Usar HostBinding para propiedades del host
- ✅ Crear dashboard empresarial

### **LAB 3:** Pipes Built-in y Async
- ✅ Usar todos los pipes nativos de Angular
- ✅ Implementar async pipe para programación reactiva
- ✅ Crear filtrado en tiempo real
- ✅ Manejar estados de carga y error

### **LAB 4:** Pipes Personalizados
- ✅ Crear 6 pipes personalizados funcionales
- ✅ Entender diferencia entre pipes puros e impuros
- ✅ Implementar seguridad con DomSanitizer
- ✅ Optimizar performance con memoización

---

## 🔧 **TROUBLESHOOTING:**

### **❌ Error: "This command is not available when running the Angular CLI outside a workspace"**
**Solución:** Verificar que estás en el directorio correcto del lab y que existe `angular.json`

### **❌ Error: "Module not found"**
**Solución:** Ejecutar `npm install` en el directorio del lab

### **❌ Error: "Port 4200 is already in use"**
**Solución:** Usar puertos diferentes: `ng serve --port 4201`

### **❌ Error: "Failed to compile"**
**Solución:** Revisar errores TypeScript en la consola y corregir

---

## 📊 **VERIFICACIÓN DE FUNCIONALIDAD:**

### **✅ Checklist por Lab:**

**Lab 1:**
- [ ] Página carga correctamente
- [ ] Navegación Home/Products funciona
- [ ] Filtros de productos responden
- [ ] Carrito agrega/remueve items
- [ ] Two-way binding en búsqueda

**Lab 2:**
- [ ] Navegación entre /home y /dashboard
- [ ] Dashboard muestra widgets
- [ ] Temas cambian correctamente
- [ ] HostListener responde a teclas
- [ ] NgClass/NgStyle funcionan

**Lab 3:**
- [ ] Navegación entre /home y /tasks
- [ ] Lista de tareas carga
- [ ] Filtros funcionan en tiempo real
- [ ] Pipes formatean datos correctamente
- [ ] Async pipe maneja observables

**Lab 4:**
- [ ] Navegación entre /home y /pipes
- [ ] Showcase muestra 6 pipes
- [ ] Controles interactivos funcionan
- [ ] Performance metrics se actualizan
- [ ] Pipes personalizados transforman datos

---

## 🎉 **¡LABORATORIOS LISTOS PARA USAR!**

Todos los laboratorios están configurados con routing, componentes modulares y funcionalidad completa según las especificaciones de PROVIAS DESCENTRALIZADO.

**¡Excelente trabajo completando la Sesión 3 de Angular v18! 🎓**
