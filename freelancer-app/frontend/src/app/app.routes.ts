import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Rota inicial redireciona para login ou dashboard dependendo da autenticação
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  
  // Rotas de autenticação
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent)
  },
  
  // Rota de oportunidades
  {
    path: 'opportunities',
    loadComponent: () => import('./features/public-projects/public-projects.component').then(c => c.PublicProjectsComponent)
  },
  
  // Rotas de projetos (protegidas pelo guard de autenticação)
  {
    path: 'projects',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/projects/project-list/project-list.component').then(c => c.ProjectListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/projects/project-form/project-form.component').then(c => c.ProjectFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/projects/project-form/project-form.component').then(c => c.ProjectFormComponent)
      },
      // Rotas para vagas de projetos
      {
        path: ':projectId/jobs',
        loadComponent: () => import('./features/job-positions/job-position-list/job-position-list.component').then(c => c.JobPositionListComponent)
      },
      {
        path: ':projectId/jobs/new',
        loadComponent: () => import('./features/job-positions/job-position-form/job-position-form.component').then(c => c.JobPositionFormComponent)
      },
      {
        path: ':projectId/jobs/:id',
        loadComponent: () => import('./features/job-positions/job-position-form/job-position-form.component').then(c => c.JobPositionFormComponent)
      },
      {
        path: ':projectId/jobs/:id/apply',
        loadComponent: () => import('./features/job-positions/job-application-form/job-application-form.component').then(c => c.JobApplicationFormComponent)
      }
    ]
  },
  
  // Rota de dashboard
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-list/project-list.component').then(c => c.ProjectListComponent)
  },
  
  // Rota padrão para qualquer URL não encontrada
  {
    path: '**',
    redirectTo: ''
  }
];
