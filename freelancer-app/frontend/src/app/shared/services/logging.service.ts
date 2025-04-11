import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface para entradas de log
 */
export interface LogEntry {
  timestamp: Date;
  message: string;
  level: LogLevel;
  data?: any;
}

/**
 * Tipos de níveis de log suportados
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

/**
 * Serviço responsável pelo gerenciamento de logs na aplicação
 */
@Injectable({ providedIn: 'root' })
export class LoggingService {
  // Observable para logs
  private logsSubject = new BehaviorSubject<LogEntry[]>([]);
  public logs$ = this.logsSubject.asObservable();
  
  // Configurações do serviço
  private readonly maxLogs = 200;
  private readonly shouldInterceptConsole = true;
  
  constructor() {
    this.setupConsoleInterception();
    this.setupErrorHandling();
  }
  
  /**
   * Configura a interceptação dos métodos do console
   */
  private setupConsoleInterception(): void {
    if (!this.shouldInterceptConsole) return;
    
    this.interceptConsoleMethod('log', 'info');
    this.interceptConsoleMethod('info', 'info');
    this.interceptConsoleMethod('warn', 'warn');
    this.interceptConsoleMethod('error', 'error');
  }
  
  /**
   * Configura o tratamento de erros não capturados
   */
  private setupErrorHandling(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('error', (event) => {
      this.error(`Erro não capturado: ${event.message}`, event);
    });
  }
  
  /**
   * Intercepta um método do console para registrar no sistema de logs
   */
  private interceptConsoleMethod(method: string, level: LogLevel): void {
    if (typeof console === 'undefined' || typeof (console as any)[method] !== 'function') {
      return;
    }
    
    const originalMethod = (console as any)[method];
    
    (console as any)[method] = (...args: any[]) => {
      // Manter o comportamento original
      originalMethod.apply(console, args);
      
      // Não registrar logs de debug em ambiente de produção
      if (level === 'debug' && environment.logLevel !== 'debug') return;
      
      const message = this.formatMessageFromArgs(args);
      
      this.addLog({
        timestamp: new Date(),
        message,
        level,
        data: args.length > 1 ? args.slice(1) : undefined
      });
    };
  }
  
  /**
   * Formata mensagens a partir de argumentos variados
   */
  private formatMessageFromArgs(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Objeto não serializável]';
        }
      }
      return String(arg);
    }).join(' ');
  }
  
  /**
   * Adiciona uma entrada de log ao histórico
   */
  private addLog(log: LogEntry): void {
    const currentLogs = this.logsSubject.value;
    const newLogs = [log, ...currentLogs].slice(0, this.maxLogs);
    this.logsSubject.next(newLogs);
  }
  
  /**
   * Registra uma mensagem de nível debug
   */
  debug(message: string, data?: any): void {
    if (environment.logLevel !== 'debug') return;
    
    this.addLog({
      timestamp: new Date(),
      message,
      level: 'debug',
      data
    });
  }
  
  /**
   * Registra uma mensagem de nível info
   */
  info(message: string, data?: any): void {
    this.addLog({
      timestamp: new Date(),
      message,
      level: 'info',
      data
    });
  }
  
  /**
   * Registra uma mensagem de nível warn
   */
  warn(message: string, data?: any): void {
    this.addLog({
      timestamp: new Date(),
      message,
      level: 'warn',
      data
    });
  }
  
  /**
   * Registra uma mensagem de nível error
   */
  error(message: string, data?: any): void {
    this.addLog({
      timestamp: new Date(),
      message,
      level: 'error',
      data
    });
  }
  
  /**
   * Registra uma mensagem de nível success
   */
  success(message: string, data?: any): void {
    this.addLog({
      timestamp: new Date(),
      message,
      level: 'success',
      data
    });
  }
  
  /**
   * Limpa o histórico de logs
   */
  clearLogs(): void {
    this.logsSubject.next([]);
  }
} 