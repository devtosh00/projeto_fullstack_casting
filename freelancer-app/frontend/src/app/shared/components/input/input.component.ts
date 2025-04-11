import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
    <mat-form-field appearance="outline" class="w-full custom-input">
      <mat-label>{{ label }}</mat-label>
      <span matPrefix *ngIf="prefixIcon" class="prefix-icon">
        <mat-icon>{{ prefixIcon }}</mat-icon>
      </span>
      
      <ng-container *ngIf="!isTextarea; else textareaTemplate">
        <input 
          matInput 
          [type]="type" 
          [id]="id" 
          [name]="name"
          [(ngModel)]="value" 
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [class.with-prefix]="prefixIcon"
          [attr.aria-label]="label"
        >
      </ng-container>
      
      <ng-template #textareaTemplate>
        <textarea 
          matInput 
          [id]="id" 
          [name]="name"
          [(ngModel)]="value" 
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [attr.aria-label]="label"
          [rows]="rows"
        ></textarea>
      </ng-template>
      
      <span matSuffix *ngIf="suffixIcon">
        <mat-icon>{{ suffixIcon }}</mat-icon>
      </span>
      <mat-hint *ngIf="hint">{{ hint }}</mat-hint>
      <mat-error *ngIf="error">{{ error }}</mat-error>
    </mat-form-field>
    
    <style>
      .custom-input {
        margin-bottom: 12px;
      }
      
      .custom-input ::ng-deep .mat-mdc-form-field-flex {
        border-radius: var(--border-radius-sm) !important;
      }
      
      .custom-input ::ng-deep .mat-mdc-text-field-wrapper {
        background-color: white !important;
        border: 1px solid var(--border) !important;
      }
      
      .custom-input ::ng-deep .mdc-notched-outline__leading,
      .custom-input ::ng-deep .mdc-notched-outline__trailing {
        border-color: var(--primary) !important;
        border-width: 1px !important;
      }
      
      .custom-input ::ng-deep .mdc-notched-outline__notch {
        border-color: var(--primary) !important;
        border-width: 1px !important;
      }
      
      .custom-input ::ng-deep .mat-mdc-form-field-focus-overlay {
        background-color: rgba(142, 36, 170, 0.05);
      }
      
      .custom-input ::ng-deep .mat-mdc-form-field-hint {
        font-size: 12px;
        color: var(--text-secondary) !important;
      }
      
      .custom-input ::ng-deep .mat-mdc-form-field-error {
        font-size: 12px;
        color: var(--warn) !important;
        font-weight: 500;
      }
      
      .custom-input ::ng-deep .mat-mdc-form-field-infix {
        color: var(--text-primary) !important;
      }
      
      .custom-input ::ng-deep .mat-mdc-form-field-label {
        color: var(--primary) !important;
        font-weight: 500;
      }
      
      .custom-input ::ng-deep .mdc-text-field--focused .mdc-floating-label {
        color: var(--primary) !important;
      }
      
      .custom-input ::ng-deep input, 
      .custom-input ::ng-deep textarea {
        color: var(--text-primary) !important;
        font-weight: 500 !important;
      }
      
      .prefix-icon {
        margin-right: 8px;
        color: var(--primary) !important;
      }
      
      input.with-prefix {
        padding-left: 8px;
      }
    </style>
  `
})
export class InputComponent {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() value = '';
  @Input() id = '';
  @Input() name = '';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() isTextarea = false;
  @Input() rows = 3;
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
} 