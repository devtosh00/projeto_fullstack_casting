import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobPositionService } from '../../../shared/services/job-position.service';
import { ProjectService } from '../../../shared/services/project.service';
import { AuthService } from '../../../core/auth/auth.service';
import { JobPosition } from '../../../shared/models/job-position.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-opportunities',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Oportunidades Disponíveis</h1>
        <p class="text-gray-600 mt-2">Encontre projetos para participar e mostre suas habilidades</p>
      </div>
      
      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por título</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="filterJobs()"
              placeholder="Ex: Desenvolvedor Frontend" 
              class="w-full p-2 border border-gray-300 rounded-md"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Habilidade</label>
            <input 
              type="text" 
              [(ngModel)]="skillFilter" 
              (input)="filterJobs()"
              placeholder="Ex: React, Angular, etc." 
              class="w-full p-2 border border-gray-300 rounded-md"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Salário mínimo</label>
            <input 
              type="number" 
              [(ngModel)]="minSalary" 
              (input)="filterJobs()"
              placeholder="Valor em R$" 
              class="w-full p-2 border border-gray-300 rounded-md"
            >
          </div>
        </div>
      </div>
      
      <div *ngIf="loading" class="flex justify-center my-8">
        <div class="animate-spin h-10 w-10 border-4 border-violet-500 rounded-full border-t-transparent"></div>
      </div>
      
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="!loading && filteredJobs.length === 0" class="text-center my-8">
        <p class="text-gray-500">Nenhuma oportunidade encontrada com os filtros atuais.</p>
        <button (click)="clearFilters()" class="text-violet-600 hover:underline mt-2">
          Limpar filtros
        </button>
      </div>
      
      <div *ngIf="!loading && filteredJobs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let job of filteredJobs" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-xl font-semibold text-gray-800">{{ job.title }}</h2>
              <span 
                class="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {{ job.status }}
              </span>
            </div>
            
            <div *ngIf="job.projectName" class="mb-3">
              <span class="text-purple-600 font-medium">{{ job.projectName }}</span>
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
              <a [routerLink]="['/projects', job.projectId, 'jobs', job.id, 'apply']">
                <app-button>Candidatar-se</app-button>
              </a>
              <a [routerLink]="['/projects', job.projectId, 'jobs']">
                <app-button variant="secondary">Ver Projeto</app-button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JobOpportunitiesComponent implements OnInit {
  allJobs: (JobPosition & { projectName?: string })[] = [];
  filteredJobs: (JobPosition & { projectName?: string })[] = [];
  loading = true;
  errorMessage = '';
  
  // Filtros
  searchTerm = '';
  skillFilter = '';
  minSalary = 0;
  
  constructor(
    private jobService: JobPositionService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadJobs();
  }
  
  loadJobs(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.jobService.getJobPositions().subscribe({
      next: (jobs) => {
        // Filtrar apenas vagas abertas
        this.allJobs = jobs.filter(job => job.status === 'aberta');
        
        // Carregar informações do projeto para cada vaga
        this.loadProjectDetails();
        
        this.filteredJobs = [...this.allJobs];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar oportunidades:', error);
        this.errorMessage = 'Não foi possível carregar as oportunidades disponíveis.';
        this.loading = false;
      }
    });
  }
  
  loadProjectDetails(): void {
    // Para cada vaga, buscar o nome do projeto
    this.allJobs.forEach(job => {
      if (job.projectId) {
        this.projectService.getProject(job.projectId).subscribe({
          next: (project) => {
            job.projectName = project.description;
          },
          error: (error) => {
            console.error(`Erro ao carregar detalhes do projeto ${job.projectId}:`, error);
          }
        });
      }
    });
  }
  
  filterJobs(): void {
    this.filteredJobs = this.allJobs.filter(job => {
      // Filtro por título
      const titleMatch = !this.searchTerm || 
                         job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por habilidade
      const skillMatch = !this.skillFilter || 
                         job.requiredSkills.some(skill => 
                           skill.toLowerCase().includes(this.skillFilter.toLowerCase())
                         );
      
      // Filtro por salário mínimo
      const salaryMatch = !this.minSalary || job.salary >= this.minSalary;
      
      return titleMatch && skillMatch && salaryMatch;
    });
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.skillFilter = '';
    this.minSalary = 0;
    this.filteredJobs = [...this.allJobs];
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
} 