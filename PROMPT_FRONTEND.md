/* SCRIPT DE IMPLEMENTAÇÃO ANGULAR - MELHORIAS PROPOSTAS */

// PASSO 1: Configuração Inicial
1. Criar estrutura de pastas:
   - src/app/shared/components
   - src/app/shared/services
   - src/app/shared/validators
   - src/app/core/auth
   - src/app/features/

2. Instalar dependências:
   npm install @angular/forms @angular/router @ngx-translate/core jwt-decode

// PASSO 2: Componentes Compartilhados
3. Criar componente de Input Reutilizável (shared/components/input):
   import { Component, Input, Output, EventEmitter } from '@angular/core';
   import { CommonModule } from '@angular/common';
   import { FormsModule } from '@angular/forms';

   @Component({
     selector: 'app-input',
     standalone: true,
     imports: [CommonModule, FormsModule],
     template: `
       <div class="flex flex-col gap-2 w-full">
         <label [for]="id" class="text-lg font-medium">{{ label }}</label>
         <input
           [type]="type"
           [id]="id"
           [name]="name"
           [(ngModel)]="value"
           (input)="onInput($event)"
           [placeholder]="placeholder"
           [attr.aria-invalid]="!!error"
           class="p-4 border-2 rounded-lg focus:ring-2 focus:outline-none transition-all"
           [class]="error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-violet-200'"
         >
         <span *ngIf="error" class="text-red-500 text-sm">{{ error }}</span>
       </div>
     `
   })
   export class InputComponent {
     @Input() label = '';
     @Input() type = 'text';
     @Input() placeholder = '';
     @Input() error = '';
     @Input() value = '';
     @Input() id = '';
     @Input() name = '';
     @Output() valueChange = new EventEmitter<string>();

     onInput(event: Event) {
       this.valueChange.emit((event.target as HTMLInputElement).value);
     }
   }

4. Criar componente de Botão (shared/components/button):
   import { Component, Input, Output, EventEmitter } from '@angular/core';
   import { CommonModule } from '@angular/common';

   @Component({
     selector: 'app-button',
     standalone: true,
     imports: [CommonModule],
     template: `
       <button
         [type]="type"
         [disabled]="disabled"
         (click)="onClick.emit($event)"
         class="flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
         [class]="variant === 'primary' 
           ? 'bg-violet-500 text-white hover:bg-violet-600 focus:ring-2 focus:ring-violet-300' 
           : 'bg-transparent text-violet-700 hover:bg-violet-50 border-2 border-violet-500'"
       >
         <ng-content></ng-content>
         @if (loading) {
           <span class="animate-spin">⏳</span>
         }
       </button>
     `
   })
   export class ButtonComponent {
     @Input() variant: 'primary' | 'secondary' = 'primary';
     @Input() type: 'button' | 'submit' = 'button';
     @Input() disabled = false;
     @Input() loading = false;
     @Output() onClick = new EventEmitter<Event>();
   }

// PASSO 3: Serviços Essenciais
5. Criar AuthService (core/auth/auth.service.ts):
   import { Injectable } from '@angular/core';
   import { HttpClient } from '@angular/common/http';
   import { BehaviorSubject, tap } from 'rxjs';

   @Injectable({ providedIn: 'root' })
   export class AuthService {
     private authUrl = '/api/auth';
     private userSubject = new BehaviorSubject<any>(null);
     
     constructor(private http: HttpClient) {}

     login(credentials: { username: string; password: string }) {
       return this.http.post(`${this.authUrl}/login`, credentials).pipe(
         tap((response: any) => this.setSession(response))
       );
     }

     private setSession(authResult: any) {
       localStorage.setItem('access_token', authResult.token);
       this.userSubject.next(authResult.user);
     }
   }

6. Criar ProjectService (shared/services/project.service.ts):
   import { Injectable } from '@angular/core';
   import { Project } from '../models/project.model';

   @Injectable({ providedIn: 'root' })
   export class ProjectService {
     private projects: Project[] = [];

     getProjects(status?: string): Project[] {
       return status 
         ? this.projects.filter(p => p.status === status)
         : this.projects;
     }

     createProject(project: Omit<Project, 'id'>) {
       const newProject = { ...project, id: Date.now() };
       this.projects = [...this.projects, newProject];
       return newProject;
     }
   }

// PASSO 4: Implementação das Páginas
7. Atualizar LoginComponent (features/auth/login):
   import { Component } from '@angular/core';
   import { RouterLink } from '@angular/router';
   import { AuthService } from '../../core/auth/auth.service';
   import { InputComponent, ButtonComponent } from '../../shared/components';

   @Component({
     standalone: true,
     imports: [InputComponent, ButtonComponent, RouterLink],
     template: `
       <form #form="ngForm" (ngSubmit)="handleLogin()">
         <app-input
           label="Email ou usuário"
           [(value)]="credentials.email"
           [error]="errors.email"
         ></app-input>

         <app-input
           type="password"
           label="Senha"
           [(value)]="credentials.password"
           [error]="errors.password"
         ></app-input>

         <app-button
           type="submit"
           variant="primary"
           [disabled]="form.invalid || isLoading"
           [loading]="isLoading"
         >
           Entrar
         </app-button>

         <a routerLink="/register" class="text-violet-700 hover:underline">
           Criar nova conta
         </a>
       </form>
     `
   })
   export class LoginComponent {
     credentials = { email: '', password: '' };
     errors = { email: '', password: '' };
     isLoading = false;

     constructor(private authService: AuthService) {}

     async handleLogin() {
       this.isLoading = true;
       try {
         await this.authService.login(this.credentials);
       } catch (error) {
         this.handleErrors(error);
       } finally {
         this.isLoading = false;
       }
     }

     private handleErrors(error: any) {
       // Lógica de tratamento de erros
     }
   }

// PASSO 5: Otimizações Finais
8. Configurar Tailwind com classes reutilizáveis:
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           primary: '#8B5CF6',
           secondary: '#F59E0B',
           danger: '#EF4444'
         },
         spacing: {
           '18': '4.5rem'
         }
       }
     }
   }

9. Implementar Lazy Loading:
   // app.routes.ts
   export const routes: Routes = [
     {
       path: 'login',
       loadComponent: () => import('./features/auth/login.component')
     },
     {
       path: 'dashboard',
       loadComponent: () => import('./features/dashboard/dashboard.component'),
       canActivate: [authGuard]
     }
   ];

10. Criar Directives para Validação:
    // shared/validators/match-password.validator.ts
    import { Directive } from '@angular/core';
    import { NG_VALIDATORS, FormGroup } from '@angular/forms';

    @Directive({
      selector: '[appMatchPassword]',
      providers: [{
        provide: NG_VALIDATORS,
        useExisting: MatchPasswordDirective,
        multi: true
      }]
    })
    export class MatchPasswordDirective {
      validate(formGroup: FormGroup) {
        const [password, confirmPassword] = Object.values(formGroup.controls);
        return password === confirmPassword ? null : { passwordMismatch: true };
      }
    }