import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

console.log('🚀 Iniciando Lab 4: Pipes Personalizados - PROVIAS');

bootstrapApplication(AppComponent, {
  providers: []
}).catch(err => {
  console.error('❌ Error al inicializar la aplicación:', err);
});