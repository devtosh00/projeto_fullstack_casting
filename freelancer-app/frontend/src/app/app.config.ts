import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration, withNoHttpTransferCache } from '@angular/platform-browser';

// Importe o interceptor como uma função
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { NotificationService } from './shared/services/notification.service';
import { LoggingService } from './shared/services/logging.service';

// Crie uma função interceptora que encapsula a lógica do AuthInterceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  
  if (token) {
    // Clone a requisição e adicione o cabeçalho de autorização
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

// Interceptor para tratar todos os erros HTTP
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggingService);
  const notification = inject(NotificationService);
  
  // Verificar se a URL está relacionada a participação em projetos
  // Nesse caso, o próprio serviço já tem tratamento especial de erro
  const isProjectParticipationUrl = req.url.includes('/ProjectParticipations');
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log detalhado do erro
      logger.error(`Erro HTTP ${error.status}: ${req.method} ${req.url}`, error);
      
      // Se for uma URL de participação, deixar o serviço específico tratar o erro
      if (isProjectParticipationUrl) {
        return throwError(() => error);
      }
      
      // Para outras URLs, aplicar o tratamento genérico
      if (error.status === 0) {
        // Erro de conexão
        notification.error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      } else if (error.status === 500) {
        // Erro interno do servidor
        console.error('Erro 500 - Detalhes completos:', error);
        console.error('Requisição que causou o erro:', {
          url: req.url,
          method: req.method,
          body: req.body,
          headers: req.headers
        });
        notification.error('Ocorreu um erro no servidor. A equipe de suporte foi notificada.');
      }
      
      return throwError(() => error);
    })
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(withNoHttpTransferCache()),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    provideAnimations()
  ]
};
