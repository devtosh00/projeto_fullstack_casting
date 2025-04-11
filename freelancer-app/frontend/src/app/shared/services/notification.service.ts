import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Tipo para os tipos válidos de notificação
 */
type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Serviço para exibir notificações ao usuário usando MatSnackBar
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Configuração padrão para todos os tipos de notificação
  private readonly baseConfig: MatSnackBarConfig = {
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['bg-purple-600', 'text-black', 'font-bold', 'shadow-md', 'border-2', 'border-purple-800']
  };
  
  // Duração padrão para cada tipo de notificação
  private readonly durations = {
    success: 3000,
    error: 5000,
    info: 3000,
    warning: 4000
  };
  
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Exibe uma mensagem de sucesso
   * @param message Mensagem a ser exibida
   * @param duration Duração opcional em milissegundos
   */
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  /**
   * Exibe uma mensagem de erro
   * @param message Mensagem a ser exibida
   * @param duration Duração opcional em milissegundos
   */
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  /**
   * Exibe uma mensagem informativa
   * @param message Mensagem a ser exibida
   * @param duration Duração opcional em milissegundos
   */
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  /**
   * Exibe uma mensagem de aviso
   * @param message Mensagem a ser exibida
   * @param duration Duração opcional em milissegundos
   */
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
  
  /**
   * Método utilitário para exibir uma notificação
   * @param message Mensagem a ser exibida
   * @param type Tipo da notificação
   * @param duration Duração opcional em milissegundos
   */
  private show(message: string, type: NotificationType, duration?: number): void {
    const config = { 
      ...this.baseConfig, 
      duration: duration || this.durations[type]
    };
    
    this.snackBar.open(message, 'Fechar', config);
  }
} 