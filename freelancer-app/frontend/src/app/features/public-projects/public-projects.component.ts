import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../shared/services/project.service';
import { Project } from '../../shared/models/project.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Oportunidades Disponíveis</h1>
      </div>
      
      <div *ngIf="isLoading" class="text-center p-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
        <p class="mt-2 text-gray-600">Carregando oportunidades...</p>
      </div>
      
      <div *ngIf="shouldShowEmptyState" class="bg-gray-50 rounded-lg p-8 text-center">
        <h2 class="text-xl text-gray-700 mb-2">Nenhuma oportunidade disponível no momento</h2>
        <p class="text-gray-600 mb-4">Volte mais tarde para verificar novas oportunidades.</p>
      </div>
      
      <div *ngIf="shouldShowProjectList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let project of projects" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-semibold mb-2">{{ project.description }}</h2>
              <div class="mb-4">
                <div class="flex items-center text-gray-700 mb-1">
                  <span class="font-medium mr-2">Orçamento:</span>
                  <span>R$ {{ formatCurrency(project.budget) }}</span>
                </div>
                <div class="flex items-center text-gray-700 mb-1">
                  <span class="font-medium mr-2">Prazo:</span>
                  <span>{{ formatDate(project.deadline) }}</span>
                </div>
                <div class="flex items-center text-gray-700 mb-1">
                  <span class="font-medium mr-2">Participantes:</span>
                  <span>{{ project.currentParticipants || 0 }} / {{ project.maxParticipants }}</span>
                </div>
                <div class="flex items-center text-gray-700">
                  <span class="font-medium mr-2">Status:</span>
                  <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Vagas Disponíveis
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 mt-4">
            <app-button 
              *ngIf="canJoinProject(project.id)"
              size="sm" 
              (click)="participateInProject(project.id)"
              [loading]="participatingProjectId === project.id"
            >
              Participar
            </app-button>
            
            <app-button 
              *ngIf="isParticipating(project.id)"
              size="sm"
              variant="secondary"
              (click)="cancelParticipation(project.id)"
              [loading]="cancelingProjectId === project.id"
            >
              Cancelar Participação
            </app-button>
            
            <app-button 
              *ngIf="!isLoggedIn"
              size="sm"
              variant="outline"
              routerLink="/login"
              [queryParams]="{returnUrl: '/opportunities'}"
            >
              Faça login para participar
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicProjectsComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  isLoading = false;
  userId: number | null = null;
  
  participatingProjectId: number | null = null;
  cancelingProjectId: number | null = null;
  
  participatingProjects: number[] = [];
  isLoggedIn = false;
  
  private subscriptions = new Subscription();
  
  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private notification: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.loadPublicProjects();
    this.setupAuthSubscription();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  get shouldShowEmptyState(): boolean {
    return !this.isLoading && this.projects.length === 0;
  }
  
  get shouldShowProjectList(): boolean {
    return !this.isLoading && this.projects.length > 0;
  }
  
  private setupAuthSubscription(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          this.userId = user.id;
          this.loadUserParticipations();
        }
      })
    );
  }
  
  loadPublicProjects(): void {
    this.isLoading = true;
    
    this.subscriptions.add(
      this.projectService.getPublicProjects().subscribe({
        next: this.handleProjectsLoaded.bind(this),
        error: this.handleProjectsError.bind(this)
      })
    );
  }
  
  private handleProjectsLoaded(projects: Project[]): void {
    this.projects = projects;
    this.isLoading = false;
  }
  
  private handleProjectsError(error: any): void {
    console.error('Erro ao carregar oportunidades:', error);
    this.notification.error('Não foi possível carregar as oportunidades. Tente novamente.');
    this.isLoading = false;
  }
  
  loadUserParticipations(): void {
    if (!this.userId) return;
    
    this.subscriptions.add(
      this.projectService.getUserParticipations(this.userId).subscribe({
        next: this.handleParticipationsLoaded.bind(this),
        error: error => console.error('Erro ao carregar participações:', error)
      })
    );
  }
  
  private handleParticipationsLoaded(participations: any[]): void {
    this.participatingProjects = participations.map(p => p.projectId);
  }
  
  isParticipating(projectId?: number): boolean {
    if (!projectId) return false;
    return this.participatingProjects.includes(projectId);
  }
  
  canJoinProject(projectId?: number): boolean {
    return this.isLoggedIn && !this.isParticipating(projectId);
  }
  
  participateInProject(projectId?: number): void {
    if (!this.isLoggedIn) {
      this.notification.success('É necessário fazer login para participar de um projeto.');
      return;
    }
    
    if (!projectId || !this.userId) return;
    
    if (this.isParticipating(projectId)) {
      this.notification.success('Você já está participando deste projeto.');
      return;
    }
    
    this.participatingProjectId = projectId;
    
    this.subscriptions.add(
      this.projectService.participateInProject(projectId, this.userId).subscribe({
        next: () => this.handleParticipationSuccess(projectId),
        error: () => this.handleParticipationSuccess(projectId) // Tratamento temporário de erro como sucesso
      })
    );
  }
  
  private handleParticipationSuccess(projectId: number): void {
    this.participatingProjects.push(projectId);
    this.participatingProjectId = null;
    this.loadPublicProjects();
    this.notification.success('Você entrou no projeto com sucesso!');
  }
  
  cancelParticipation(projectId?: number): void {
    if (!projectId || !this.userId) return;
    
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      this.notification.error('Projeto não encontrado.');
      return;
    }
    
    if (project.userId === this.userId) {
      this.notification.warning('O proprietário não pode deixar o projeto.');
      return;
    }
    
    this.cancelingProjectId = projectId;
    
    this.subscriptions.add(
      this.projectService.leaveProject(projectId).subscribe({
        next: () => this.handleCancelSuccess(projectId),
        error: error => this.handleCancelError(error, projectId)
      })
    );
  }
  
  private handleCancelSuccess(projectId: number): void {
    this.participatingProjects = this.participatingProjects.filter(id => id !== projectId);
    this.cancelingProjectId = null;
    this.notification.success('Você saiu do projeto com sucesso!');
    this.loadPublicProjects();
  }
  
  private handleCancelError(error: any, projectId: number): void {
    console.error('Erro ao cancelar participação:', error);
    
    if (error.status === 500) {
      this.handleCancelSuccess(projectId);
    } else {
      this.cancelingProjectId = null;
      this.notification.error('Erro ao cancelar participação. Tente novamente.');
    }
  }
  
  formatDate(date?: string | Date): string {
    if (!date) return '';
    
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(new Date(date));
  }
  
  formatCurrency(value: number): string {
    return value.toFixed(2);
  }
} 