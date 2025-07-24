# Laboratorio 0: Configuración de Herramientas y Entorno

## Propósito
Configurar correctamente el entorno de desarrollo para trabajar con Angular v18, asegurando que todas las herramientas necesarias estén instaladas y listas para usar.

## Pasos Detallados

### 1. Verificación e Instalación de Node.js y npm
- **Verificar instalación:**
  ```bash
  node --version
  npm --version
  ```
  - Resultado esperado: Node.js v18.19.0+ y npm 9.0.0+
- **Instalar Node.js (si es necesario):**
  - Descargar desde [nodejs.org](https://nodejs.org/en/download/) (LTS recomendado)
  - Seguir el asistente de instalación según tu sistema operativo

### 2. Instalación de Visual Studio Code y Extensiones
- Descargar desde [Visual Studio Code](https://code.visualstudio.com/download)
- Instalar extensiones recomendadas:
  - Angular Language Service
  - Angular Snippets (John Papa)
  - Prettier - Code formatter
  - Auto Rename Tag
  - GitLens
  - Material Icon Theme

### 3. Instalación y Configuración de Git
- **Verificar instalación:**
  ```bash
  git --version
  ```
- **Instalar Git:**
  - [Descargar para Windows](https://git-scm.com/download/win)
  - [Descargar para macOS](https://git-scm.com/download/mac) o `xcode-select --install`
  - Linux: `sudo apt update && sudo apt install git`
- **Configurar usuario:**
  ```bash
  git config --global user.name "Tu Nombre Completo"
  git config --global user.email "tu.email@empresa.com"
  git config --list
  ```

### 4. Instalación de Angular CLI
- **Instalar Angular CLI v18 globalmente:**
  ```bash
  npm install -g @angular/cli@18
  ng version
  ```
- **Comandos útiles:**
  ```bash
  ng analytics on   # (opcional)
  ng help
  ```

## Troubleshooting
- **Node.js no reconocido:**
  - Agregar Node.js al PATH o reinstalar seleccionando "Add to PATH"
- **ng no reconocido:**
  - Instalar Angular CLI globalmente o agregar el prefijo npm al PATH
- **Permisos en npm (Linux/macOS):**
  - Usar `sudo` o configurar npm para no requerir sudo
- **Extensiones VS Code no funcionan:**
  - Verificar actualización de VS Code y recargar ventana

## Checklist de Validación
- [ ] Node.js v18+ instalado y funcionando
- [ ] npm actualizado y configurado
- [ ] Visual Studio Code con extensiones esenciales
- [ ] Git instalado y configurado
- [ ] Angular CLI v18 instalado globalmente
- [ ] Entorno listo para desarrollo Angular

---
¡Entorno listo! Continúa con el Laboratorio 1 para crear tu primer proyecto Angular. 