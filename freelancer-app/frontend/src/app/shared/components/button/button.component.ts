import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <button 
      [ngClass]="getButtonClasses()"
      [class.mat-mdc-raised-button]="!isText"
      [class.mat-mdc-button]="isText"
      [attr.color]="getButtonColor()"
      [disabled]="disabled || loading"
      [class.w-full]="fullWidth"
      [type]="type"
      (click)="onClick.emit($event)"
    >
      <mat-spinner *ngIf="loading" diameter="20" class="mr-2"></mat-spinner>
      <mat-icon *ngIf="icon && !loading" class="mr-2">{{ icon }}</mat-icon>
      <ng-content *ngIf="!label"></ng-content>
      <span *ngIf="label">{{ label }}</span>
    </button>
    
    <style>
      button {
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 36px;
        border-radius: var(--border-radius-sm) !important;
        padding: 0 16px;
      }
      
      button:not([disabled]):hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md) !important;
      }
      
      .primary {
        background-color: #7c3aed !important; /* purple-600 */
        color: black !important;
        box-shadow: var(--shadow-sm) !important;
        border: 2px solid #5b21b6 !important; /* purple-800 */
        font-weight: bold !important;
      }
      
      .secondary {
        background-color: white !important;
        color: var(--primary) !important;
        border: 2px solid var(--primary) !important;
      }
      
      .text-btn {
        background-color: transparent !important;
        box-shadow: none !important;
        color: var(--primary) !important;
      }
      
      .outline {
        background-color: transparent !important;
        color: var(--primary) !important;
        border: 1px solid var(--primary) !important;
        box-shadow: none !important;
      }
      
      .accent {
        background-color: var(--accent) !important;
        color: var(--text-on-accent) !important;
        font-weight: bold !important;
      }
      
      .warn {
        background-color: var(--warn) !important;
        color: var(--text-on-primary) !important;
      }
      
      .rounded {
        border-radius: 24px !important;
      }
    </style>
  `
})
export class ButtonComponent {
  @Input() label = '';
  @Input() color: 'primary' | 'accent' | 'warn' | '' = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() icon = '';
  @Input() variant: 'primary' | 'secondary' | 'text' | 'accent' | 'warn' | 'outline' = 'primary';
  @Input() rounded = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() onClick = new EventEmitter<MouseEvent>();
  
  get isText(): boolean {
    return this.variant === 'text' || this.variant === 'outline';
  }
  
  getButtonClasses(): string {
    let classes = '';
    
    // Aplicar classe baseada na variante
    if (this.variant === 'text') {
      classes += 'text-btn';
    } else {
      classes += this.variant;
    }
    
    if (this.rounded) {
      classes += ' rounded';
    }
    
    return classes;
  }
  
  getButtonColor(): string | null {
    // Não usamos as cores padrão do Material para nossas variantes personalizadas
    return null;
  }
} 