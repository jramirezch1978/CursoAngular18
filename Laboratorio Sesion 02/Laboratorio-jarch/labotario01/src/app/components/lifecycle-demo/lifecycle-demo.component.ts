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
  
  @Input() inputData: string = '';
  
  private intervalId?: number;
  private startTime: number;
  
  constructor(private logger: LoggerService) {
    this.startTime = Date.now();
    this.logger.debug('LifecycleDemoComponent', 'Constructor - Componente creado');
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.logger.info('LifecycleDemoComponent', 'ngOnChanges ejecutado', changes);
  }
  
  ngOnInit(): void {
    this.logger.info('LifecycleDemoComponent', 'ngOnInit - Inicializando componente');
    this.startTimer();
  }
  
  ngAfterContentInit(): void {
    this.logger.debug('LifecycleDemoComponent', 'ngAfterContentInit ejecutado');
  }
  
  ngAfterViewInit(): void {
    this.logger.debug('LifecycleDemoComponent', 'ngAfterViewInit - Vista lista');
  }
  
  ngOnDestroy(): void {
    this.logger.warn('LifecycleDemoComponent', 'ngOnDestroy - Limpiando recursos');
    this.clearTimer();
  }
  
  private startTimer(): void {
    this.intervalId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.logger.debug('LifecycleDemoComponent', `Timer tick: ${elapsed} segundos activo`);
    }, 3000);
  }
  
  private clearTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.info('LifecycleDemoComponent', 'Timer limpiado exitosamente');
    }
  }
  
  simulateInputChange(): void {
    const newData = `Esta data esta siendo cambiada a las : ${new Date().toLocaleTimeString()}`;
    this.inputData = newData;
    this.logger.info('LifecycleDemoComponent', 'Input simulado cambiado', { newData });
  }
  
  clearLogs(): void {
    this.logger.clearLogs();
  }
}
