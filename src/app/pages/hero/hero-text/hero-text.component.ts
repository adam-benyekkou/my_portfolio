import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-text',
  standalone: true,
  imports: [],
  templateUrl: './hero-text.component.html',
  styleUrl: './hero-text.component.css',
})
export class HeroTextComponent implements OnInit, OnDestroy {
  displayText = '';
  nameText = '';

  private messageQueue: string[] = [
    'Web Developer',
    'Coding Enjoyer',
    'Software Artisan',
  ];

  private currentMessage = '';
  private currentName = 'ADAM\nBENYEKKOU';
  private isGlitching = false;
  private isNameGlitching = false;

  // Tracking for cleanup
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private rafIds: number[] = [];

  private isBrowser: boolean;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initialMountAnimation();
    } else {
      // Server-side rendering fallback: show static text immediately
      this.nameText = this.currentName;
      this.displayText = this.messageQueue[0];
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts = [];

    if (this.isBrowser) {
      this.rafIds.forEach((id) => cancelAnimationFrame(id));
      this.rafIds = [];
    }
  }

  private addTimeout(fn: () => void, delay: number): void {
    const id = setTimeout(() => {
      try {
        fn();
      } finally {
        this.timeouts = this.timeouts.filter((t) => t !== id);
      }
    }, delay);
    this.timeouts.push(id);
  }

  private addRaf(fn: () => void): void {
    if (!this.isBrowser) return;
    const id = requestAnimationFrame(() => {
      fn();
    });
    this.rafIds.push(id);
  }

  private initialMountAnimation(): void {
    this.animateNameOnInit();
    this.animateDisplayTextOnInit();
  }

  private animateNameOnInit(): void {
    const targetName = this.currentName;
    let currentIndex = 0;

    const animateNextLetter = (): void => {
      if (currentIndex <= targetName.length) {
        let output = '';

        // Build the confirmed part
        for (let i = 0; i < currentIndex; i++) {
          output += targetName[i];
        }

        // Add intense scrambling for upcoming letters
        const scrambleLength = Math.min(8, targetName.length - currentIndex);
        for (let i = 0; i < scrambleLength; i++) {
          output += Math.random() > 0.5 ? '0' : '1';
        }

        this.nameText = output;
        this.cdr.markForCheck(); // Ensure update

        if (currentIndex < targetName.length) {
          currentIndex++;
          this.addTimeout(animateNextLetter, 45 + Math.random() * 35);
        } else {
          // Name animation complete, start glitching
          this.nameText = targetName;
          this.isNameGlitching = true;
          this.cdr.markForCheck();
          this.glitchName();
        }
      }
    };

    animateNextLetter();
  }

  private animateDisplayTextOnInit(): void {
    const firstMessage = this.messageQueue[0];
    let currentIndex = 0;

    const animateNextLetter = (): void => {
      if (currentIndex <= firstMessage.length) {
        let output = '';

        for (let i = 0; i < currentIndex; i++) {
          output += firstMessage[i];
        }

        const scrambleLength = Math.min(6, firstMessage.length - currentIndex);
        for (let i = 0; i < scrambleLength; i++) {
          output += Math.random() > 0.5 ? '0' : '1';
        }

        this.displayText = output;
        this.cdr.markForCheck();

        if (currentIndex < firstMessage.length) {
          currentIndex++;
          this.addTimeout(animateNextLetter, 35 + Math.random() * 25);
        } else {
          this.displayText = firstMessage;
          this.currentMessage = firstMessage;
          this.messageQueue.shift();
          this.cdr.markForCheck();

          this.addTimeout(() => {
            this.processQueue();
          }, 2000);
        }
      }
    };

    animateNextLetter();
  }

  private processQueue(): void {
    if (this.messageQueue.length === 0) {
      this.messageQueue = [
        'Web Developer',
        'Coding Enjoyer',
        'Software Artisan',
      ];
    }

    const nextMessage = this.messageQueue.shift()!;
    this.startScrambleAnimation(nextMessage);

    this.addTimeout(() => {
      this.processQueue();
    }, 6000);
  }

  private startScrambleAnimation(nextMessage: string): void {
    const length = Math.max(this.displayText.length, nextMessage.length);
    let complete = 0;

    const update = (): void => {
      let output = '';
      const scrambleChars = 3 + Math.random() * 5;

      for (let i = 0; i < length; i++) {
        const scramble = i < scrambleChars + complete && Math.random() > 0.8;

        if (i < nextMessage.length) {
          if (scramble) {
            output += Math.random() > 0.5 ? '0' : '1';
          } else if (i < complete) {
            output += nextMessage[i];
          } else {
            output += this.displayText[i] || (Math.random() > 0.5 ? '0' : '1');
          }
        }
      }

      this.displayText = output;
      this.cdr.markForCheck();

      if (complete < nextMessage.length) {
        complete += 0.5 + Math.floor(Math.random() * 2);
        this.addTimeout(update, 40 + Math.random() * 60);
      } else {
        this.displayText = nextMessage;
        this.currentMessage = nextMessage;
        this.isGlitching = true;
        this.cdr.markForCheck();
        this.glitchText();
      }
    };

    this.isGlitching = false;
    update();
  }

  private glitchText(): void {
    if (!this.isGlitching) return;

    // Safety check to ensure we don't glitch forever if component destroyed
    // (though cleanup handles this, redundancy is good)
    if (!this.isBrowser) return;

    const probability = Math.random();

    if (probability < 0.05) {
      const scrambledText = this.currentMessage
        .split('')
        .map(() => (Math.random() > 0.5 ? '0' : '1'))
        .join('');
      this.displayText = scrambledText;
      this.cdr.markForCheck();

      this.addTimeout(() => {
        this.displayText = this.currentMessage;
        this.cdr.markForCheck();
      }, 25);
    } else if (probability < 0.15) {
      const textArray = this.currentMessage.split('');
      for (let i = 0; i < Math.floor(textArray.length * 0.2); i++) {
        const idx = Math.floor(Math.random() * textArray.length);
        textArray[idx] = Math.random() > 0.5 ? '0' : '1';
      }
      this.displayText = textArray.join('');
      this.cdr.markForCheck();

      this.addTimeout(() => {
        this.displayText = this.currentMessage;
        this.cdr.markForCheck();
      }, 20);
    }

    // Jitter
    const jitterProbability = Math.random();
    if (jitterProbability < 0.1) {
      this.addTimeout(() => {
        // ... implementation ...
        // Simplified for robustness
        const textArray = this.displayText.split('');
        if (textArray.length > 0) {
          const idx = Math.floor(Math.random() * textArray.length);
          if (textArray[idx] === '0' || textArray[idx] === '1') {
            textArray[idx] = textArray[idx] === '0' ? '1' : '0';
          }
          this.displayText = textArray.join('');
          this.cdr.markForCheck();

          this.addTimeout(() => {
            this.displayText = this.currentMessage;
            this.cdr.markForCheck();
          }, 15);
        }
      }, 15);
    }

    this.addRaf(() => {
      this.addTimeout(() => this.glitchText(), Math.random() * 500);
    });
  }

  private glitchName(): void {
    if (!this.isNameGlitching) return;
    if (!this.isBrowser) return;

    const probability = Math.random();

    if (probability < 0.03) {
      const scrambledName = this.currentName
        .split('')
        .map((char) => (char === '\n' ? '\n' : Math.random() > 0.5 ? '0' : '1'))
        .join('');
      this.nameText = scrambledName;
      this.cdr.markForCheck();

      this.addTimeout(() => {
        this.nameText = this.currentName;
        this.cdr.markForCheck();
      }, 30);
    } else if (probability < 0.08) {
      // ... similar logic ...
      const nameArray = this.currentName.split('');
      for (let i = 0; i < Math.floor(nameArray.length * 0.15); i++) {
        const idx = Math.floor(Math.random() * nameArray.length);
        if (nameArray[idx] !== '\n') {
          nameArray[idx] = Math.random() > 0.5 ? '0' : '1';
        }
      }
      this.nameText = nameArray.join('');
      this.cdr.markForCheck();

      this.addTimeout(() => {
        this.nameText = this.currentName;
        this.cdr.markForCheck();
      }, 25);
    }

    this.addRaf(() => {
      this.addTimeout(() => this.glitchName(), Math.random() * 800);
    });
  }
}
