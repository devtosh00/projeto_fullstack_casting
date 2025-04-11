import { RenderMode, ServerRoute } from '@angular/ssr';

// Adicionar todas as rotas necessárias com renderização estática
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'opportunities',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'projects',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender
  },
  // Rotas com parâmetros
  {
    path: 'projects/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([])
  },
  {
    path: 'projects/:projectId/jobs/new',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([])
  },
  {
    path: 'projects/:projectId/jobs/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([])
  },
  {
    path: 'projects/:projectId/jobs/:id/apply',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([])
  },
  // Rota curinga
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
