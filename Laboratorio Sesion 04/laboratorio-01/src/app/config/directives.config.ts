// Configuración global para directivas
export const DirectivesConfig = {
  // Configuración para tooltips
  tooltip: {
    defaultPosition: 'top' as const,
    showDelay: 500,
    hideDelay: 100,
    maxWidth: 200
  },
  
  // Configuración para lazy loading
  lazyLoad: {
    rootMargin: '50px',
    threshold: 0.1,
    defaultPlaceholder: 'assets/images/placeholder.jpg'
  },
  
  // Configuración para drag & drop
  dragDrop: {
    dragClass: 'dragging',
    dropClass: 'drop-zone',
    overClass: 'drag-over'
  },
  
  // Configuración para validación
  validation: {
    showErrorsOnBlur: true,
    showErrorsOnSubmit: true,
    errorClass: 'field-error',
    successClass: 'field-success'
  }
};
