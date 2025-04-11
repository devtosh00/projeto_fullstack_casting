import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Project } from '../../../shared/models/project.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-public-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-3">
        <h1 class="text-2xl font-bold">Oportunidades Disponíveis</h1>
        <p class="text-gray-600 mt-2">
          Projetos públicos com vagas disponíveis para participação.
        </p>
      </div>
      
      <!-- Linha divisória -->
      <hr class="border-t border-gray-300 my-4">
      
      <div *ngIf="loading" class="flex justify-center my-8">
        <div class="animate-spin h-10 w-10 border-4 border-violet-500 rounded-full border-t-transparent"></div>
      </div>
      
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
        {{ successMessage }}
      </div>
      
      <div *ngIf="!loading && projects.length === 0" class="text-center my-8">
        <p class="text-gray-500">Não há projetos públicos disponíveis no momento.</p>
      </div>
      
      <div *ngIf="!loading && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let project of projects" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ project.description }}</h2>
            
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-500">Orçamento:</span>
              <span class="font-medium">R$ {{ project.budget.toFixed(2) }}</span>
            </div>
            
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-500">Prazo:</span>
              <span class="font-medium">{{ formatDate(project.deadline) }}</span>
            </div>
            
            <div class="mb-2">
              <span 
                class="px-3 py-1 rounded-full text-sm"
                [class]="project.status === 'em andamento' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
              >
                {{ project.status }}
              </span>
            </div>
            
            <div class="flex items-center gap-2 mb-4">
              <span class="text-gray-500">Vagas:</span>
              <span class="font-medium">{{ project.currentParticipants || 0 }}/{{ project.maxParticipants }}</span>
            </div>
            
            <div class="flex flex-wrap gap-2 mt-4">
              <app-button 
                (click)="participateInProject(project.id)"
                [disabled]="isUserParticipating(project)"
              >
                {{ isUserParticipating(project) ? 'Você já participa' : 'Participar' }}
              </app-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  userId: number | null = null;
  participatingProjectIds: number[] = [];
  
  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.loadProjects();
      } else {
        this.loading = false;
        this.errorMessage = 'Usuário não autenticado.';
      }
    });
  }
  
  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.projectService.getPublicProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
        
        // Verificar projetos em que o usuário já participa
        this.checkParticipation();
      },
      error: (error) => {
        console.error('Erro ao carregar projetos públicos:', error);
        this.errorMessage = 'Não foi possível carregar os projetos públicos. Tente novamente.';
        this.loading = false;
      }
    });
  }
  
  checkParticipation(): void {
    // Para cada projeto, verificar se o usuário atual é um participante
    this.participatingProjectIds = this.projects
      .filter(project => project.participants?.some(p => p.userId === this.userId))
      .map(project => project.id)
      .filter((id): id is number => id !== undefined);
  }
  
  isUserParticipating(project: Project): boolean {
    // Verifica se este projeto está na lista de projetos em que o usuário participa
    if (!project.id) return false;
    return this.participatingProjectIds.includes(project.id);
  }
  
  participateInProject(projectId?: number): void {
    if (!this.userId || !projectId) {
      this.errorMessage = 'Você precisa estar logado para participar.';
      return;
    }
    
    this.projectService.participateInProject(projectId, this.userId).subscribe({
      next: (response) => {
        // Adicionar à lista de projetos em que o usuário participa
        this.participatingProjectIds.push(projectId);
        
        // Atualizar o contador de participantes
        const project = this.projects.find(p => p.id === projectId);
        if (project && project.currentParticipants !== undefined) {
          project.currentParticipants += 1;
          
          // Verificar se ainda há vagas
          const maxParticipants = project.maxParticipants || 0;
          if (project.currentParticipants >= maxParticipants) {
            project.hasVacancies = false;
          }
        }
        
        this.successMessage = 'Você se candidatou com sucesso ao projeto!';
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        console.error('Erro ao participar do projeto:', error);
        this.errorMessage = 'Não foi possível participar do projeto. Tente novamente.';
      }
    });
  }
  
  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
} 