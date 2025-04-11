import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobPositionService } from '../../../shared/services/job-position.service';
import { JobPosition } from '../../../shared/models/job-position.model';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-job-position-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <div class="container mx-auto p-4 max-w-2xl">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">{{ isEditing ? 'Editar Vaga' : 'Nova Vaga' }}</h1>
        
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {{ errorMessage }}
        </div>
        
        <form (ngSubmit)="saveJobPosition()" #jobForm="ngForm" class="space-y-6">
          <app-input
            label="Título da Vaga"
            id="title"
            name="title"
            [(value)]="titleValue"
            [error]="errors['title']"
            placeholder="Ex: Desenvolvedor Frontend"
          ></app-input>
          
          <app-input
            label="Descrição da Vaga"
            id="description"
            name="description"
            [(value)]="descriptionValue"
            [error]="errors['description']"
            placeholder="Descreva detalhadamente a vaga"
            [isTextarea]="true"
            [rows]="5"
          ></app-input>
          
          <div class="flex flex-col gap-2">
            <label class="text-lg font-medium">Habilidades Necessárias</label>
            <input
              type="text"
              [(ngModel)]="skillInput"
              name="skillInput"
              placeholder="Digite uma habilidade e pressione Enter"
              class="p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
              (keydown.enter)="addSkill($event)"
            />
            
            <div *ngIf="jobPosition.requiredSkills && jobPosition.requiredSkills.length > 0" class="flex flex-wrap gap-2 mt-2">
              <div *ngFor="let skill of jobPosition.requiredSkills; let i = index" class="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm flex items-center">
                {{ skill }}
                <button type="button" (click)="removeSkill(i)" class="ml-2 text-violet-600 hover:text-violet-900">
                  &times;
                </button>
              </div>
            </div>
            
            <span *ngIf="errors['requiredSkills']" class="text-red-500 text-sm">{{ errors['requiredSkills'] }}</span>
          </div>
          
          <app-input
            label="Salário (R$)"
            id="salary"
            name="salary"
            type="number"
            [(value)]="salaryStr"
            [error]="errors['salary']"
            placeholder="Valor em reais, ex: 3000.00"
          ></app-input>
          
          <app-input
            label="Prazo para Candidatura"
            id="deadline"
            name="deadline"
            type="date"
            [(value)]="deadlineStr"
            [error]="errors['deadline']"
          ></app-input>
          
          <div class="flex flex-col gap-2">
            <label class="text-lg font-medium">Status</label>
            <select 
              [(ngModel)]="statusValue" 
              name="status"
              class="p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
            >
              <option value="aberta">Aberta</option>
              <option value="fechada">Fechada</option>
            </select>
            <span *ngIf="errors['status']" class="text-red-500 text-sm">{{ errors['status'] }}</span>
          </div>
          
          <div class="flex gap-4 pt-4">
            <app-button 
              type="submit" 
              [disabled]="isLoading"
              [loading]="isLoading"
            >
              {{ isEditing ? 'Atualizar' : 'Criar' }} Vaga
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
export class JobPositionFormComponent implements OnInit {
  jobPosition: Partial<JobPosition> = {
    title: '',
    description: '',
    requiredSkills: [],
    salary: 0,
    deadline: new Date().toISOString().split('T')[0],
    status: 'aberta'
  };
  
  titleValue = '';
  descriptionValue = '';
  salaryStr = '';
  deadlineStr = '';
  statusValue = 'aberta';
  skillInput = '';
  
  projectId: number | null = null;
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  errors: { [key: string]: string } = {};
  
  constructor(
    private jobService: JobPositionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditing = true;
      this.loadJobPosition(Number(id));
    } else {
      // Formatar a data atual para o input date
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      this.deadlineStr = formattedDate;
      
      if (this.projectId) {
        this.jobPosition.projectId = this.projectId;
      }
    }
  }
  
  loadJobPosition(id: number): void {
    this.isLoading = true;
    
    this.jobService.getJobPosition(id).subscribe({
      next: (jobPosition) => {
        this.jobPosition = jobPosition;
        this.titleValue = jobPosition.title;
        this.descriptionValue = jobPosition.description;
        this.salaryStr = jobPosition.salary.toString();
        this.deadlineStr = new Date(jobPosition.deadline).toISOString().split('T')[0];
        this.statusValue = jobPosition.status;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar vaga:', error);
        this.errorMessage = 'Não foi possível carregar os dados da vaga. Tente novamente.';
        this.isLoading = false;
      }
    });
  }
  
  addSkill(event: Event): void {
    event.preventDefault();
    if (this.skillInput.trim()) {
      if (!this.jobPosition.requiredSkills) {
        this.jobPosition.requiredSkills = [];
      }
      this.jobPosition.requiredSkills.push(this.skillInput.trim());
      this.skillInput = '';
    }
  }
  
  removeSkill(index: number): void {
    if (this.jobPosition.requiredSkills) {
      this.jobPosition.requiredSkills.splice(index, 1);
    }
  }
  
  validateForm(): boolean {
    this.errors = {};
    let isValid = true;
    
    if (!this.titleValue.trim()) {
      this.errors['title'] = 'O título da vaga é obrigatório';
      isValid = false;
    }
    
    if (!this.descriptionValue.trim()) {
      this.errors['description'] = 'A descrição da vaga é obrigatória';
      isValid = false;
    }
    
    if (!this.jobPosition.requiredSkills || this.jobPosition.requiredSkills.length === 0) {
      this.errors['requiredSkills'] = 'Adicione ao menos uma habilidade necessária';
      isValid = false;
    }
    
    if (!this.salaryStr || parseFloat(this.salaryStr) <= 0) {
      this.errors['salary'] = 'O salário deve ser um valor positivo';
      isValid = false;
    }
    
    if (!this.deadlineStr) {
      this.errors['deadline'] = 'A data limite para candidatura é obrigatória';
      isValid = false;
    } else {
      const deadline = new Date(this.deadlineStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadline < today) {
        this.errors['deadline'] = 'A data limite deve ser futura';
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  saveJobPosition(): void {
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    
    // Atualizar os valores do objeto jobPosition
    this.jobPosition.title = this.titleValue;
    this.jobPosition.description = this.descriptionValue;
    this.jobPosition.salary = parseFloat(this.salaryStr);
    this.jobPosition.deadline = this.deadlineStr;
    this.jobPosition.status = this.statusValue as 'aberta' | 'fechada';
    
    if (this.isEditing && this.jobPosition.id) {
      this.jobService.updateJobPosition(this.jobPosition.id, this.jobPosition).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (error) => {
          console.error('Erro ao atualizar vaga:', error);
          this.errorMessage = 'Não foi possível atualizar a vaga. Tente novamente.';
          this.isLoading = false;
        }
      });
    } else {
      this.jobService.createJobPosition(this.jobPosition).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (error) => {
          console.error('Erro ao criar vaga:', error);
          this.errorMessage = 'Não foi possível criar a vaga. Tente novamente.';
          this.isLoading = false;
        }
      });
    }
  }
  
  cancel(): void {
    this.router.navigate(['/projects', this.projectId]);
  }
} 