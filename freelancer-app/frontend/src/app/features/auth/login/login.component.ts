import { Component } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, LoginRequest } from '../../../core/auth/auth.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    InputComponent, 
    ButtonComponent,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="container min-h-screen flex items-center justify-center p-4">
      <mat-card class="w-full max-w-md">
        <mat-card-header>
          <mat-card-title class="text-center mb-4">Entrar na plataforma</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form #form="ngForm" (ngSubmit)="handleLogin()" class="flex flex-col gap-3">
            <app-input
              label="Usuário"
              id="username"
              name="username"
              [(value)]="credentials.username"
              [error]="errors['username']"
              placeholder="Digite seu nome de usuário"
            ></app-input>
            
            <app-input
              type="password"
              label="Senha"
              id="password"
              name="password"
              [(value)]="credentials.password"
              [error]="errors['password']"
              placeholder="Digite sua senha"
            ></app-input>
            
            <div *ngIf="loginError" class="text-error p-2 text-center">
              {{ loginError }}
            </div>
            
            <app-button
              type="submit"
              variant="primary"
              [loading]="isLoading"
              [disabled]="isLoading || !credentials.username || !credentials.password"
              class="mt-4"
            >
              Entrar
            </app-button>
          </form>
          
          <mat-divider class="my-4"></mat-divider>
          
          <div class="text-center">
            <p class="mb-2">Não tem uma conta?</p>
            <a routerLink="/register" class="text-primary">
              Criar nova conta
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };
  
  errors: Record<string, string> = {
    username: '',
    password: ''
  };
  
  loginError = '';
  isLoading = false;
  returnUrl = '/dashboard';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Obter URL de retorno dos parâmetros de consulta ou usar padrão
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
    });
  }
  
  handleLogin(): void {
    // Limpar erros anteriores
    this.errors = { username: '', password: '' };
    this.loginError = '';
    
    // Validação simples
    if (!this.credentials.username) {
      this.errors['username'] = 'Usuário é obrigatório';
      return;
    }
    
    if (!this.credentials.password) {
      this.errors['password'] = 'Senha é obrigatória';
      return;
    }
    
    this.isLoading = true;
    
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.isLoading = false;
        
        if (error.status === 401) {
          this.loginError = 'Usuário ou senha inválidos';
        } else {
          this.loginError = 'Erro ao fazer login. Tente novamente mais tarde.';
        }
        
        console.error('Erro de login:', error);
      }
    });
  }
} 