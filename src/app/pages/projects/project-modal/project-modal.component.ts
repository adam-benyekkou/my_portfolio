import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type Project } from '../../../shared/models/project.model';

@Component({
  selector: 'app-project-modal',
  imports: [CommonModule],
  templateUrl: './project-modal.component.html',
  styleUrl: './project-modal.component.css',
})
export class ProjectModalComponent {
  project = input<Project | null>(null);
  closeModal = output<void>();
  constructor() {
    effect(() => {
      if (this.project()) {
        // Modal is open - disable scroll
        document.body.style.overflow = 'hidden';
      } else {
        // Modal is closed - restore scroll
        document.body.style.overflow = 'auto';
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onOverlayClick(event: Event): void {
    // Close modal only if clicking on the overlay, not the modal content
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
