import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobPositionService } from '../../../shared/services/job-position.service';
import { AuthService } from '../../../core/auth/auth.service';
import { JobPosition, JobApplication } from '../../../shared/models/job-position.model';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-job-application-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <div class="container mx-auto p-4 max-w-2xl">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">Candidatar-se à Vaga</h1>
        
        <div *ngIf="loading" class="flex justify-center my-8">
          <div class="animate-spin h-10 w-10 border-4 border-violet-500 rounded-full border-t-transparent"></div>
        </div>
        
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="jobPosition" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 class="text-xl font-semibold mb-2">{{ jobPosition.title }}</h2>
          <p class="mb-3">{{ jobPosition.description }}</p>
          
          <div class="mb-4">
            <h3 class="text-sm font-semibold mb-2 text-gray-700">Habilidades Necessárias:</h3>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let skill of jobPosition.requiredSkills" class="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm">
                {{ skill }}
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-2 mb-2">
            <span class="text-gray-500">Salário Proposto:</span>
            <span class="font-medium">R$ {{ jobPosition.salary.toFixed(2) }}</span>
          </div>
          
          <div class="flex items-center gap-2 mb-2">
            <span class="text-gray-500">Prazo:</span>
            <span class="font-medium">{{ formatDate(jobPosition.deadline) }}</span>
          </div>
        </div>
        
        <form (ngSubmit)="submitApplication()" #applicationForm="ngForm" class="space-y-6">
          <app-input
            label="Proposta de Salário (R$)"
            id="proposedSalary"
            name="proposedSalary"
            type="number"
            [(value)]="proposedSalaryStr"
            [error]="errors['proposedSalary']"
            placeholder="Valor em reais, ex: 3000.00"
          ></app-input>
          
          <app-input
            label="Carta de Apresentação"
            id="coverLetter"
            name="coverLetter"
            [(value)]="coverLetterValue"
            [error]="errors['coverLetter']"
            placeholder="Descreva por que você é o candidato ideal para esta vaga"
            [isTextarea]="true"
            [rows]="6"
          ></app-input>
          
          <div class="flex gap-4 pt-4">
            <app-button 
              type="submit" 
              [disabled]="isLoading"
              [loading]="isLoading"
            >
              Enviar Candidatura
            </app-button>
            <app-button 
              variant="secondary" 
              type="button"
              (click)="cancel()"
            >
              Cancelar
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class JobApplicationFormComponent implements OnInit {
  jobPosition: JobPosition | null = null;
  application: Partial<JobApplication> = {
    proposedSalary: 0,
    coverLetter: '',
    status: 'pendente'
  };
  
  proposedSalaryStr = '';
  coverLetterValue = '';
  
  jobPositionId: number | null = null;
  projectId: number | null = null;
  loading = true;
  isLoading = false;
  errorMessage = '';
  errors: { [key: string]: string } = {};
  
  constructor(
    private jobService: JobPositionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.jobPositionId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.jobPositionId) {
      this.loadJobPosition();
    } else {
      this.errorMessage = 'ID da vaga não encontrado.';
      this.loading = false;
    }
    
    // Adicionar o userId na candidatura
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.application.userId = user.id;
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
  
  loadJobPosition(): void {
    if (!this.jobPositionId) return;
    
    this.loading = true;
    this.jobService.getJobPosition(this.jobPositionId).subscribe({
      next: (jobPosition) => {
        this.jobPosition = jobPosition;
        this.proposedSalaryStr = jobPosition.salary.toString(); // Pre-preencher com o salário proposto
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar vaga:', error);
        this.errorMessage = 'Não foi possível carregar os dados da vaga. Tente novamente.';
        this.loading = false;
      }
    });
  }
  
  validateForm(): boolean {
    this.errors = {};
    let isValid = true;
    
    if (!this.proposedSalaryStr || parseFloat(this.proposedSalaryStr) <= 0) {
      this.errors['proposedSalary'] = 'A proposta de salário deve ser um valor positivo';
      isValid = false;
    }
    
    if (!this.coverLetterValue.trim()) {
      this.errors['coverLetter'] = 'A carta de apresentação é obrigatória';
      isValid = false;
    } else if (this.coverLetterValue.length < 50) {
      this.errors['coverLetter'] = 'A carta de apresentação deve ter pelo menos 50 caracteres';
      isValid = false;
    }
    
    return isValid;
  }
  
  submitApplication(): void {
    if (!this.validateForm() || !this.jobPositionId) {
      return;
    }
    
    this.isLoading = true;
    
    // Atualizar os valores do objeto application
    this.application.jobPositionId = this.jobPositionId;
    this.application.proposedSalary = parseFloat(this.proposedSalaryStr);
    this.application.coverLetter = this.coverLetterValue;
    
    this.jobService.applyForJob(this.application).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/projects', this.projectId, 'jobs']);
      },
      error: (error) => {
        console.error('Erro ao enviar candidatura:', error);
        this.errorMessage = 'Não foi possível enviar sua candidatura. Tente novamente.';
        this.isLoading = false;
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/projects', this.projectId, 'jobs']);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
} 