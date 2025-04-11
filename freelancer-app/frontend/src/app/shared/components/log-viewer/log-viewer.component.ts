import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-log-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-0 right-0 z-50 bg-gray-800 text-white p-2 max-w-screen-lg max-h-[50vh] overflow-auto shadow-lg rounded-tl-md" 
         *ngIf="isVisible">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-bold">Console de Logs</h3>
        <div>
          <button class="px-2 py-1 bg-red-600 text-white rounded mr-2" (click)="clearLogs()">Limpar</button>
          <button class="px-2 py-1 bg-gray-600 text-white rounded" (click)="toggleVisibility()">Fechar</button>
        </div>
      </div>
      <div class="font-mono text-sm">
        <div *ngFor="let log of logs" 
            [ngClass]="{
              'text-red-400': log.level === 'error',
              'text-yellow-400': log.level === 'warn',
              'text-green-400': log.level === 'success',
              'text-blue-400': log.level === 'info',
              'text-gray-400': log.level === 'debug'
            }">
          <span class="font-bold">{{ log.timestamp | date:'HH:mm:ss' }}:</span> 
          <span [ngClass]="{'font-bold': log.level === 'error' || log.level === 'warn'}">
            {{ log.message }}
          </span>
        </div>
      </div>
    </div>
    
    <button 
      class="fixed bottom-4 right-4 z-40 bg-indigo-600 text-white p-2 rounded-full shadow-lg" 
      *ngIf="!isVisible"
      (click)="toggleVisibility()">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </button>
  `
})
export class LogViewerComponent implements OnInit {
  logs: any[] = [];
  isVisible = false;
  
  constructor(private loggingService: LoggingService) {}
  
  ngOnInit(): void {
    this.loggingService.logs$.subscribe(logs => {
      this.logs = logs;
    });
  }
  
  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }
  
  clearLogs(): void {
    this.loggingService.clearLogs();
  }
} 