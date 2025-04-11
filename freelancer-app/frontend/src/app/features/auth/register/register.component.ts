import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../../core/auth/auth.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Criar nova conta</h2>
          <p class="mt-2 text-sm text-gray-600">
            Ou
            <a routerLink="/login" class="font-medium text-violet-600 hover:text-violet-500">
              entre com sua conta existente
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" (ngSubmit)="handleRegister()" #registerForm="ngForm">
          <div class="space-y-4">
            <app-input
              label="Nome de usuário"
              id="username"
              name="username"
              [(value)]="userInfo.username"
              [error]="errors['username']"
              placeholder="Escolha um nome de usuário"
            ></app-input>
            
            <app-input
              type="email"
              label="Email"
              id="email"
              name="email"
              [(value)]="userInfo.email"
              [error]="errors['email']"
              placeholder="Digite seu email"
            ></app-input>
            
            <app-input
              type="password"
              label="Senha"
              id="password"
              name="password"
              [(value)]="userInfo.password"
              [error]="errors['password']"
              placeholder="Crie uma senha forte"
            ></app-input>
            
            <app-input
              type="password"
              label="Confirmar senha"
              id="confirmPassword"
              name="confirmPassword"
              [(value)]="confirmPassword"
              [error]="errors['confirmPassword']"
              placeholder="Confirme sua senha"
            ></app-input>
          </div>
          
          <div class="text-red-500 text-center" *ngIf="registerError">
            {{ registerError }}
          </div>
          
          <div>
            <app-button
              type="submit"
              [loading]="isLoading"
              [disabled]="isLoading || !isFormValid()"
            >
              Registrar
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  userInfo: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };
  
  confirmPassword = '';
  
  errors: Record<string, string> = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  registerError = '';
  isLoading = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  isFormValid(): boolean {
    return (
      !!this.userInfo.username &&
      !!this.userInfo.email &&
      !!this.userInfo.password &&
      this.userInfo.password === this.confirmPassword
    );
  }
  
  validateForm(): boolean {
    let isValid = true;
    this.errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    if (!this.userInfo.username) {
      this.errors['username'] = 'Nome de usuário é obrigatório';
      isValid = false;
    } else if (this.userInfo.username.length < 3) {
      this.errors['username'] = 'Nome de usuário deve ter pelo menos 3 caracteres';
      isValid = false;
    }
    
    if (!this.userInfo.email) {
      this.errors['email'] = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(this.userInfo.email)) {
      this.errors['email'] = 'Email inválido';
      isValid = false;
    }
    
    if (!this.userInfo.password) {
      this.errors['password'] = 'Senha é obrigatória';
      isValid = false;
    } else if (this.userInfo.password.length < 6) {
      this.errors['password'] = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }
    
    if (!this.confirmPassword) {
      this.errors['confirmPassword'] = 'Confirmação de senha é obrigatória';
      isValid = false;
    } else if (this.userInfo.password !== this.confirmPassword) {
      this.errors['confirmPassword'] = 'As senhas não coincidem';
      isValid = false;
    }
    
    return isValid;
  }
  
  handleRegister(): void {
    this.registerError = '';
    
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    
    this.authService.register(this.userInfo).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        
        if (error.status === 400) {
          if (error.error?.errors) {
            // Se o backend retornar erros específicos
            const backendErrors = error.error.errors;
            Object.keys(backendErrors).forEach(key => {
              const fieldName = key.toLowerCase();
              if (this.errors.hasOwnProperty(fieldName)) {
                this.errors[fieldName] = backendErrors[key][0];
              }
            });
          } else {
            this.registerError = error.error?.message || 'Erro no registro. Verifique os dados informados.';
          }
        } else {
          this.registerError = 'Erro no servidor. Tente novamente mais tarde.';
        }
        
        console.error('Erro de registro:', error);
      }
    });
  }
} 