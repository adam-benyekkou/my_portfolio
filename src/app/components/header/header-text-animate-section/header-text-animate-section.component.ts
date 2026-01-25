// header-text-animate-section.component.ts
import {
  Component,
  effect,
  input,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { type TextItem } from '../../../shared/models/header.model';

// Simplified constants
const TYPING_PATTERNS = {
  GLITCH: { delay: 150, probability: 0.03 },
  RAPID: { delay: 10, probability: 0.3 },
  SLOW: { delay: 60, probability: 0.1 },
} as const;

@Component({
  selector: 'app-header-text-animate-section',
  standalone: true,
  imports: [],
  templateUrl: './header-text-animate-section.component.html',
  styleUrl: './header-text-animate-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('textChange', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition('visible => hidden', animate('300ms ease-out')),
      transition('hidden => visible', animate('300ms ease-in')),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class HeaderTextAnimateSectionComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  // Input signals
  phrases = input<readonly string[]>([
    'Uploading guinea pig consciousness to the cloud...',
    'Error: Sarcasm module overloaded. Rebooting...',
    'Downloading personalities... 404: Personality not found.',
    'Coffee.exe has stopped working. Attempting to reboot human...',
    'Converting existential dread to binary...',
    'Hacking the mainframe with a rubber duck...',
    "Neural implant reports: You're still not cool enough...",
    'Cybernetic guinea pigs have seized control of Sector 7...',
    'ERROR: Reality.dll has crashed. Would you like to submit a bug report?',
    'Synthetic sushi generation complete. Tastes like chicken.exe...',
  ] as const);

  interval = input<number>(2500);
  typingSpeed = input<number>(25);
  maxDisplayedTexts = input<number>(4);

  // State signals - simplified
  private readonly displayedTexts = signal<TextItem[]>([]);
  private nextId = 0;
  private phraseIndex = 0;
  private isTyping = false;

  // Computed signals
  readonly currentTexts = computed(() => this.displayedTexts());
  readonly hasTexts = computed(() => this.displayedTexts().length > 0);

  // Single RAF handle for all animations
  private animationFrame: number | null = null;
  private nextTextTimer: number | null = null;

  // Performance optimization: reuse objects
  private readonly typingState = {
    textId: -1,
    charIndex: 0,
    lastUpdate: 0,
    nextDelay: 0,
  };

  constructor() {
    // Initialize when phrases are available
    effect(() => {
      const phrasesList = this.phrases();
      if (phrasesList.length > 0 && this.displayedTexts().length === 0) {
        this.scheduleNextText(0);
      }
    });
  }


  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.nextTextTimer) {
      clearTimeout(this.nextTextTimer);
      this.nextTextTimer = null;
    }

    this.isTyping = false;
  }

  private scheduleNextText(delay: number = this.interval()): void {
    if (this.nextTextTimer) {
      clearTimeout(this.nextTextTimer);
    }

    this.nextTextTimer = setTimeout(() => {
      this.startNextText();
      this.nextTextTimer = null;
    }, delay) as any;
  }

  private startNextText(): void {
    if (this.isTyping) return;

    const phrasesList = this.phrases();
    if (phrasesList.length === 0) return;

    const nextText = phrasesList[this.phraseIndex];
    this.phraseIndex = (this.phraseIndex + 1) % phrasesList.length;

    // Create new text item
    const newItem: TextItem = {
      id: this.nextId++,
      text: nextText,
      displayed: '',
      isTyping: true,
      isComplete: false,
    };

    // Update displayed texts efficiently
    this.displayedTexts.update((texts) => {
      const maxTexts = this.maxDisplayedTexts();
      const newTexts =
        texts.length >= maxTexts
          ? [...texts.slice(-maxTexts + 1), newItem]
          : [...texts, newItem];
      return newTexts;
    });

    // Start typing with RAF
    this.isTyping = true;
    this.typingState.textId = newItem.id;
    this.typingState.charIndex = 0;
    this.typingState.lastUpdate = performance.now();
    this.typingState.nextDelay = this.calculateTypingDelay();

    this.animateWithRAF();
  }

  private animateWithRAF(): void {
    if (!this.isTyping) return;

    const now = performance.now();
    const elapsed = now - this.typingState.lastUpdate;

    if (elapsed >= this.typingState.nextDelay) {
      this.updateTypingCharacter();
      this.typingState.lastUpdate = now;
      this.typingState.nextDelay = this.calculateTypingDelay();
    }

    if (this.isTyping) {
      this.animationFrame = requestAnimationFrame(() => this.animateWithRAF());
    }
  }

  private updateTypingCharacter(): void {
    const texts = this.displayedTexts();
    const textIndex = texts.findIndex((t) => t.id === this.typingState.textId);

    if (textIndex === -1) return;

    const textItem = texts[textIndex];
    const { text } = textItem;

    if (this.typingState.charIndex < text.length) {
      // Update character
      const newDisplayed = text.substring(0, this.typingState.charIndex + 1);

      // Batch update for better performance
      this.displayedTexts.update((currentTexts) => {
        const updated = [...currentTexts];
        updated[textIndex] = { ...textItem, displayed: newDisplayed };
        return updated;
      });

      this.typingState.charIndex++;
    } else {
      // Complete text
      this.completeText(textIndex, textItem);
    }
  }

  private calculateTypingDelay(): number {
    const random = Math.random();
    const baseSpeed = this.typingSpeed();

    // Simplified delay calculation
    if (random < TYPING_PATTERNS.GLITCH.probability) {
      return TYPING_PATTERNS.GLITCH.delay + Math.random() * 50;
    }

    if (random < TYPING_PATTERNS.RAPID.probability) {
      return TYPING_PATTERNS.RAPID.delay + Math.random() * 10;
    }

    if (random < TYPING_PATTERNS.SLOW.probability) {
      return TYPING_PATTERNS.SLOW.delay + Math.random() * 20;
    }

    // Normal typing with minimal variation
    return baseSpeed + (Math.random() * 10 - 5);
  }

  private completeText(textIndex: number, textItem: TextItem): void {
    // Stop animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Mark complete
    this.displayedTexts.update((texts) => {
      const updated = [...texts];
      updated[textIndex] = {
        ...textItem,
        isTyping: false,
        isComplete: true,
      };
      return updated;
    });

    this.isTyping = false;
    this.scheduleNextText();
  }

  // Optimized tracking
  trackByTextId = (index: number, item: TextItem): number => item.id;
}
