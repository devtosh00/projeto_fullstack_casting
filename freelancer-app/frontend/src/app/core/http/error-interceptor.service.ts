import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../../shared/services/notification.service';
import { LoggingService } from '../../shared/services/logging.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notification: NotificationService,
    private logger: LoggingService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log detalhado do erro
        this.logger.error(`Erro HTTP ${error.status}: ${request.method} ${request.url}`, error);
        
        // Mensagens de erro mais amigáveis com base no código de status
        if (error.status === 0) {
          // Erro de conexão
          this.notification.error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
        } else if (error.status === 500) {
          // Erro interno do servidor
          console.error('Erro 500 - Detalhes completos:', error);
          console.error('Requisição que causou o erro:', {
            url: request.url,
            method: request.method,
            body: request.body,
            headers: request.headers
          });
          this.notification.error('Ocorreu um erro no servidor. A equipe de suporte foi notificada.');
        }
        
        return throwError(() => error);
      })
    );
  }
} 