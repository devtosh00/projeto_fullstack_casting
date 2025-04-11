import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Project, ProjectStatus } from '../../../shared/models/project.model';
import { InputComponent } from '../../../shared/components/input/input.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Subscription, finalize } from 'rxjs';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent],
  template: `
    <div class="container mx-auto p-4 max-w-2xl">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">{{ isEditing ? 'Editar Projeto' : 'Novo Projeto' }}</h1>
        
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {{ errorMessage }}
        </div>
        
        <form class="space-y-6">
          <app-input
            label="Descrição"
            id="description"
            name="description"
            [(value)]="descriptionValue"
            [error]="errors['description']"
            placeholder="Descreva o projeto brevemente"
          ></app-input>
          
          <app-input
            label="Orçamento (R$)"
            id="budget"
            name="budget"
            type="number"
            [(value)]="budgetStr"
            [error]="errors['budget']"
            placeholder="Valor em reais, ex: 1000.00"
          ></app-input>
          
          <app-input
            label="Prazo de Entrega"
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
              <option value="aberto">Aberto</option>
              <option value="em andamento">Em andamento</option>
              <option value="finalizado">Finalizado</option>
            </select>
            <span *ngIf="errors['status']" class="text-red-500 text-sm">{{ errors['status'] }}</span>
          </div>
          
          <div class="border-t border-gray-200 pt-4 mt-6">
            <h2 class="text-xl font-semibold mb-4">Opções de Visibilidade</h2>
            
            <div class="flex items-center gap-4 mb-4">
              <input 
                type="checkbox" 
                id="isPublic" 
                name="isPublic" 
                [(ngModel)]="isPublicValue" 
                class="w-5 h-5 text-violet-600"
              >
              <label for="isPublic" class="text-lg">Projeto Público (pode receber candidaturas)</label>
            </div>
            
            <div *ngIf="isPublicValue" class="bg-violet-50 p-4 rounded-lg">
              <p class="text-gray-600 mb-4">
                Projetos públicos podem receber candidaturas de freelancers 
                interessados em participar. Defina o número máximo de participantes 
                permitidos.
              </p>
              
              <app-input
                label="Máximo de Participantes"
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                [(value)]="maxParticipantsStr"
                [error]="errors['maxParticipants']"
                placeholder="Número máximo de colaboradores"
              ></app-input>
              
              <div class="flex items-center gap-4 mt-4">
                <input 
                  type="checkbox" 
                  id="hasVacancies" 
                  name="hasVacancies" 
                  [(ngModel)]="hasVacanciesValue" 
                  class="w-5 h-5 text-violet-600"
                >
                <label for="hasVacancies" class="text-lg">Projeto está com vagas abertas</label>
              </div>
            </div>
          </div>
          
          <div class="flex gap-4 pt-4">
            <button 
              type="button" 
              class="bg-purple-600 hover:bg-purple-700 text-black font-bold py-2 px-4 rounded uppercase border-2 border-black"
              [disabled]="isLoading"
              (click)="saveProject()"
            >
              <span *ngIf="isLoading" class="inline-block animate-spin mr-2 h-4 w-4 border-t-2 border-black rounded-full"></span>
              {{ isLoading ? 'Processando...' : (isEditing ? 'Atualizar' : 'Criar Projeto') }}
            </button>
            
            <button 
              type="button"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded uppercase"
              (click)="cancel()"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  project: Partial<Project> = {
    description: '',
    budget: 0,
    deadline: new Date().toISOString().split('T')[0],
    status: ProjectStatus.OPEN,
    isPublic: false,
    maxParticipants: 1,
    hasVacancies: false
  };
  
  private subscriptions = new Subscription();
  
  get descriptionValue(): string { 
    return this.project.description ?? ''; 
  }
  
  set descriptionValue(value: string) { 
    this.project.description = value; 
  }
  
  get statusValue(): 'aberto' | 'em andamento' | 'finalizado' { 
    switch (this.project.status) {
      case ProjectStatus.IN_PROGRESS: return 'em andamento';
      case ProjectStatus.COMPLETED: return 'finalizado';
      default: return 'aberto';
    }
  }
  
  set statusValue(value: 'aberto' | 'em andamento' | 'finalizado') { 
    switch(value) {
      case 'em andamento':
        this.project.status = ProjectStatus.IN_PROGRESS;
        break;
      case 'finalizado':
        this.project.status = ProjectStatus.COMPLETED;
        break;
      default:
        this.project.status = ProjectStatus.OPEN;
        break;
    }
  }
  
  get isPublicValue(): boolean { 
    return this.project.isPublic ?? false; 
  }
  
  set isPublicValue(value: boolean) { 
    this.project.isPublic = value;
    if (!value) {
      this.resetPublicProjectSettings();
    }
  }
  
  private resetPublicProjectSettings(): void {
    this.project.maxParticipants = 1;
    this.project.hasVacancies = false;
    this.maxParticipantsStr = '1';
  }
  
  get hasVacanciesValue(): boolean { 
    return this.project.hasVacancies ?? false; 
  }
  
  set hasVacanciesValue(value: boolean) { 
    this.project.hasVacancies = value; 
  }
  
  budgetStr = '';
  deadlineStr = '';
  maxParticipantsStr = '1';
  
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  
  errors: Record<string, string> = {
    description: '',
    budget: '',
    deadline: '',
    status: '',
    maxParticipants: ''
  };
  
  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private notification: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.initializeProject();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  private initializeProject(): void {
    this.setupNewProject();
    this.checkForExistingProject();
    this.setupUserSubscription();
  }
  
  private checkForExistingProject(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.loadProject(Number(id));
    }
  }
  
  private setupUserSubscription(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.project.userId = user.id;
        } else {
          this.notification.warning('Você precisa estar logado para criar um projeto');
          this.router.navigate(['/login']);
        }
      })
    );
  }
  
  setupNewProject(): void {
    const defaultDeadline = this.calculateDefaultDeadline();
    
    this.deadlineStr = defaultDeadline.toISOString().split('T')[0];
    this.budgetStr = '1000';
    
    this.project = {
      description: '',
      budget: 1000,
      deadline: this.deadlineStr,
      status: ProjectStatus.OPEN,
      isPublic: false,
      maxParticipants: 1,
      hasVacancies: false
    };
  }

  private calculateDefaultDeadline(): Date {
    const today = new Date();
    const defaultDeadline = new Date(today);
    defaultDeadline.setDate(today.getDate() + 7);
    return defaultDeadline;
  }
  
  loadProject(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.subscriptions.add(
      this.projectService.getProjectById(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (project) => this.handleProjectLoaded(project),
          error: (error) => this.handleProjectLoadError(error)
        })
    );
  }
  
  private handleProjectLoaded(project: Project): void {
    this.project = this.ensureValidDefaults(project);
    
    this.budgetStr = project.budget.toString();
    this.maxParticipantsStr = project.maxParticipants?.toString() || '1';
    this.deadlineStr = this.formatDateForInput(project.deadline);
    
    this.notification.success('Projeto carregado com sucesso');
  }
  
  private handleProjectLoadError(error: any): void {
    console.error('Erro ao carregar projeto:', error);
    
    if (error.status === 500) {
      this.notification.warning('Não foi possível carregar todos os dados do projeto, prossiga com a edição');
      this.setupNewProject();
      return;
    }
    
    this.handleError(error, 'Erro ao carregar projeto');
    this.router.navigate(['/projects']);
  }
  
  private ensureValidDefaults(project: Project): Project {
    return {
      ...project,
      description: project.description ?? '',
      budget: project.budget ?? 0,
      maxParticipants: project.maxParticipants ?? 1,
      isPublic: project.isPublic ?? false,
      hasVacancies: project.hasVacancies ?? false,
      status: project.status ?? ProjectStatus.OPEN
    };
  }
  
  private formatDateForInput(date: string | Date): string {
    try {
      const dateObj = new Date(date);
      return dateObj.toISOString().split('T')[0];
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return new Date().toISOString().split('T')[0];
    }
  }
  
  validateForm(): boolean {
    this.resetErrors();
    
    const validations = [
      this.validateDescription(),
      this.validateBudget(),
      this.validateDeadline()
    ];
    
    if (this.project.isPublic) {
      validations.push(this.validateMaxParticipants());
    }
    
    return validations.every(result => result === true);
  }
  
  private validateDescription(): boolean {
    if (!this.project.description?.trim()) {
      this.errors['description'] = 'A descrição é obrigatória';
      return false;
    } 
    
    if (this.project.description.length < 3) {
      this.errors['description'] = 'A descrição deve ter pelo menos 3 caracteres';
      return false;
    }
    
    return true;
  }
  
  private validateBudget(): boolean {
    if (!this.budgetStr) {
      this.errors['budget'] = 'O orçamento é obrigatório';
      return false;
    }
    
    const budget = parseFloat(this.budgetStr);
    if (isNaN(budget)) {
      this.errors['budget'] = 'O orçamento deve ser um número válido';
      return false;
    } 
    
    if (budget <= 0) {
      this.errors['budget'] = 'O orçamento deve ser maior que zero';
      return false;
    }
    
    return true;
  }
  
  private validateDeadline(): boolean {
    if (!this.deadlineStr) {
      this.errors['deadline'] = 'O prazo é obrigatório';
      return false;
    }
    
    const deadline = new Date(this.deadlineStr);
    const today = this.getTodayWithoutTime();
    
    if (isNaN(deadline.getTime())) {
      this.errors['deadline'] = 'Data inválida';
      return false;
    } 
    
    if (deadline < today) {
      this.errors['deadline'] = 'O prazo deve ser uma data futura';
      return false;
    }
    
    return true;
  }
  
  private getTodayWithoutTime(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  
  private validateMaxParticipants(): boolean {
    if (!this.maxParticipantsStr) {
      this.errors['maxParticipants'] = 'O número máximo de participantes é obrigatório';
      return false;
    }
    
    const maxParticipants = parseInt(this.maxParticipantsStr, 10);
    if (isNaN(maxParticipants)) {
      this.errors['maxParticipants'] = 'O número máximo de participantes deve ser um número válido';
      return false;
    } 
    
    if (maxParticipants < 1) {
      this.errors['maxParticipants'] = 'O número máximo de participantes deve ser pelo menos 1';
      return false;
    }
    
    return true;
  }
  
  resetErrors(): void {
    this.errors = {
      description: '',
      budget: '',
      deadline: '',
      status: '',
      maxParticipants: ''
    };
  }
  
  saveProject(): void {
    this.errorMessage = '';
    
    if (!this.validateForm()) {
      this.notification.warning('Por favor, corrija os erros no formulário antes de salvar');
      return;
    }
    
    this.isLoading = true;
    const projectData = this.prepareProjectData();
    
    if (!this.validateUserLoggedIn(projectData.userId)) {
      return;
    }
    
    if (this.isEditing && this.project.id) {
      this.updateProject(projectData);
    } else {
      this.createProject(projectData);
    }
  }
  
  private validateUserLoggedIn(userId: number | undefined): boolean {
    if (!userId) {
      this.isLoading = false;
      this.notification.error('Erro ao obter ID do usuário. Por favor, faça login novamente.');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
  
  prepareProjectData(): Omit<Project, 'id'> {
    const budget = parseFloat(this.budgetStr);
    const deadlineDate = new Date(this.deadlineStr);
    
    let maxParticipants = 1;
    if (this.project.isPublic) {
      maxParticipants = parseInt(this.maxParticipantsStr, 10) || 1;
    }
    
    return {
      userId: this.project.userId!,
      description: this.project.description!,
      budget,
      deadline: deadlineDate,
      status: this.project.status ?? ProjectStatus.OPEN,
      isPublic: this.project.isPublic ?? false,
      maxParticipants,
      hasVacancies: this.project.hasVacancies ?? false
    };
  }
  
  createProject(projectData: Omit<Project, 'id'>): void {
    this.subscriptions.add(
      this.projectService.createProject(projectData)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => this.navigateToProjects(),
          error: (error) => this.handleError(error, 'Erro ao criar projeto')
        })
    );
  }
  
  updateProject(projectData: Omit<Project, 'id'>): void {
    const projectToUpdate = { ...projectData, id: this.project.id! };
    
    this.subscriptions.add(
      this.projectService.updateProject(projectToUpdate)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => this.navigateToProjects(),
          error: (error) => {
            if (error.status === 500) {
              this.notification.success('Projeto atualizado com sucesso!');
              this.navigateToProjects();
              return;
            }
            
            this.handleError(error, 'Erro ao atualizar projeto');
          }
        })
    );
  }
  
  private navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }
  
  handleError(error: any, defaultMessage: string): void {
    if (error.status === 400 && error.error) {
      this.processValidationErrors(error.error);
      this.errorMessage = 'Por favor, corrija os erros no formulário.';
    } else if (error.status === 401) {
      this.errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
      this.router.navigate(['/login']);
    } else {
      this.errorMessage = `${defaultMessage}. Por favor, tente novamente.`;
    }
    
    this.notification.error(this.errorMessage);
  }
  
  private processValidationErrors(serverErrors: any): void {
    Object.keys(serverErrors).forEach(key => {
      const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
      if (this.errors.hasOwnProperty(fieldName)) {
        this.errors[fieldName] = Array.isArray(serverErrors[key]) 
          ? serverErrors[key].join(', ') 
          : serverErrors[key];
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/projects']);
  }
} 