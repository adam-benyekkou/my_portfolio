// project-card.component.ts - Updated version with animation support
import {
  Component,
  input,
  output,
  computed,
  OnInit,
  ElementRef,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';

import { type Project } from '../../../shared/models/project.model';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent implements OnInit {
  // Angular 19 signals
  project = input.required<Project>();
  caseStudyOpen = output<Project>();

  private readonly elementRef = inject(ElementRef);

  ngOnInit() {
    // Add data attribute for potential card-specific targeting
    this.elementRef.nativeElement.setAttribute(
      'data-project-id',
      this.project().id,
    );

    // Trigger any additional load effects if needed
    this.initializeCardAnimations();
  }

  // Computed signals
  statusClass = computed(() => {
    const statusMap: Record<string, string> = {
      '[MISSION_COMPLETED]': 'status-completed',
      '[MISSION_ACTIVE]': 'status-active',
      '[EXPERIMENTAL]': 'status-experimental',
      '[ARCHIVED]': 'status-archived',
    };
    return statusMap[this.project().status] || '';
  });

  redactedTechItems = computed(() => {
    // Return array for *ngFor to create random number of redacted tech items
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 items
    return Array.from({ length: count }, (_, i) => i);
  });

  // Method to calculate staggered animation delays for tech items
  getTechItemDelay(index: number): string {
    const baseDelay = 1.6; // Base delay in seconds
    const staggerDelay = 0.1; // Delay between each item
    return `${baseDelay + index * staggerDelay}s`;
  }

  onCardClick(): void {
    console.log('Card clicked for project:', this.project().title); // Add this line
    console.log('Is redacted:', this.project().isRedacted); // Add this line
    console.log('Has case study:', !!this.project().caseStudy); // Add this line

    if (!this.project().isRedacted && this.project().caseStudy) {
      console.log('Emitting caseStudyOpen event'); // Add this line
      this.caseStudyOpen.emit(this.project());
    } else {
      console.log('Not emitting - conditions not met'); // Add this line
    }
  }

  openLink(event: Event, url: string): void {
    event.stopPropagation();
    window.open(url, '_blank');
  }

  // New glitch effect methods (reduced frequency)
  onHover(): void {
    if (!this.project().isRedacted) {
      // Reduced chance for glitch effects (only 20% chance vs 70% before)
      if (Math.random() > 0.8) {
        this.triggerRandomGlitch();
      }
    }
  }

  onLeave(): void {
    // Clean up any ongoing effects if needed
  }

  triggerButtonGlitch(event: Event): void {
    const button = event.target as HTMLElement;
    // Add temporary glitch class
    button.classList.add('glitch-active');

    // Remove after animation
    setTimeout(() => {
      button.classList.remove('glitch-active');
    }, 500);
  }

  private initializeCardAnimations(): void {
    // Optional: Add any JavaScript-based animation initialization
    // Most animations are handled by CSS, but you could add specific logic here

    if (this.project().isRedacted) {
      // Add extra static effect for redacted cards
      setTimeout(() => {
        this.triggerStaticBurst();
      }, 1500);
    }
  }

  private triggerRandomGlitch(): void {
    // Only text scramble effect now (removed color glitch)
    this.triggerTextScramble();
  }

  private triggerTextScramble(): void {
    // Find text elements and briefly scramble them (reduced frequency)
    const textElements = this.elementRef.nativeElement.querySelectorAll(
      '.glitch-text .detail-value',
    );

    // Only scramble one random element instead of all
    if (textElements.length > 0) {
      const randomIndex = Math.floor(Math.random() * textElements.length);
      this.scrambleText(textElements[randomIndex] as HTMLElement);
    }
  }

  private scrambleText(element: HTMLElement): void {
    const originalText = element.textContent || '';
    const chars = '▓▒░█▄▀■□▪▫';

    // Briefly show scrambled text (reduced scrambles)
    let scrambleCount = 0;
    const maxScrambles = 2; // Reduced from 3 to 2

    const scrambleInterval = setInterval(() => {
      if (scrambleCount >= maxScrambles) {
        element.textContent = originalText;
        clearInterval(scrambleInterval);
        return;
      }

      // Create scrambled version (less aggressive scrambling)
      const scrambled = originalText
        .split('')
        .map((char) =>
          Math.random() > 0.85 // Reduced from 0.7 to 0.85 (less chars affected)
            ? chars[Math.floor(Math.random() * chars.length)]
            : char,
        )
        .join('');

      element.textContent = scrambled;
      scrambleCount++;
    }, 60); // Slightly slower scrambling (50ms -> 60ms)
  }

  // Removed triggerColorGlitch method entirely

  // Method to generate glitch-style loading text
  generateGlitchText(text: string): string {
    const glitchChars = '▓▒░█▄▀■□▪▫◆◇◈◉●○';
    return text
      .split('')
      .map((char) =>
        Math.random() > 0.8
          ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
          : char,
      )
      .join('');
  }

  // Method for redacted card static effect
  triggerStaticBurst(): void {
    if (this.project().isRedacted) {
      const staticOverlay = this.elementRef.nativeElement.querySelector(
        '.static-overlay',
      ) as HTMLElement;
      if (staticOverlay) {
        staticOverlay.style.animation = 'none';
        void staticOverlay.offsetHeight; // Trigger reflow
        staticOverlay.style.animation = 'staticBurst 0.5s ease-out';
      }
    }
  }
}
