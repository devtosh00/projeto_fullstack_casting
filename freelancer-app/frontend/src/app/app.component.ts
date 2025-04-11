import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { materialModules } from './material.module';
import { LogViewerComponent } from './shared/components/log-viewer/log-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, LogViewerComponent, ...materialModules],
  template: `
    <div class="app-container">
      <app-header></app-header>
      
      <main class="main-content">
        <div class="container py-4 px-4 md:px-2">
          <router-outlet></router-outlet>
        </div>
      </main>
      
      <footer class="footer">
        <div class="container">
          <div class="flex flex-col md:flex-row justify-between items-center py-4">
            <div class="mb-4 md:mb-0">
              <p class="m-0">&copy; 2025 Freelancer Platform. Todos os direitos reservados.</p>
            </div>
            <div class="flex gap-4">
              <a href="#" class="footer-link">Sobre</a>
              <a href="#" class="footer-link">Contato</a>
              <a href="#" class="footer-link">Termos</a>
              <a href="#" class="footer-link">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
      
      <app-log-viewer></app-log-viewer>
    </div>
    
    <style>
      .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: var(--background-color);
      }
      
      .main-content {
        flex: 1;
        margin-top: 76px;
        margin-bottom: 32px;
        padding-top: 16px;
      }
      
      .footer {
        background-color: var(--primary-darker);
        color: white;
        padding: 8px 0;
      }
      
      .footer-link {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: color 0.2s;
      }
      
      .footer-link:hover {
        color: white;
        text-decoration: underline;
      }
    </style>
  `
})
export class AppComponent {
  title = 'freelancer-platform-frontend';
}
