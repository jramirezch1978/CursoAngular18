# Validación Laboratorio 0: Configuración de Herramientas

## Checklist de Verificación
- [ ] Node.js instalado y versión >= 18.19.0
- [ ] npm instalado y versión >= 9.0.0
- [ ] Angular CLI instalado globalmente (ng version muestra 18.x.x)
- [ ] Visual Studio Code instalado y con extensiones recomendadas
- [ ] Git instalado y configurado (usuario y correo)

## Comandos de Prueba
```bash
node --version
npm --version
git --version
ng version
```

## Troubleshooting Ampliado
- **Node.js no reconocido:**
  - Reinstalar Node.js y asegurarse de marcar "Add to PATH".
  - Verificar variable de entorno PATH.
- **ng no reconocido:**
  - Ejecutar `npm install -g @angular/cli@18` nuevamente.
  - Verificar el prefijo global de npm: `npm config get prefix` y agregarlo al PATH.
- **Permisos en npm (Linux/macOS):**
  - Usar `sudo` o configurar npm para no requerir sudo.
- **Extensiones VS Code no funcionan:**
  - Actualizar VS Code, recargar ventana o reinstalar extensiones.
- **Git no reconocido:**
  - Reinstalar Git y reiniciar terminal.

---
Si todo está en orden, ¡puedes continuar con el Laboratorio 1! 