import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

console.log('🚀 Iniciando Lab 1: Data Binding - PROVIAS');

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
}).catch(err => {
  console.error('❌ Error al inicializar la aplicación:', err);
});