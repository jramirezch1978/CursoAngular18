/**
 * 🏗️ INTERFACES - LAB 1: FUNDAMENTOS DE ASINCRONÍA
 * 
 * Como dice el Ing. Jhonny Ramirez: "Las interfaces son los contratos que definen
 * la estructura de nuestros datos. Son como los planos de un arquitecto: definen
 * exactamente qué esperamos y qué ofrecemos."
 */

// 👤 Interfaz de Usuario - Estructura base para datos de usuario
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
}

// 🛒 Interfaz de Producto - Para datos de productos en el sistema
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// 📋 Interfaz de Orden - Para gestión de órdenes/pedidos
export interface Order {
  id: number;
  userId: number;
  products: number[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

// 🔔 Interfaz de Notificación - Para sistema de notificaciones
export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// 📊 Interfaz para métricas de rendimiento
export interface PerformanceMetric {
  operation: string;
  time: number;
  timestamp: Date;
  success: boolean;
}

// 🎯 Interfaz para resultados de operaciones asíncronas
export interface AsyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}

// 🔄 Interfaz para configuración de retry
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
  maxDelay: number;
}

// ⏱️ Interfaz para configuración de timeout  
export interface TimeoutConfig {
  timeout: number;
  timeoutMessage?: string;
}

// 📦 Interfaz para configuración de batch processing
export interface BatchConfig {
  batchSize: number;
  delayBetweenBatches?: number;
  maxConcurrency?: number;
}

// 🎪 Interfaz para demostración de callbacks vs promises vs async/await
export interface ComparisonDemo {
  method: 'callback' | 'promise' | 'async-await';
  startTime: number;
  endTime?: number;
  result?: any;
  error?: string;
  status: 'pending' | 'success' | 'error';
}

// 🏥 Interfaz para datos completos de usuario (ejemplo caso real)
export interface UserCompleteData {
  user: User;
  orders: Order[];
  notifications: Notification[];
  lastActivity?: Date;
  preferences?: {
    theme: 'light' | 'dark';
    language: 'es' | 'en';
    notifications: boolean;
  };
}

// 🎨 Interfaz para estado de loading en componentes
export interface LoadingState {
  sync: boolean;
  callback: boolean;
  callbackHell: boolean;
  promise: boolean;
  promiseChain: boolean;
  asyncAwait: boolean;
  retry: boolean;
  timeout: boolean;
  batch: boolean;
}

// 📈 Interfaz para resultados de diferentes operaciones
export interface OperationResults {
  sync: string | null;
  callback: string | null;
  callbackHell: UserCompleteData | null;
  promise: string | null;
  promiseChain: UserCompleteData | null;
  asyncAwait: UserCompleteData | null;
  retry: any;
  timeout: any;
  batch: any[];
}
