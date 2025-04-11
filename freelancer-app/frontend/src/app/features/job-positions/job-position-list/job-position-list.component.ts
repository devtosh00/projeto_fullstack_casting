import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { JobPositionService } from '../../../shared/services/job-position.service';
import { ProjectService } from '../../../shared/services/project.service';
import { AuthService } from '../../../core/auth/auth.service';
import { JobPosition } from '../../../shared/models/job-position.model';
import { Project } from '../../../shared/models/project.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-job-position-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Vagas do Projeto</h1>
          <h2 class="text-lg text-gray-600">{{ project?.description }}</h2>
        </div>
        <div *ngIf="isProjectOwner">
          <a [routerLink]="['/projects', projectId, 'jobs', 'new']">
            <app-button>Nova Vaga</app-button>
          </a>
        </div>
      </div>
      
      <div *ngIf="loading" class="flex justify-center my-8">
        <div class="animate-spin h-10 w-10 border-4 border-violet-500 rounded-full border-t-transparent"></div>
      </div>
      
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="!loading && jobPositions.length === 0" class="text-center my-8">
        <p class="text-gray-500">Este projeto ainda não possui vagas abertas.</p>
        <a *ngIf="isProjectOwner" [routerLink]="['/projects', projectId, 'jobs', 'new']" class="text-violet-600 hover:underline mt-2 inline-block">
          Criar primeira vaga
        </a>
      </div>
      
      <div *ngIf="!loading && jobPositions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let job of jobPositions" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-xl font-semibold text-gray-800">{{ job.title }}</h2>
              <span 
                class="px-3 py-1 rounded-full text-sm"
                [class]="job.status === 'aberta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ job.status }}
              </span>
            </div>
            
            <p class="text-gray-700 mb-4">{{ job.description | slice:0:150 }}{{ job.description.length > 150 ? '...' : '' }}</p>
            
            <div class="mb-4">
              <h3 class="text-sm font-semibold mb-2 text-gray-700">Habilidades Necessárias:</h3>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let skill of job.requiredSkills" class="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm">
                  {{ skill }}
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-500">Salário:</span>
              <span class="font-medium">R$ {{ job.salary.toFixed(2) }}</span>
            </div>
            
            <div class="flex items-center gap-2 mb-4">
              <span class="text-gray-500">Prazo:</span>
              <span class="font-medium">{{ formatDate(job.deadline) }}</span>
            </div>
            
            <div class="flex gap-2 mt-4">
              <a [routerLink]="['/projects', projectId, 'jobs', job.id]">
                <app-button variant="secondary">Detalhes</app-button>
              </a>
              <a *ngIf="!isProjectOwner && job.status === 'aberta'" [routerLink]="['/projects', projectId, 'jobs', job.id, 'apply']">
                <app-button>Candidatar-se</app-button>
              </a>
              <app-button *ngIf="isProjectOwner" variant="secondary" (click)="deleteJobPosition(job.id)">Excluir</app-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-8">
        <a [routerLink]="['/projects']" class="text-violet-600 hover:underline">
          &larr; Voltar para projetos
        </a>
      </div>
    </div>
  `
})
export class JobPositionListComponent implements OnInit {
  jobPositions: JobPosition[] = [];
  project: Project | null = null;
  loading = true;
  errorMessage = '';
  projectId: number | null = null;
  isProjectOwner = false;
  
  constructor(
    private jobService: JobPositionService,
    private projectService: ProjectService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.loadProject();
    this.loadJobPositions();
  }
  
  loadProject(): void {
    if (!this.projectId) return;
    
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        
        // Verificar se o usuário logado é o dono do projeto
        this.authService.currentUser$.subscribe(user => {
          if (user && project.userId === user.id) {
            this.isProjectOwner = true;
          }
        });
      },
      error: (error) => {
        console.error('Erro ao carregar projeto:', error);
        this.errorMessage = 'Não foi possível carregar os dados do projeto.';
      }
    });
  }
  
  loadJobPositions(): void {
    if (!this.projectId) return;
    
    this.loading = true;
    this.jobService.getJobPositionsByProject(this.projectId).subscribe({
      next: (jobPositions) => {
        this.jobPositions = jobPositions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar vagas:', error);
        this.errorMessage = 'Não foi possível carregar as vagas deste projeto.';
        this.loading = false;
      }
    });
  }
  
  deleteJobPosition(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      this.jobService.deleteJobPosition(id).subscribe({
        next: () => {
          this.jobPositions = this.jobPositions.filter(job => job.id !== id);
        },
        error: (error) => {
          console.error('Erro ao excluir vaga:', error);
          this.errorMessage = 'Não foi possível excluir a vaga. Tente novamente.';
        }
      });
    }
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
} 