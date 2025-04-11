import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary" class="fixed-header white-toolbar">
      <div class="container">
        <a routerLink="/" class="app-name">FreelancerPlatform</a>
        <span class="spacer"></span>
        
        <ng-container *ngIf="authService.isAuthenticated()">
          <a routerLink="/dashboard" class="nav-link">
            <mat-icon class="nav-icon">dashboard</mat-icon>
            <span class="nav-text">Dashboard</span>
          </a>
          <a routerLink="/projects" class="nav-link">
            <mat-icon class="nav-icon">work</mat-icon>
            <span class="nav-text">Projetos</span>
          </a>
          <a routerLink="/opportunities" class="nav-link">
            <mat-icon class="nav-icon">search</mat-icon>
            <span class="nav-text">Oportunidades</span>
          </a>
          <button mat-button (click)="authService.logout()" class="nav-link">
            <mat-icon class="nav-icon">exit_to_app</mat-icon>
            <span class="nav-text">Sair</span>
          </button>
        </ng-container>
        
        <ng-container *ngIf="!authService.isAuthenticated()">
          <a routerLink="/login" class="nav-link">
            <mat-icon class="nav-icon">login</mat-icon>
            <span class="nav-text">Login</span>
          </a>
          <a routerLink="/register" class="nav-link">
            <mat-icon class="nav-icon">person_add</mat-icon>
            <span class="nav-text">Registrar</span>
          </a>
        </ng-container>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .fixed-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 999;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      padding: 0;
    }
    
    .white-toolbar {
      background-color: white !important;
      color: #333 !important;
      border-bottom: 3px solid #ffc107 !important;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      display: flex;
      align-items: center;
    }
    
    .app-name {
      text-decoration: none;
      color: #333;
      font-weight: 700;
      font-size: 1.2rem;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      margin-left: 16px;
      text-decoration: none;
      color: #333;
      font-weight: 700;
      padding: 0 8px;
    }
    
    .nav-icon {
      margin-right: 6px;
      color: #7b1fa2 !important; /* Roxo */
    }
    
    .nav-text {
      font-weight: 700;
      color: #333;
    }
    
    /* Garantir que todos os textos no cabeçalho estejam em negrito */
    .mat-toolbar button span,
    .mat-toolbar a span,
    .mat-toolbar .mat-button-wrapper {
      font-weight: 700 !important;
    }
    
    /* Garantir que mat-icon seja roxo */
    mat-icon {
      color: #7b1fa2 !important;
    }
  `]
})
export class HeaderComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {}
} 