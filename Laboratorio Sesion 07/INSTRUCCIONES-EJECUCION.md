# 🚀 INSTRUCCIONES DE EJECUCIÓN - LABORATORIOS SESIÓN 7

**PROVIAS DESCENTRALIZADO - ANGULAR v18**  
**Instructor:** Ing. Jhonny Alexander Ramirez Chiroque  

## ⚠️ PROBLEMAS SOLUCIONADOS

### ✅ Errores Corregidos:
1. **JSON Server `--delay` deprecado** - Removido de todos los scripts
2. **Archivos de configuración faltantes** - `proxy.conf.json` y `db.json` agregados a cada proyecto
3. **Scripts de npm incorrectos** - Todos los `package.json` actualizados
4. **Dashboard por defecto** - Reemplazado por interfaces específicas de cada laboratorio

---

## 📋 REQUISITOS PREVIOS

```bash
# Verificar versiones
node --version    # v18.19.0+ (funciona con v24.5.0)
npm --version     # 8.0.0+
ng version        # Angular CLI 18+

# Instalar JSON Server globalmente si no está
npm install -g json-server
```

---

## 🛠️ CÓMO EJECUTAR CADA LABORATORIO

### 📁 LAB 0: Configuración del Entorno
**Ubicación:** `lab0-configuracion-entorno/`
**Propósito:** Guía de configuración únicamente (sin código ejecutable)

```bash
# Solo leer el README.md - Es guía teórica
cd lab0-configuracion-entorno/
# Lee README.md para preparar tu entorno
```

### 📁 LAB 1: Fundamentos de Asincronía  
**Ubicación:** `lab1-fundamentos-asincronia/provias-lab1-asincronia/`

```bash
# 1. Navegar al proyecto
cd lab1-fundamentos-asincronia/provias-lab1-asincronia/

# 2. Instalar dependencias (si es primera vez)
npm install

# 3. OPCIÓN A: Ejecutar con API Mock automática
npm run dev
# Esto ejecuta JSON Server + Angular simultáneamente

# 4. OPCIÓN B: Ejecutar manualmente (2 terminales)
# Terminal 1: API Mock
npm run api

# Terminal 2: Angular (terminal separado)
npm run serve:proxy

# 5. Abrir navegador
# http://localhost:4200 - Aplicación Angular
# http://localhost:3000 - API Mock (para verificar datos)
```

### 📁 LAB 2: RxJS y Observables
**Ubicación:** `lab2-rxjs-observables/provias-lab2-rxjs/`

```bash
cd lab2-rxjs-observables/provias-lab2-rxjs/
npm install
npm run dev
# http://localhost:4200
```

### 📁 LAB 3: Angular Signals
**Ubicación:** `lab3-angular-signals/provias-lab3-signals/`

```bash
cd lab3-angular-signals/provias-lab3-signals/
npm install
npm run dev
# http://localhost:4200
```

### 📁 LAB 4: Migración y Estado Global
**Ubicación:** `lab4-migracion-estado-global/provias-lab4-migration/`

```bash
cd lab4-migracion-estado-global/provias-lab4-migration/
npm install
npm run dev
# http://localhost:4200
```

---

## 🔧 SCRIPTS DISPONIBLES EN CADA LABORATORIO

Cada proyecto tiene estos scripts configurados:

```json
{
  "scripts": {
    "start": "ng serve",                                    // Angular básico
    "api": "json-server --watch db.json --port 3000",      // Solo API
    "serve:proxy": "ng serve --proxy-config proxy.conf.json", // Angular con proxy
    "dev": "concurrently \"npm run api\" \"npm run serve:proxy\"", // TODO junto
    "build": "ng build",                                    // Compilar para producción
    "test": "ng test"                                       // Ejecutar tests
  }
}
```

### 📊 Recomendación de Uso:
- **`npm run dev`** - ✅ **RECOMENDADO** - Ejecuta todo automáticamente
- **`npm start`** - ⚠️ Solo Angular (sin API Mock)  
- **`npm run api`** + **`npm run serve:proxy`** - Manual (2 terminales)

---

## 🎯 VERIFICACIÓN DE FUNCIONALIDAD

### Para cada laboratorio, verifica:

1. **✅ Angular se ejecuta** - http://localhost:4200 carga sin errores
2. **✅ API Mock funciona** - http://localhost:3000/users retorna datos JSON
3. **✅ Proxy funciona** - http://localhost:4200/api/users retorna los mismos datos  
4. **✅ Interfaz personalizada** - No aparece el dashboard por defecto de Angular
5. **✅ Funcionalidad específica** - Los botones y demos funcionan

### 🧪 Test Rápido de Conectividad:
```bash
# Con la aplicación corriendo, probar en navegador:
http://localhost:4200/api/users
# Debe retornar JSON con usuarios de PROVIAS
```

---

## 🚨 TROUBLESHOOTING

### Problema: "Unknown option '--delay'"
**Solución:** ✅ **YA SOLUCIONADO** - Removí `--delay` de todos los scripts

### Problema: "Proxy configuration file does not exist"
**Solución:** ✅ **YA SOLUCIONADO** - Agregué `proxy.conf.json` a todos los proyectos

### Problema: "Cannot find module 'concurrently'"
**Solución:** ✅ **YA SOLUCIONADO** - Agregué `concurrently` a devDependencies

### Problema: Angular muestra dashboard por defecto
**Solución:** ✅ **YA SOLUCIONADO** - Cada laboratorio tiene interfaz personalizada

### Problema: Puerto 3000 ocupado
**Solución:**
```bash
# Matar proceso en puerto 3000
npx kill-port 3000

# O cambiar puerto en scripts
"api": "json-server --watch db.json --port 3001"
```

### Problema: "Angular Language Service" warnings
**Solución:** Ignorar - Son warnings de extensiones, no afectan funcionalidad

---

## 📁 ESTRUCTURA FINAL VERIFICADA

```
lab1-fundamentos-asincronia/
├── provias-lab1-asincronia/
│   ├── src/app/ (Interfaz LAB 1 personalizada)
│   ├── db.json ✅
│   ├── proxy.conf.json ✅  
│   └── package.json ✅ (scripts corregidos)

lab2-rxjs-observables/
├── provias-lab2-rxjs/
│   ├── src/app/ (Interfaz LAB 2 personalizada)
│   ├── db.json ✅
│   ├── proxy.conf.json ✅
│   └── package.json ✅ (scripts corregidos)

lab3-angular-signals/
├── provias-lab3-signals/
│   ├── src/app/ (Interfaz LAB 3 personalizada)
│   ├── db.json ✅
│   ├── proxy.conf.json ✅
│   └── package.json ✅ (scripts corregidos)

lab4-migracion-estado-global/
├── provias-lab4-migration/
│   ├── src/app/ (Interfaz LAB 4 personalizada)
│   ├── db.json ✅
│   ├── proxy.conf.json ✅
│   └── package.json ✅ (scripts corregidos)
```

---

## ✅ VALIDACIÓN FINAL

### Para validar que todo funciona:

```bash
# Probar LAB 1
cd lab1-fundamentos-asincronia/provias-lab1-asincronia/
npm run dev
# ✅ Debe abrir sin errores

# Probar LAB 2  
cd lab2-rxjs-observables/provias-lab2-rxjs/
npm run dev
# ✅ Debe abrir sin errores

# Y así sucesivamente...
```

---

**🎉 TODOS LOS ERRORES CORREGIDOS - LABORATORIOS LISTOS PARA EJECUTAR**

**Comando único para cada laboratorio:**
```bash
npm run dev
```

**¡Ahora sí pueden ejecutar todos los laboratorios correctamente! 🚀**
