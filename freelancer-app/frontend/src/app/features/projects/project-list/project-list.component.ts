import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Project, ProjectStatus } from '../../../shared/models/project.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Meus Projetos</h1>
        <app-button routerLink="/projects/new">Novo Projeto</app-button>
      </div>
      
      <div *ngIf="isLoading" class="text-center p-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
        <p class="mt-2 text-gray-600">Carregando projetos...</p>
      </div>
      
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="shouldShowEmptyState" class="bg-gray-50 rounded-lg p-8 text-center">
        <h2 class="text-xl text-gray-700 mb-2">Você ainda não possui projetos</h2>
        <p class="text-gray-600 mb-4">Crie seu primeiro projeto para começar a gerenciar seus trabalhos.</p>
        <app-button routerLink="/projects/new">Criar Projeto</app-button>
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
                <div class="flex items-center text-gray-700">
                  <span class="font-medium mr-2">Status:</span>
                  <span [ngClass]="getStatusClasses(project.status)">
                    {{ project.status }}
                  </span>
                </div>
                
                <ng-container *ngIf="project.isPublic">
                  <div class="mt-3 border-t border-gray-100 pt-3">
                    <div class="flex items-center text-gray-700 mb-1">
                      <span class="font-medium mr-2">Projeto:</span>
                      <span class="px-2 py-1 bg-violet-100 text-violet-800 rounded text-xs font-medium">
                        Público
                      </span>
                    </div>
                    <div class="flex items-center text-gray-700 mb-1">
                      <span class="font-medium mr-2">Participantes:</span>
                      <span>{{ project.currentParticipants || 1 }} / {{ project.maxParticipants }}</span>
                    </div>
                    <div class="flex items-center text-gray-700">
                      <span class="font-medium mr-2">Vagas:</span>
                      <span [ngClass]="getVacancyClasses(project.hasVacancies)">
                        {{ project.hasVacancies ? 'Disponíveis' : 'Fechadas' }}
                      </span>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 mt-4">
            <app-button 
              size="sm" 
              routerLink="/projects/{{ project.id }}"
            >
              Editar
            </app-button>
            <app-button 
              size="sm" 
              variant="secondary" 
              (click)="deleteProject(project)"
              [loading]="project.id === deletingProjectId"
            >
              Excluir
            </app-button>
            
            <app-button 
              *ngIf="project.isPublic" 
              size="sm" 
              variant="outline" 
              routerLink="/projects/{{ project.id }}/participants"
            >
              Participantes
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  isLoading = false;
  errorMessage = '';
  deletingProjectId: number | null = null;
  
  userId: number | null = null;
  
  private subscriptions = new Subscription();
  
  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private notification: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.userId = user.id;
          this.loadProjects();
        }
      })
    );
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
  
  loadProjects(): void {
    if (!this.userId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.subscriptions.add(
      this.projectService.getProjects(this.userId).subscribe({
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
    console.error('Erro ao carregar projetos:', error);
    this.errorMessage = 'Não foi possível carregar os projetos. Tente novamente.';
    this.isLoading = false;
    this.notification.error('Erro ao carregar projetos');
  }
  
  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  }
  
  formatCurrency(value: number): string {
    return value.toFixed(2);
  }
  
  getStatusClasses(status: string): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    
    switch(status) {
      case ProjectStatus.COMPLETED:
        return `${baseClasses} bg-green-100 text-green-800`;
      case ProjectStatus.IN_PROGRESS:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case ProjectStatus.OPEN:
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  }
  
  getVacancyClasses(hasVacancies: boolean): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    return hasVacancies
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`;
  }
  
  deleteProject(project: Project): void {
    if (!project.id) return;
    
    if (!this.confirmProjectDeletion(project)) return;
    
    this.deletingProjectId = project.id;
    
    this.subscriptions.add(
      this.projectService.deleteProject(project.id).subscribe({
        next: () => this.handleProjectDeleted(project),
        error: this.handleProjectDeleteError.bind(this)
      })
    );
  }
  
  private confirmProjectDeletion(project: Project): boolean {
    return confirm(`Tem certeza que deseja excluir o projeto "${project.description}"?`);
  }
  
  private handleProjectDeleted(project: Project): void {
    this.projects = this.projects.filter(p => p.id !== project.id);
    this.deletingProjectId = null;
  }
  
  private handleProjectDeleteError(error: any): void {
    console.error('Erro ao excluir projeto:', error);
    this.errorMessage = 'Não foi possível excluir o projeto. Tente novamente.';
    this.deletingProjectId = null;
  }
} 