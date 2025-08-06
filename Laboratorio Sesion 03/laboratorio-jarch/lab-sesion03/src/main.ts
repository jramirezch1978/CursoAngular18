import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('🚀 Iniciando Lab Sesión 03: JARCH - PROVIAS');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('❌ Error al inicializar la aplicación:', err);
  });
