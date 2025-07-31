import { Component, OnInit, OnDestroy, OnChanges, AfterViewInit, 
         AfterContentInit, Input, SimpleChanges } from '@angular/core';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-lifecycle-demo',
  standalone: true,
  imports: [],
  templateUrl: './lifecycle-demo.component.html',
  styleUrl: './lifecycle-demo.component.scss'
})
export class LifecycleDemoComponent implements OnInit, OnDestroy, 
  OnChanges, AfterViewInit, AfterContentInit {
  
  // 🎯 Input property para demostrar ngOnChanges
  @Input() inputData: string = '';
  
  // 📊 Variables para tracking del estado del componente
  private intervalId?: number;
  private startTime: number;
  
  // 🔧 Inyectar Logger Service
  constructor(private logger: LoggerService) {
    this.startTime = Date.now();
    this.logger.debug('LifecycleDemoComponent', 'Constructor - Componente creado e inyección completada');
  }
  
  // 🔄 Se ejecuta cuando cambian las propiedades @Input
  ngOnChanges(changes: SimpleChanges): void {
    this.logger.info('LifecycleDemoComponent', 'ngOnChanges ejecutado', {
      changes: Object.keys(changes),
      inputData: changes['inputData']
    });
    
    // 🎯 Log específico para cambios de input
    if (changes['inputData']) {
      const change = changes['inputData'];
      this.logger.debug('LifecycleDemoComponent', 
        `Input Data cambió: "${change.previousValue}" → "${change.currentValue}"`);
    }
  }
  
  // 🚀 Inicialización principal - aquí va la lógica de setup
  ngOnInit(): void {
    this.logger.info('LifecycleDemoComponent', 'ngOnInit - Inicializando componente, momento ideal para HTTP calls');
    this.startTimer();
  }
  
  // 📝 Contenido proyectado inicializado (ng-content)
  ngAfterContentInit(): void {
    this.logger.debug('LifecycleDemoComponent', 'ngAfterContentInit - Contenido proyectado inicializado');
  }
  
  // 👁️ Vista completamente inicializada - DOM accesible
  ngAfterViewInit(): void {
    this.logger.debug('LifecycleDemoComponent', 'ngAfterViewInit - Vista completamente renderizada, DOM accesible');
  }
  
  // 🧹 CRUCIAL: Limpieza antes de destruir el componente
  ngOnDestroy(): void {
    this.logger.warn('LifecycleDemoComponent', 'ngOnDestroy - Iniciando limpieza de recursos antes de destruir');
    this.clearTimer();
    this.logger.info('LifecycleDemoComponent', 'ngOnDestroy completado - Componente listo para destrucción');
  }
  
  // 🔄 Métodos actualizados con logging detallado
  
  private startTimer(): void {
    this.intervalId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.logger.debug('LifecycleDemoComponent', `Timer tick: componente activo por ${elapsed} segundos`);
    }, 3000); // Cada 3 segundos para reducir spam en logs
    
    this.logger.info('LifecycleDemoComponent', 'Timer iniciado exitosamente', {
      interval: '3 segundos',
      timerId: this.intervalId
    });
  }
  
  private clearTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.info('LifecycleDemoComponent', 'Timer limpiado correctamente - Sin memory leaks', {
        timerId: this.intervalId
      });
      this.intervalId = undefined;
    } else {
      this.logger.warn('LifecycleDemoComponent', 'Intento de limpiar timer que no existía');
    }
  }
  
  // 🎮 Métodos públicos actualizados
  
  simulateInputChange(): void {
    const oldValue = this.inputData;
    const newValue = `Actualizado: ${new Date().toLocaleTimeString()}`;
    this.inputData = newValue;
    
    this.logger.info('LifecycleDemoComponent', 'Input simulado manualmente desde template', {
      previousValue: oldValue,
      newValue: newValue,
      timestamp: new Date().toISOString()
    });
  }
  
  getComponentAge(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
  
  isTimerActive(): boolean {
    return this.intervalId !== undefined;
  }
  
  // 🔧 Nuevos métodos para interactuar con el logger
  
  /**
   * 🧹 Limpiar todos los logs desde el componente
   */
  clearLogs(): void {
    this.logger.clearLogs();
  }
  
  /**
   * 📊 Obtener estadísticas de logs
   */
  getLogStats() {
    return this.logger.getStats();
  }
  
  /**
   * 🎯 Demostrar diferentes niveles de log
   */
  demonstrateLogLevels(): void {
    this.logger.debug('LifecycleDemoComponent', 'Ejemplo de log DEBUG', { tipo: 'demo' });
    this.logger.info('LifecycleDemoComponent', 'Ejemplo de log INFO', { tipo: 'demo' });
    this.logger.warn('LifecycleDemoComponent', 'Ejemplo de log WARNING', { tipo: 'demo' });
    this.logger.error('LifecycleDemoComponent', 'Ejemplo de log ERROR', { tipo: 'demo' });
  }
}