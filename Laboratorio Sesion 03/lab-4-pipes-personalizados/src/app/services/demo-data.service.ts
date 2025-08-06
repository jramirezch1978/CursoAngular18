import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  Project, 
  Employee, 
  Equipment, 
  Report,
  SampleData,
  DemoConfig,
  PerformanceMetrics,
  PipeExample,
  CodeExample,
  UseCase,
  PipeParameter
} from '../models/demo-data.interface';

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {
  
  private configSubject = new BehaviorSubject<DemoConfig>({
    searchTerm: '',
    selectedField: '',
    truncateLimit: 50,
    truncateTrail: '...',
    useWordBoundary: true,
    fileSizeUnits: 'binary',
    fileSizeDecimals: 2,
    highlightClass: 'highlight',
    caseSensitive: false,
    sortField: 'name',
    sortDirection: 'asc',
    sortDataType: 'string',
    showPerformanceMetrics: false
  });

  private metricsSubject = new BehaviorSubject<PerformanceMetrics[]>([]);

  public config$ = this.configSubject.asObservable();
  public metrics$ = this.metricsSubject.asObservable();

  constructor() {
    console.log('🔧 DemoDataService inicializado');
  }

  // Configuración
  updateConfig(updates: Partial<DemoConfig>): void {
    const currentConfig = this.configSubject.value;
    this.configSubject.next({ ...currentConfig, ...updates });
  }

  resetConfig(): void {
    this.configSubject.next({
      searchTerm: '',
      selectedField: '',
      truncateLimit: 50,
      truncateTrail: '...',
      useWordBoundary: true,
      fileSizeUnits: 'binary',
      fileSizeDecimals: 2,
      highlightClass: 'highlight',
      caseSensitive: false,
      sortField: 'name',
      sortDirection: 'asc',
      sortDataType: 'string',
      showPerformanceMetrics: false
    });
  }

  // Métricas de performance
  recordPipeExecution(pipeName: string, executionTime: number): void {
    const currentMetrics = this.metricsSubject.value;
    const existingMetric = currentMetrics.find(m => m.pipeName === pipeName);

    if (existingMetric) {
      existingMetric.executionCount++;
      existingMetric.lastExecution = new Date();
      existingMetric.averageTime = (existingMetric.averageTime + executionTime) / 2;
      
      if (executionTime > existingMetric.executionTime) {
        existingMetric.executionTime = executionTime;
      }
    } else {
      const newMetric: PerformanceMetrics = {
        pipeName,
        executionTime,
        memoryUsage: 0,
        executionCount: 1,
        lastExecution: new Date(),
        averageTime: executionTime
      };
      currentMetrics.push(newMetric);
    }

    this.metricsSubject.next([...currentMetrics]);
  }

  clearMetrics(): void {
    this.metricsSubject.next([]);
  }

  // Datos de ejemplo
  getSampleData(): SampleData {
    return {
      projects: this.generateProjects(),
      employees: this.generateEmployees(),
      equipment: this.generateEquipment(),
      reports: this.generateReports(),
      rawText: this.generateRawText(),
      numbers: this.generateNumbers(),
      dates: this.generateDates(),
      files: this.generateFiles()
    };
  }

  // Documentación de pipes
  getPipeDocumentation(): PipeExample[] {
    return [
      {
        id: 'filter',
        name: 'FilterPipe',
        description: 'Filtra arrays basado en criterios de búsqueda dinámicos',
        syntax: 'array | filter:searchTerm:field',
        examples: this.getFilterExamples(),
        parameters: this.getFilterParameters(),
        useCases: this.getFilterUseCases(),
        performance: {
          isPure: false,
          executionTime: '~2ms para 1000 elementos',
          recommendation: 'Úsalo para filtrado dinámico, considera memoización para datasets grandes'
        }
      },
      {
        id: 'truncate',
        name: 'TruncatePipe',
        description: 'Trunca texto respetando límites de palabra y personalizando el indicador',
        syntax: 'text | truncate:limit:trail:wordBoundary',
        examples: this.getTruncateExamples(),
        parameters: this.getTruncateParameters(),
        useCases: this.getTruncateUseCases(),
        performance: {
          isPure: true,
          executionTime: '~0.1ms por string',
          recommendation: 'Pipe puro, excelente performance para texto estático'
        }
      },
      {
        id: 'fileSize',
        name: 'FileSizePipe',
        description: 'Convierte bytes a unidades legibles (KiB, MB, etc.) con precisión configurable',
        syntax: 'bytes | fileSize:decimals:units',
        examples: this.getFileSizeExamples(),
        parameters: this.getFileSizeParameters(),
        useCases: this.getFileSizeUseCases(),
        performance: {
          isPure: true,
          executionTime: '~0.05ms por conversión',
          recommendation: 'Pipe puro, ideal para formateo de tamaños de archivo'
        }
      },
      {
        id: 'timeAgo',
        name: 'TimeAgoPipe',
        description: 'Convierte fechas a formato relativo humanizado en español',
        syntax: 'date | timeAgo',
        examples: this.getTimeAgoExamples(),
        parameters: this.getTimeAgoParameters(),
        useCases: this.getTimeAgoUseCases(),
        performance: {
          isPure: false,
          executionTime: '~0.2ms por fecha',
          recommendation: 'Pipe impuro para actualización automática, considera intervalos largos'
        }
      },
      {
        id: 'searchHighlight',
        name: 'SearchHighlightPipe',
        description: 'Resalta términos de búsqueda en texto con HTML seguro',
        syntax: 'text | searchHighlight:term:className:caseSensitive',
        examples: this.getHighlightExamples(),
        parameters: this.getHighlightParameters(),
        useCases: this.getHighlightUseCases(),
        performance: {
          isPure: true,
          executionTime: '~0.3ms por texto',
          recommendation: 'Usa DomSanitizer, seguro para contenido HTML'
        }
      },
      {
        id: 'sortBy',
        name: 'SortByPipe',
        description: 'Ordena arrays por campo específico con soporte para múltiples tipos de datos',
        syntax: 'array | sortBy:field:direction:dataType',
        examples: this.getSortByExamples(),
        parameters: this.getSortByParameters(),
        useCases: this.getSortByUseCases(),
        performance: {
          isPure: false,
          executionTime: '~1ms para 1000 elementos',
          recommendation: 'Considera memoización para arrays grandes que cambian poco'
        }
      }
    ];
  }

  // Generadores de datos mock
  private generateProjects(): Project[] {
    return [
      {
        id: 1,
        name: 'Carretera Longitudinal Norte',
        description: 'Construcción de carretera asfaltada de 85 km conectando Trujillo con Chepen, incluyendo obras de arte como puentes, alcantarillas y señalización vial completa para mejorar la conectividad regional.',
        manager: 'Ing. María Torres Valdez',
        region: 'La Libertad',
        budget: 125000000,
        fileSize: 2147483648, // 2 GB
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2025-08-05'),
        status: 'in-progress',
        priority: 'critical',
        tags: ['carretera', 'asfaltado', 'puentes', 'señalizacion'],
        documents: [],
        milestones: []
      },
      {
        id: 2,
        name: 'Mantenimiento Puente Intercontinental',
        description: 'Programa integral de mantenimiento preventivo y correctivo del puente que conecta las regiones de Loreto y Ucayali sobre el río Amazonas.',
        manager: 'Ing. Roberto Díaz Campos',
        region: 'Loreto',
        budget: 8500000,
        fileSize: 524288000, // 500 MB
        createdAt: new Date('2025-07-20'),
        updatedAt: new Date('2025-08-04'),
        status: 'planning',
        priority: 'high',
        tags: ['puente', 'mantenimiento', 'estructural'],
        documents: [],
        milestones: []
      },
      {
        id: 3,
        name: 'Supervisión Túnel Abiseo',
        description: 'Supervisión técnica especializada de la construcción del túnel vehicular Abiseo en la región San Martín.',
        manager: 'Ing. Ana Patricia Vega',
        region: 'San Martín',
        budget: 2800000,
        fileSize: 1073741824, // 1 GB
        createdAt: new Date('2025-06-10'),
        updatedAt: new Date('2025-08-03'),
        status: 'in-progress',
        priority: 'high',
        tags: ['tunel', 'supervision', 'excavacion'],
        documents: [],
        milestones: []
      },
      {
        id: 4,
        name: 'Auditoria Presupuesto Regional Centro',
        description: 'Auditoria integral del presupuesto asignado para proyectos viales en las regiones de Junín, Huancavelica y Ayacucho.',
        manager: 'CPC. Luis Fernando Quispe',
        region: 'Junín',
        budget: 450000,
        fileSize: 104857600, // 100 MB
        createdAt: new Date('2025-05-01'),
        updatedAt: new Date('2025-08-02'),
        status: 'completed',
        priority: 'medium',
        tags: ['auditoria', 'presupuesto', 'verificacion'],
        documents: [],
        milestones: []
      },
      {
        id: 5,
        name: 'Pavimentación Acceso Aeropuerto Cusco',
        description: 'Pavimentación y mejoramiento de la vía de acceso al Aeropuerto Internacional Alejandro Velasco Astete.',
        manager: 'Ing. José Carlos Mendoza',
        region: 'Cusco',
        budget: 45000000,
        fileSize: 3221225472, // 3 GB
        createdAt: new Date('2025-06-20'),
        updatedAt: new Date('2025-08-01'),
        status: 'on-hold',
        priority: 'critical',
        tags: ['pavimentacion', 'aeropuerto', 'acceso'],
        documents: [],
        milestones: []
      }
    ];
  }

  private generateEmployees(): Employee[] {
    return [
      {
        id: 'emp-001',
        fullName: 'María del Carmen Torres Valdez',
        email: 'm.torres@provias.gob.pe',
        department: 'Construcción Vial',
        position: 'Jefe de Proyecto Senior',
        hireDate: new Date('2018-03-15'),
        salary: 8500,
        skills: ['Gestión de Proyectos', 'AutoCAD', 'Supervisión de Obra'],
        performance: 95
      },
      {
        id: 'emp-002',
        fullName: 'Roberto Antonio Díaz Campos',
        email: 'r.diaz@provias.gob.pe',
        department: 'Mantenimiento',
        position: 'Especialista en Puentes',
        hireDate: new Date('2019-07-20'),
        salary: 7200,
        skills: ['Estructuras', 'Inspección', 'Soldadura'],
        performance: 88
      },
      {
        id: 'emp-003',
        fullName: 'Ana Patricia Vega Morales',
        email: 'a.vega@provias.gob.pe',
        department: 'Supervisión',
        position: 'Supervisora de Túneles',
        hireDate: new Date('2020-01-10'),
        salary: 7800,
        skills: ['Túneles', 'Geotecnia', 'Seguridad'],
        performance: 92
      }
    ];
  }

  private generateEquipment(): Equipment[] {
    return [
      {
        id: 'eq-001',
        name: 'Excavadora Caterpillar 320D',
        type: 'excavator',
        manufacturer: 'Caterpillar',
        model: '320D',
        acquisitionDate: new Date('2020-05-15'),
        lastMaintenance: new Date('2025-07-15'),
        nextMaintenance: new Date('2025-09-15'),
        hoursWorked: 1250,
        currentValue: 285000,
        location: 'Proyecto Norte - KM 45',
        operator: 'Juan Pérez',
        fuelConsumption: 18.5,
        status: 'operational'
      },
      {
        id: 'eq-002',
        name: 'Compactadora Vibrátoria CP533E',
        type: 'compactor',
        manufacturer: 'Dynapac',
        model: 'CP533E',
        acquisitionDate: new Date('2021-02-10'),
        lastMaintenance: new Date('2025-08-01'),
        nextMaintenance: new Date('2025-10-01'),
        hoursWorked: 890,
        currentValue: 125000,
        location: 'Taller Central',
        operator: 'Carlos López',
        fuelConsumption: 12.3,
        status: 'maintenance'
      }
    ];
  }

  private generateReports(): Report[] {
    return [
      {
        id: 'rep-001',
        title: 'Informe Mensual de Avance - Julio 2025',
        type: 'monthly',
        author: 'Ing. María Torres',
        createdAt: new Date('2025-07-31'),
        content: 'Durante el mes de julio se registró un avance significativo en el proyecto de la Carretera Longitudinal Norte, alcanzando un 68.5% de progreso total. Las principales actividades ejecutadas incluyeron la pavimentación del tramo KM 45-60 y la instalación de señalización vertical en el tramo ya completado.',
        attachments: ['planos_julio.pdf', 'fotos_avance.zip'],
        regions: ['La Libertad', 'Lambayeque'],
        tags: ['avance', 'carretera', 'pavimentacion'],
        views: 156,
        priority: 'high'
      },
      {
        id: 'rep-002',
        title: 'Reporte de Incidente - Falla Eléctrica Túnel',
        type: 'incident',
        author: 'Téc. Miguel Rodríguez',
        createdAt: new Date('2025-08-02'),
        content: 'Se reporta falla en el sistema eléctrico del túnel Abiseo, específicamente en el sector de ventilación norte. El incidente ocurrió a las 14:30 horas sin afectar la seguridad del personal. Se procedió a la evacuación preventiva y activación del protocolo de emergencia.',
        attachments: ['reporte_tecnico.pdf'],
        regions: ['San Martín'],
        tags: ['incidente', 'tunel', 'electricidad', 'seguridad'],
        views: 89,
        priority: 'high'
      }
    ];
  }

  private generateRawText(): string[] {
    return [
      'PROVIAS DESCENTRALIZADO es el organismo técnico especializado adscrito al Ministerio de Transportes y Comunicaciones, responsable de la gestión de la infraestructura vial descentralizada.',
      'El Plan Nacional de Infraestructura para la Competitividad busca reducir los costos logísticos y mejorar la conectividad territorial del país mediante la construcción y mantenimiento de carreteras estratégicas.',
      'Los estándares técnicos para pavimentos asfálticos establecen especificaciones rigurosas para garantizar la durabilidad y seguridad de las vías en diferentes condiciones climáticas y geográficas del territorio peruano.',
      'La supervisión de obras viales requiere profesionales especializados con conocimientos en ingeniería civil, gestión de proyectos y normativas de construcción vigentes en el sector transportes.',
      'El mantenimiento preventivo de puentes incluye inspecciones regulares, limpieza de sistemas de drenaje, pintura anticorrosiva y verificación de la integridad estructural de todos los elementos.'
    ];
  }

  private generateNumbers(): number[] {
    return [42, 1337, 999999, 0.1, 3.14159, 100, 50.5, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];
  }

  private generateDates(): Date[] {
    const now = new Date();
    return [
      new Date(now.getTime() - 1000), // 1 segundo atrás
      new Date(now.getTime() - 60000), // 1 minuto atrás
      new Date(now.getTime() - 3600000), // 1 hora atrás
      new Date(now.getTime() - 86400000), // 1 día atrás
      new Date(now.getTime() - 604800000), // 1 semana atrás
      new Date(now.getTime() - 2592000000), // 1 mes atrás
      new Date(now.getTime() - 31536000000), // 1 año atrás
      new Date('2025-01-01'),
      new Date('2024-12-25'),
      new Date('2024-06-15')
    ];
  }

  private generateFiles(): Array<{ name: string; size: number; type: string }> {
    return [
      { name: 'planos_carretera_norte.dwg', size: 52428800, type: 'AutoCAD' },
      { name: 'especificaciones_tecnicas.pdf', size: 2097152, type: 'PDF' },
      { name: 'fotos_inspeccion.zip', size: 157286400, type: 'ZIP' },
      { name: 'video_supervision.mp4', size: 524288000, type: 'Video' },
      { name: 'informe_geotecnico.docx', size: 1048576, type: 'Word' },
      { name: 'presupuesto_detallado.xlsx', size: 512000, type: 'Excel' },
      { name: 'cronograma_proyecto.mpp', size: 256000, type: 'Project' }
    ];
  }

  // Ejemplos y documentación para cada pipe
  private getFilterExamples(): CodeExample[] {
    return [
      {
        label: 'Filtro básico',
        code: "{{ projects | filter:'norte' }}",
        input: 'Array de proyectos',
        output: 'Solo proyectos que contengan "norte"',
        explanation: 'Busca en todas las propiedades del objeto'
      },
      {
        label: 'Filtro por campo específico',
        code: "{{ projects | filter:'María':'manager' }}",
        input: 'Array de proyectos',
        output: 'Solo proyectos donde el manager contenga "María"',
        explanation: 'Busca únicamente en el campo especificado'
      }
    ];
  }

  private getFilterParameters(): PipeParameter[] {
    return [
      {
        name: 'searchText',
        type: 'string',
        description: 'Término de búsqueda (case-insensitive)',
        required: true,
        examples: ['norte', 'carretera', 'ing.']
      },
      {
        name: 'field',
        type: 'string',
        description: 'Campo específico donde buscar (opcional)',
        required: false,
        examples: ['name', 'manager', 'region']
      }
    ];
  }

  private getFilterUseCases(): UseCase[] {
    return [
      {
        title: 'Búsqueda de Proyectos',
        description: 'Filtrar proyectos por nombre, región o responsable',
        scenario: 'Usuario busca proyectos en una región específica',
        benefits: ['Búsqueda rápida', 'Resultados relevantes', 'Interfaz intuitiva'],
        implementation: 'Implementar en listados con search box'
      }
    ];
  }

  private getTruncateExamples(): CodeExample[] {
    return [
      {
        label: 'Truncado básico',
        code: "{{ longText | truncate:50 }}",
        input: 'Texto muy largo...',
        output: 'Texto muy largo que se corta aquí y agrega...',
        explanation: 'Corta el texto en 50 caracteres y agrega "..."'
      }
    ];
  }

  private getTruncateParameters(): PipeParameter[] {
    return [
      {
        name: 'limit',
        type: 'number',
        description: 'Número máximo de caracteres',
        required: false,
        defaultValue: 25,
        examples: ['25', '50', '100']
      },
      {
        name: 'trail',
        type: 'string',
        description: 'Texto a agregar al final',
        required: false,
        defaultValue: '...',
        examples: ['...', '…', ' [más]']
      },
      {
        name: 'wordBoundary',
        type: 'boolean',
        description: 'Respetar límites de palabra',
        required: false,
        defaultValue: false,
        examples: ['true', 'false']
      }
    ];
  }

  private getTruncateUseCases(): UseCase[] {
    return [
      {
        title: 'Resúmenes en Tarjetas',
        description: 'Mostrar descripciones truncadas en vista de tarjetas',
        scenario: 'Listado de proyectos con descripciones largas',
        benefits: ['Diseño consistente', 'Mejor UX', 'Espacio optimizado'],
        implementation: 'Usar en componentes card y lista'
      }
    ];
  }

  private getFileSizeExamples(): CodeExample[] {
    return [
      {
        label: 'Tamaño en formato binario',
        code: "{{ fileSize | fileSize:2:'binary' }}",
        input: 1073741824,
        output: '1.00 GiB',
        explanation: 'Convierte bytes a unidades binarias (1024 base)'
      }
    ];
  }

  private getFileSizeParameters(): PipeParameter[] {
    return [
      {
        name: 'decimals',
        type: 'number',
        description: 'Número de decimales a mostrar',
        required: false,
        defaultValue: 2,
        examples: ['0', '1', '2', '3']
      },
      {
        name: 'units',
        type: "'binary' | 'decimal'",
        description: 'Sistema de unidades a usar',
        required: false,
        defaultValue: 'binary',
        examples: ['binary', 'decimal']
      }
    ];
  }

  private getFileSizeUseCases(): UseCase[] {
    return [
      {
        title: 'Gestión de Documentos',
        description: 'Mostrar tamaños de planos y especificaciones',
        scenario: 'Sistema de archivos con documentos técnicos',
        benefits: ['Información clara', 'Gestión de espacio', 'UX mejorada'],
        implementation: 'Usar en listados de archivos y uploads'
      }
    ];
  }

  private getTimeAgoExamples(): CodeExample[] {
    return [
      {
        label: 'Tiempo relativo',
        code: "{{ date | timeAgo }}",
        input: new Date(Date.now() - 3600000),
        output: 'hace 1 hora',
        explanation: 'Convierte fecha a formato relativo humanizado'
      }
    ];
  }

  private getTimeAgoParameters(): PipeParameter[] {
    return [
      {
        name: 'value',
        type: 'Date | string | number',
        description: 'Fecha a convertir',
        required: true,
        examples: ['new Date()', 'ISO string', 'timestamp']
      }
    ];
  }

  private getTimeAgoUseCases(): UseCase[] {
    return [
      {
        title: 'Timeline de Actividades',
        description: 'Mostrar cuándo ocurrieron eventos en el proyecto',
        scenario: 'Dashboard con actividades recientes',
        benefits: ['Contexto temporal', 'Fácil comprensión', 'Actualización automática'],
        implementation: 'Usar en feeds de actividad y notificaciones'
      }
    ];
  }

  private getHighlightExamples(): CodeExample[] {
    return [
      {
        label: 'Resaltado básico',
        code: "[innerHTML]=\"text | searchHighlight:searchTerm\"",
        input: 'Texto con término a resaltar',
        output: 'Texto con <span class="highlight">término</span> a resaltar',
        explanation: 'Envuelve coincidencias en spans con clase CSS'
      }
    ];
  }

  private getHighlightParameters(): PipeParameter[] {
    return [
      {
        name: 'search',
        type: 'string',
        description: 'Término a resaltar',
        required: true,
        examples: ['carretera', 'proyecto', 'ing.']
      },
      {
        name: 'className',
        type: 'string',
        description: 'Clase CSS para el resaltado',
        required: false,
        defaultValue: 'highlight',
        examples: ['highlight', 'search-match', 'found']
      },
      {
        name: 'caseSensitive',
        type: 'boolean',
        description: 'Búsqueda sensible a mayúsculas',
        required: false,
        defaultValue: false,
        examples: ['true', 'false']
      }
    ];
  }

  private getHighlightUseCases(): UseCase[] {
    return [
      {
        title: 'Resultados de Búsqueda',
        description: 'Resaltar términos encontrados en documentación',
        scenario: 'Sistema de búsqueda en base de conocimiento',
        benefits: ['Visualización clara', 'UX mejorada', 'Navegación rápida'],
        implementation: 'Usar con DomSanitizer para seguridad'
      }
    ];
  }

  private getSortByExamples(): CodeExample[] {
    return [
      {
        label: 'Ordenamiento básico',
        code: "{{ projects | sortBy:'name':'asc' }}",
        input: 'Array de proyectos',
        output: 'Proyectos ordenados alfabéticamente',
        explanation: 'Ordena por campo nombre en orden ascendente'
      }
    ];
  }

  private getSortByParameters(): PipeParameter[] {
    return [
      {
        name: 'field',
        type: 'string',
        description: 'Campo por el cual ordenar',
        required: true,
        examples: ['name', 'date', 'budget', 'priority']
      },
      {
        name: 'direction',
        type: "'asc' | 'desc'",
        description: 'Dirección del ordenamiento',
        required: false,
        defaultValue: 'asc',
        examples: ['asc', 'desc']
      },
      {
        name: 'dataType',
        type: "'string' | 'number' | 'date'",
        description: 'Tipo de datos para ordenamiento correcto',
        required: false,
        defaultValue: 'string',
        examples: ['string', 'number', 'date']
      }
    ];
  }

  private getSortByUseCases(): UseCase[] {
    return [
      {
        title: 'Tablas Ordenables',
        description: 'Permitir ordenamiento por columnas en tablas',
        scenario: 'Listado de proyectos con múltiples campos',
        benefits: ['Flexibilidad', 'Mejor organización', 'UX familiar'],
        implementation: 'Usar en headers de tabla con eventos click'
      }
    ];
  }
}