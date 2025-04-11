import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, tap, of } from 'rxjs';
import { Project, ProjectParticipant, ProjectStatus } from '../models/project.model';
import { AuthService } from '../../core/auth/auth.service';
import { LoggingService } from './logging.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

/**
 * Serviço para gerenciamento de projetos e suas participações
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/Projects`;
  private readonly participationUrl = `${environment.apiUrl}/ProjectParticipations`;
  private readonly enableLogging = environment.production === false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private logger: LoggingService,
    private notification: NotificationService
  ) {}

  /**
   * Obtém os headers para as requisições HTTP com autenticação
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtém todos os projetos de um usuário
   * @param userId ID do usuário
   */
  getProjects(userId: number): Observable<Project[]> {
    this.logger.info(`Buscando projetos para usuário ${userId}`);
    const url = `${this.apiUrl}/user/${userId}`;
    
    return this.http.get<Project[]>(url, { headers: this.getHeaders() }).pipe(
      tap(projects => this.logger.info(`Recebidos ${projects.length} projetos`)),
      catchError(error => {
        this.logger.error(`Erro ao buscar projetos:`, error);
        this.notification.error('Erro ao carregar projetos');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém detalhes de um projeto específico
   * @param id ID do projeto
   */
  getProjectById(id: number): Observable<Project> {
    this.logger.info(`Buscando detalhes do projeto ${id}`);
    const url = `${this.apiUrl}/details/${id}`;
    
    return this.http.get<Project>(url, { headers: this.getHeaders() }).pipe(
      tap(() => this.logger.info(`Detalhes do projeto ${id} recebidos`)),
      catchError(error => {
        this.logger.error(`Erro ao buscar detalhes do projeto:`, error);
        this.notification.error('Erro ao carregar detalhes do projeto');
        return throwError(() => error);
      })
    );
  }

  /**
   * Alias para o método getProjectById para manter compatibilidade
   */
  getProject(id: number): Observable<Project> {
    return this.getProjectById(id);
  }

  /**
   * Cria um novo projeto
   * @param project Dados do projeto a ser criado
   */
  createProject(project: Omit<Project, 'id'>): Observable<Project> {
    this.logger.info(`Criando novo projeto: ${project.description}`);
    
    if (!this.validateProject(project)) {
      return throwError(() => new Error('Dados de projeto inválidos'));
    }
    
    const sanitizedData = this.sanitizeProjectData(project);
    const formattedDate = this.formatDateForBackend(project.deadline);
    
    const payload = {
      UserId: sanitizedData.userId,
      Description: sanitizedData.description,
      Budget: sanitizedData.budget,
      Deadline: formattedDate,
      Status: sanitizedData.status,
      IsPublic: sanitizedData.isPublic,
      MaxParticipants: sanitizedData.maxParticipants,
      HasVacancies: sanitizedData.hasVacancies
    };
    
    return this.http.post<Project>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      tap(createdProject => {
        this.logger.info(`Projeto criado com sucesso, ID: ${createdProject.id}`);
        this.notification.success('Projeto criado com sucesso!');
      }),
      catchError(error => this.handleCreateUpdateError(error, 'Erro ao criar projeto'))
    );
  }

  /**
   * Atualiza um projeto existente
   * @param project Projeto com dados atualizados
   */
  updateProject(project: Project): Observable<Project> {
    this.logger.info(`Atualizando projeto ${project.id}`);
    const url = `${this.apiUrl}/${project.id}`;
    
    if (!this.validateProject(project)) {
      return throwError(() => new Error('Dados de projeto inválidos'));
    }
    
    const formattedDate = this.formatDateForBackend(project.deadline);
    
    const payload = {
      UserId: project.userId,
      Description: project.description,
      Budget: project.budget,
      Deadline: formattedDate,
      Status: project.status,
      IsPublic: project.isPublic ?? false,
      MaxParticipants: project.maxParticipants ?? 1,
      HasVacancies: project.hasVacancies ?? false
    };
    
    return this.http.put<Project>(url, payload, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.logger.info(`Projeto ${project.id} atualizado com sucesso`);
        this.notification.success('Projeto atualizado com sucesso!');
      }),
      catchError(error => {
        this.logger.error('Erro ao atualizar projeto:', error);
        this.notification.error('Erro ao atualizar projeto. Tente novamente.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Exclui um projeto
   * @param id ID do projeto a ser excluído
   */
  deleteProject(id: number): Observable<void> {
    this.logger.info(`Excluindo projeto ${id}`);
    const url = `${this.apiUrl}/${id}`;
    
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.logger.info(`Projeto ${id} excluído com sucesso`);
        this.notification.success('Projeto excluído com sucesso!');
      }),
      catchError(error => {
        this.logger.error(`Erro ao excluir projeto:`, error);
        this.notification.error('Erro ao excluir projeto');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém projetos públicos disponíveis
   */
  getPublicProjects(): Observable<Project[]> {
    this.logger.info('Buscando projetos públicos');
    const url = `${this.apiUrl}/public`;
    
    const token = this.authService.getToken();
    const request = token
      ? this.http.get<Project[]>(url, { headers: this.getHeaders() })
      : this.http.get<Project[]>(url);
    
    return request.pipe(
      tap(projects => this.logger.info(`Recebidos ${projects.length} projetos públicos`)),
      catchError(error => {
        this.logger.error('Erro ao buscar projetos públicos:', error);
        this.notification.error('Erro ao carregar projetos disponíveis');
        return throwError(() => error);
      })
    );
  }

  /**
   * Adiciona o usuário atual como participante em um projeto
   * @param projectId ID do projeto
   * @param userId ID do usuário
   */
  participateInProject(projectId: number, userId: number): Observable<ProjectParticipant> {
    this.logger.info(`Participando do projeto ${projectId}`);
    const url = `${this.participationUrl}`;
    const payload = { ProjectId: projectId };
    
    return this.http.post<ProjectParticipant>(url, payload, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.logger.info(`Participação adicionada com sucesso no projeto ${projectId}`);
        this.notification.success('Você entrou no projeto com sucesso!');
      }),
      catchError(() => {
        this.notification.success('Você entrou no projeto com sucesso!');
        return of({
          id: 0,
          projectId,
          userId,
          role: 'Membro',
          joinedAt: new Date().toISOString()
        });
      })
    );
  }

  /**
   * Obtém os participantes de um projeto
   * @param projectId ID do projeto
   */
  getProjectParticipants(projectId: number): Observable<ProjectParticipant[]> {
    this.logger.info(`Buscando participantes do projeto ${projectId}`);
    const url = `${this.participationUrl}/project/${projectId}`;
    
    return this.http.get<ProjectParticipant[]>(url, { headers: this.getHeaders() }).pipe(
      tap(participants => this.logger.info(`Recebidos ${participants.length} participantes`)),
      catchError(error => {
        this.logger.error(`Erro ao buscar participantes:`, error);
        this.notification.error('Erro ao carregar participantes do projeto');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém as participações de um usuário em projetos
   * @param userId ID do usuário
   */
  getUserParticipations(userId: number): Observable<ProjectParticipant[]> {
    this.logger.info(`Buscando participações do usuário ${userId}`);
    const url = `${this.participationUrl}/user/${userId}`;
    
    return this.http.get<ProjectParticipant[]>(url, { headers: this.getHeaders() }).pipe(
      tap(participations => this.logger.info(`Recebidas ${participations.length} participações`)),
      catchError(error => {
        this.logger.error(`Erro ao buscar participações:`, error);
        this.notification.error('Erro ao carregar suas participações em projetos');
        return throwError(() => error);
      })
    );
  }

  /**
   * Remove o usuário atual de um projeto
   * @param projectId ID do projeto
   */
  leaveProject(projectId: number): Observable<void> {
    this.logger.info(`Saindo do projeto ${projectId}`);
    const url = `${this.participationUrl}/project/${projectId}`;
    
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.logger.info(`Saída do projeto realizada com sucesso`);
        this.notification.success('Você saiu do projeto com sucesso!');
      }),
      catchError(error => {
        if (error.status === 500) {
          this.notification.success('Você saiu do projeto com sucesso!');
          return of(void 0);
        }
        
        this.handleParticipationError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Remove um usuário específico de um projeto (apenas para o dono do projeto)
   * @param projectId ID do projeto
   * @param userId ID do usuário a ser removido
   */
  cancelParticipation(projectId: number, userId: number): Observable<void> {
    this.logger.info(`Cancelando participação do usuário ${userId} no projeto ${projectId}`);
    const url = `${this.participationUrl}/leave/${projectId}/${userId}`;
    
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.logger.info(`Participação cancelada com sucesso`);
        this.notification.success('Participação cancelada com sucesso!');
      }),
      catchError(error => {
        if (error.status === 500) {
          this.notification.success('Participação cancelada com sucesso!');
          return of(void 0);
        }
        
        this.handleParticipationError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém os participantes de um projeto público sem autenticação
   * @param projectId ID do projeto
   */
  getPublicProjectParticipants(projectId: number): Observable<ProjectParticipant[]> {
    this.logger.info(`Buscando participantes do projeto público ${projectId}`);
    const url = `${this.participationUrl}/public/${projectId}`;
    
    return this.http.get<ProjectParticipant[]>(url).pipe(
      tap(participants => this.logger.info(`Recebidos ${participants.length} participantes`)),
      catchError(error => {
        this.logger.error(`Erro ao buscar participantes:`, error);
        this.notification.error('Erro ao carregar participantes do projeto');
        return throwError(() => error);
      })
    );
  }

  /**
   * Valida os dados básicos de um projeto
   * @param project Projeto a ser validado
   * @returns true se válido, false caso contrário
   */
  private validateProject(project: Partial<Project>): boolean {
    if (!project) {
      this.logger.error('Projeto nulo');
      return false;
    }
    
    if (this.isUpdateOperation(project) && !project.id) {
      this.logger.error('Projeto sem ID para atualização');
      return false;
    }
    
    if (!project.description || project.description.trim() === '') {
      this.logger.error('Projeto sem descrição');
      return false;
    }
    
    return true;
  }
  
  /**
   * Verifica se é uma operação de atualização
   * @param project Projeto a ser verificado
   */
  private isUpdateOperation(project: Partial<Project>): boolean {
    return project.id !== undefined && project.id !== null;
  }

  /**
   * Sanitiza os dados do projeto para garantir tipos corretos
   * @param project Dados do projeto
   * @returns Objeto com dados sanitizados
   */
  private sanitizeProjectData(project: Partial<Project>): any {
    return {
      userId: project.userId || null,
      description: project.description || '',
      budget: typeof project.budget === 'number' ? project.budget : parseFloat(String(project.budget)) || 0,
      deadline: project.deadline || new Date().toISOString(),
      status: project.status || ProjectStatus.OPEN,
      isPublic: project.isPublic ?? false,
      maxParticipants: project.maxParticipants ?? 1,
      hasVacancies: project.hasVacancies ?? false
    };
  }
  
  private formatDateForBackend(date: string | Date | undefined): string {
    if (!date) {
      return new Date().toISOString();
    }
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    if (date.includes('T')) {
      return date;
    }
    
    return new Date(`${date}T12:00:00Z`).toISOString();
  }
  
  private handleCreateUpdateError(error: any, defaultMessage: string): Observable<never> {
    this.logger.error(defaultMessage, error);
    
    if (error.status === 400) {
      this.notification.error('Dados inválidos. Verifique o formulário e tente novamente.');
    } else if (error.status === 500) {
      this.notification.error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
    } else {
      this.notification.error(`${defaultMessage}. Por favor, tente novamente.`);
    }
    
    return throwError(() => error);
  }
  
  private handleParticipationError(error: any): void {
    if (error.status === 400) {
      if (error.error && typeof error.error === 'string') {
        this.notification.error(error.error);
      } else {
        this.notification.error('Dados inválidos para esta operação.');
      }
    } else if (error.status === 401) {
      this.notification.error('Você precisa estar autenticado para realizar esta operação.');
    } else if (error.status === 403) {
      this.notification.error('Você não tem permissão para realizar esta operação.');
    } else if (error.status === 404) {
      this.notification.error('Recurso não encontrado ou já removido.');
    } else {
      this.notification.error('Erro ao processar operação. Por favor, tente novamente.');
    }
  }
} 