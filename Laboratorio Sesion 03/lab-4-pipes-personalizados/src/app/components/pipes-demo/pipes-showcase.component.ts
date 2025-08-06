import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Import all custom pipes
import { FilterPipe } from '../../pipes/filter.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { SearchHighlightPipe } from '../../pipes/search-highlight.pipe';
import { SortByPipe } from '../../pipes/sort-by.pipe';

// Import models and services
import { 
  DemoConfig, 
  SampleData, 
  DemoTab, 
  PipeExample,
  PerformanceMetrics,
  Project,
  Employee,
  Equipment,
  Report
} from '../../models/demo-data.interface';
import { DemoDataService } from '../../services/demo-data.service';

@Component({
  selector: 'app-pipes-showcase',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    FilterPipe,
    TruncatePipe,
    FileSizePipe,
    TimeAgoPipe,
    SearchHighlightPipe,
    SortByPipe
  ],
  templateUrl: './pipes-showcase.component.html',
  styleUrl: './pipes-showcase.component.scss'
})
export class PipesShowcaseComponent implements OnInit, OnDestroy {
  
  // 📊 Observables
  config$: Observable<DemoConfig>;
  metrics$: Observable<PerformanceMetrics[]>;

  // 🎮 Estado del componente
  currentTab: DemoTab = 'overview';
  sampleData: SampleData;
  pipeDocumentation: PipeExample[];
  
  // 📝 Configuración local
  searchTerm = '';
  selectedField = '';
  truncateLimit = 50;
  truncateTrail = '...';
  useWordBoundary = true;
  fileSizeUnits: 'binary' | 'decimal' = 'binary';
  fileSizeDecimals = 2;
  highlightClass = 'highlight';
  caseSensitive = false;
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortDataType: 'string' | 'number' | 'date' = 'string';
  
  // 🎯 Datos para demonstración
  filteredProjects: Project[] = [];
  selectedText = 'PROVIAS DESCENTRALIZADO es el organismo técnico especializado adscrito al Ministerio de Transportes y Comunicaciones, responsable de la gestión de la infraestructura vial descentralizada.';
  selectedNumber = 1073741824; // 1 GB en bytes
  selectedDate = new Date();
  highlightTerm = 'PROVIAS';

  // 📊 Performance tracking
  lastExecutionTimes: { [key: string]: number } = {};
  showPerformanceMetrics = false;

  // 🗑️ Cleanup
  private destroy$ = new Subject<void>();

  // 📋 Tabs disponibles
  availableTabs: Array<{value: DemoTab, label: string, icon: string}> = [
    { value: 'overview', label: 'Resumen General', icon: '🏠' },
    { value: 'filter', label: 'FilterPipe', icon: '🔍' },
    { value: 'truncate', label: 'TruncatePipe', icon: '✂️' },
    { value: 'fileSize', label: 'FileSizePipe', icon: '📁' },
    { value: 'timeAgo', label: 'TimeAgoPipe', icon: '⏰' },
    { value: 'highlight', label: 'SearchHighlightPipe', icon: '🖍️' },
    { value: 'sortBy', label: 'SortByPipe', icon: '📊' },
    { value: 'testing', label: 'Testing', icon: '🧪' },
    { value: 'performance', label: 'Performance', icon: '⚡' }
  ];

  // 🎛️ Opciones para filtros
  projectFields = [
    { value: '', label: 'Todos los campos' },
    { value: 'name', label: 'Nombre' },
    { value: 'description', label: 'Descripción' },
    { value: 'manager', label: 'Responsable' },
    { value: 'region', label: 'Región' },
    { value: 'tags', label: 'Etiquetas' }
  ];

  sortFields = [
    { value: 'name', label: 'Nombre', type: 'string' },
    { value: 'budget', label: 'Presupuesto', type: 'number' },
    { value: 'createdAt', label: 'Fecha Creación', type: 'date' },
    { value: 'updatedAt', label: 'Última Actualización', type: 'date' },
    { value: 'fileSize', label: 'Tamaño de Archivos', type: 'number' }
  ];

  constructor(private demoDataService: DemoDataService) {
    this.config$ = this.demoDataService.config$;
    this.metrics$ = this.demoDataService.metrics$;
  }

  ngOnInit(): void {
    console.log('🔧 PipesShowcaseComponent inicializado');
    
    // Cargar datos de ejemplo
    this.sampleData = this.demoDataService.getSampleData();
    this.filteredProjects = [...this.sampleData.projects];
    this.pipeDocumentation = this.demoDataService.getPipeDocumentation();

    // Suscribirse a configuración
    this.config$.pipe(takeUntil(this.destroy$)).subscribe(config => {
      this.updateLocalConfig(config);
    });

    // Actualizar fecha cada segundo para demostrar TimeAgoPipe
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Trigger change detection for timeAgo pipe
    });

    console.log('📊 Datos cargados:', {
      projects: this.sampleData.projects.length,
      employees: this.sampleData.employees.length,
      equipment: this.sampleData.equipment.length,
      reports: this.sampleData.reports.length
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🎮 Métodos de navegación
  switchTab(tab: DemoTab): void {
    this.currentTab = tab;
    console.log(`🎯 Cambiando a tab: ${tab}`);
  }

  // 🔍 Métodos para FilterPipe
  onSearchChange(): void {
    const startTime = performance.now();
    
    if (this.searchTerm) {
      this.filteredProjects = this.sampleData.projects.filter(project => {
        if (this.selectedField) {
          const fieldValue = this.getNestedProperty(project, this.selectedField);
          return fieldValue?.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
        } else {
          return this.searchInAllProperties(project, this.searchTerm.toLowerCase());
        }
      });
    } else {
      this.filteredProjects = [...this.sampleData.projects];
    }

    const executionTime = performance.now() - startTime;
    this.recordExecution('FilterPipe', executionTime);
    
    console.log(`🔍 Filtro aplicado: "${this.searchTerm}" en campo "${this.selectedField || 'todos'}" - ${executionTime.toFixed(2)}ms`);
  }

  onFieldChange(): void {
    this.onSearchChange(); // Re-aplicar filtro con nuevo campo
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedField = '';
    this.filteredProjects = [...this.sampleData.projects];
    console.log('🧹 Filtro limpiado');
  }

  // ✂️ Métodos para TruncatePipe
  onTruncateConfigChange(): void {
    this.demoDataService.updateConfig({
      truncateLimit: this.truncateLimit,
      truncateTrail: this.truncateTrail,
      useWordBoundary: this.useWordBoundary
    });
    
    console.log('✂️ Configuración de truncate actualizada:', {
      limit: this.truncateLimit,
      trail: this.truncateTrail,
      wordBoundary: this.useWordBoundary
    });
  }

  // 📁 Métodos para FileSizePipe
  onFileSizeConfigChange(): void {
    this.demoDataService.updateConfig({
      fileSizeUnits: this.fileSizeUnits,
      fileSizeDecimals: this.fileSizeDecimals
    });
    
    console.log('📁 Configuración de fileSize actualizada:', {
      units: this.fileSizeUnits,
      decimals: this.fileSizeDecimals
    });
  }

  // 🖍️ Métodos para SearchHighlightPipe
  onHighlightConfigChange(): void {
    this.demoDataService.updateConfig({
      highlightClass: this.highlightClass,
      caseSensitive: this.caseSensitive
    });
    
    console.log('🖍️ Configuración de highlight actualizada:', {
      class: this.highlightClass,
      caseSensitive: this.caseSensitive
    });
  }

  // 📊 Métodos para SortByPipe
  onSortConfigChange(): void {
    const startTime = performance.now();
    
    this.filteredProjects = [...this.filteredProjects].sort((a, b) => {
      const aValue = this.getNestedProperty(a, this.sortField);
      const bValue = this.getNestedProperty(b, this.sortField);

      let comparison = 0;

      switch (this.sortDataType) {
        case 'number':
          comparison = (Number(aValue) || 0) - (Number(bValue) || 0);
          break;
        case 'date':
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          comparison = aDate.getTime() - bDate.getTime();
          break;
        default: // string
          const aStr = (aValue || '').toString().toLowerCase();
          const bStr = (bValue || '').toString().toLowerCase();
          comparison = aStr.localeCompare(bStr);
      }

      return this.sortDirection === 'desc' ? -comparison : comparison;
    });

    const executionTime = performance.now() - startTime;
    this.recordExecution('SortByPipe', executionTime);
    
    console.log(`📊 Ordenamiento aplicado: ${this.sortField} (${this.sortDirection}) - ${executionTime.toFixed(2)}ms`);
  }

  onSortFieldChange(): void {
    const field = this.sortFields.find(f => f.value === this.sortField);
    if (field) {
      this.sortDataType = field.type as 'string' | 'number' | 'date';
    }
    this.onSortConfigChange();
  }

  // 📊 Métodos de performance
  recordExecution(pipeName: string, executionTime: number): void {
    this.lastExecutionTimes[pipeName] = executionTime;
    this.demoDataService.recordPipeExecution(pipeName, executionTime);
  }

  togglePerformanceMetrics(): void {
    this.showPerformanceMetrics = !this.showPerformanceMetrics;
    this.demoDataService.updateConfig({ 
      showPerformanceMetrics: this.showPerformanceMetrics 
    });
  }

  clearPerformanceMetrics(): void {
    this.demoDataService.clearMetrics();
    this.lastExecutionTimes = {};
    console.log('📊 Métricas de performance limpiadas');
  }

  // 🔧 Métodos auxiliares
  private updateLocalConfig(config: DemoConfig): void {
    this.searchTerm = config.searchTerm;
    this.selectedField = config.selectedField;
    this.truncateLimit = config.truncateLimit;
    this.truncateTrail = config.truncateTrail;
    this.useWordBoundary = config.useWordBoundary;
    this.fileSizeUnits = config.fileSizeUnits;
    this.fileSizeDecimals = config.fileSizeDecimals;
    this.highlightClass = config.highlightClass;
    this.caseSensitive = config.caseSensitive;
    this.sortField = config.sortField;
    this.sortDirection = config.sortDirection;
    this.sortDataType = config.sortDataType;
    this.showPerformanceMetrics = config.showPerformanceMetrics;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private searchInAllProperties(obj: any, searchValue: string): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }

    if (typeof obj === 'string' || typeof obj === 'number') {
      return obj.toString().toLowerCase().includes(searchValue);
    }

    if (Array.isArray(obj)) {
      return obj.some(item => this.searchInAllProperties(item, searchValue));
    }

    if (typeof obj === 'object') {
      return Object.values(obj).some(value => 
        this.searchInAllProperties(value, searchValue)
      );
    }

    return false;
  }

  // 🎨 Métodos de presentación
  getTabIcon(tab: DemoTab): string {
    const tabInfo = this.availableTabs.find(t => t.value === tab);
    return tabInfo?.icon || '📄';
  }

  getTabLabel(tab: DemoTab): string {
    const tabInfo = this.availableTabs.find(t => t.value === tab);
    return tabInfo?.label || tab;
  }

  getPipeExample(pipeId: string): PipeExample | undefined {
    return this.pipeDocumentation.find(p => p.id === pipeId);
  }

  formatExecutionTime(time: number): string {
    if (time < 1) {
      return `${(time * 1000).toFixed(0)}μs`;
    } else if (time < 1000) {
      return `${time.toFixed(2)}ms`;
    } else {
      return `${(time / 1000).toFixed(2)}s`;
    }
  }

  getPerformanceStatus(time: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (time < 1) return 'excellent';
    if (time < 5) return 'good';
    if (time < 10) return 'fair';
    return 'poor';
  }

  // 🧪 Métodos de testing
  runPipeTests(): void {
    console.log('🧪 Ejecutando tests de pipes...');

    // Test FilterPipe
    const filterPipe = new FilterPipe();
    const testProjects = this.sampleData.projects.slice(0, 3);
    
    console.group('FilterPipe Tests');
    console.log('Test 1 - Filtro básico:', filterPipe.transform(testProjects, 'carretera'));
    console.log('Test 2 - Filtro por campo:', filterPipe.transform(testProjects, 'María', 'manager'));
    console.log('Test 3 - Sin resultados:', filterPipe.transform(testProjects, 'xyz123'));
    console.groupEnd();

    // Test TruncatePipe
    const truncatePipe = new TruncatePipe();
    const longText = 'Este es un texto muy largo que necesita ser truncado para demostrar el funcionamiento del pipe';
    
    console.group('TruncatePipe Tests');
    console.log('Test 1 - Básico:', truncatePipe.transform(longText, 30));
    console.log('Test 2 - Con word boundary:', truncatePipe.transform(longText, 30, '...', true));
    console.log('Test 3 - Trail personalizado:', truncatePipe.transform(longText, 25, ' [leer más]'));
    console.groupEnd();

    // Test FileSizePipe
    const fileSizePipe = new FileSizePipe();
    
    console.group('FileSizePipe Tests');
    console.log('Test 1 - Bytes:', fileSizePipe.transform(1024));
    console.log('Test 2 - KB:', fileSizePipe.transform(1048576));
    console.log('Test 3 - Decimal:', fileSizePipe.transform(1000000, 2, 'decimal'));
    console.groupEnd();

    // Test TimeAgoPipe
    const timeAgoPipe = new TimeAgoPipe();
    const now = new Date();
    
    console.group('TimeAgoPipe Tests');
    console.log('Test 1 - 1 hora atrás:', timeAgoPipe.transform(new Date(now.getTime() - 3600000)));
    console.log('Test 2 - 1 día atrás:', timeAgoPipe.transform(new Date(now.getTime() - 86400000)));
    console.log('Test 3 - 1 semana atrás:', timeAgoPipe.transform(new Date(now.getTime() - 604800000)));
    console.groupEnd();

    // Test SortByPipe
    const sortByPipe = new SortByPipe();
    
    console.group('SortByPipe Tests');
    console.log('Test 1 - Ordenar por nombre:', sortByPipe.transform(testProjects, 'name', 'asc'));
    console.log('Test 2 - Ordenar por presupuesto:', sortByPipe.transform(testProjects, 'budget', 'desc', 'number'));
    console.groupEnd();
  }

  // 📈 Métodos de benchmarking
  runPerformanceBenchmark(): void {
    console.log('📈 Ejecutando benchmark de performance...');
    
    const iterations = 1000;
    const largeDataset = Array(100).fill(null).map((_, i) => ({
      id: i,
      name: `Proyecto ${i}`,
      description: `Descripción del proyecto número ${i} con mucho texto para probar performance`,
      budget: Math.random() * 1000000,
      createdAt: new Date(Date.now() - Math.random() * 31536000000)
    }));

    // Benchmark FilterPipe
    const filterPipe = new FilterPipe();
    const filterStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      filterPipe.transform(largeDataset, 'proyecto');
    }
    const filterTime = performance.now() - filterStart;

    // Benchmark SortByPipe
    const sortByPipe = new SortByPipe();
    const sortStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      sortByPipe.transform(largeDataset, 'name', 'asc');
    }
    const sortTime = performance.now() - sortStart;

    console.table({
      'FilterPipe': {
        'Total Time (ms)': filterTime.toFixed(2),
        'Avg Time (ms)': (filterTime / iterations).toFixed(4),
        'Ops/sec': Math.round(iterations / (filterTime / 1000))
      },
      'SortByPipe': {
        'Total Time (ms)': sortTime.toFixed(2),
        'Avg Time (ms)': (sortTime / iterations).toFixed(4),
        'Ops/sec': Math.round(iterations / (sortTime / 1000))
      }
    });
  }

  // 🎛️ Reset y configuración
  resetAllConfig(): void {
    this.demoDataService.resetConfig();
    this.filteredProjects = [...this.sampleData.projects];
    console.log('🔄 Configuración reiniciada');
  }

  exportConfig(): void {
    const config = {
      searchTerm: this.searchTerm,
      selectedField: this.selectedField,
      truncateLimit: this.truncateLimit,
      truncateTrail: this.truncateTrail,
      useWordBoundary: this.useWordBoundary,
      fileSizeUnits: this.fileSizeUnits,
      fileSizeDecimals: this.fileSizeDecimals,
      highlightClass: this.highlightClass,
      caseSensitive: this.caseSensitive,
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      sortDataType: this.sortDataType
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'pipes-demo-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('💾 Configuración exportada');
  }
}