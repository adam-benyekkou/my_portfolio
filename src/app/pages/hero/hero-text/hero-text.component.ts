import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero-text',
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
  private frameRequest: number | null = null;
  private nameFrameRequest: number | null = null;
  private processTimeout: ReturnType<typeof setTimeout> | null = null;
  private isInitialMount = true;

  ngOnInit(): void {
    this.initialMountAnimation();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
    if (this.nameFrameRequest) {
      cancelAnimationFrame(this.nameFrameRequest);
    }
    if (this.processTimeout) {
      clearTimeout(this.processTimeout);
    }
  }

  private initialMountAnimation(): void {
    // Start both animations simultaneously
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

        if (currentIndex < targetName.length) {
          currentIndex++;
          setTimeout(animateNextLetter, 45 + Math.random() * 35); // Slightly slower for name
        } else {
          // Name animation complete, start glitching
          this.nameText = targetName;
          this.isNameGlitching = true;
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

        // Build the confirmed part
        for (let i = 0; i < currentIndex; i++) {
          output += firstMessage[i];
        }

        // Add intense scrambling for upcoming letters
        const scrambleLength = Math.min(6, firstMessage.length - currentIndex);
        for (let i = 0; i < scrambleLength; i++) {
          output += Math.random() > 0.5 ? '0' : '1';
        }

        this.displayText = output;

        if (currentIndex < firstMessage.length) {
          currentIndex++;
          setTimeout(animateNextLetter, 35 + Math.random() * 25);
        } else {
          // Mount animation complete, start normal cycle
          this.displayText = firstMessage;
          this.currentMessage = firstMessage;
          this.messageQueue.shift();
          this.isInitialMount = false;

          // Start the regular cycle after a short pause
          setTimeout(() => {
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

    this.processTimeout = setTimeout(() => {
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

      if (complete < nextMessage.length) {
        complete += 0.5 + Math.floor(Math.random() * 2);
        setTimeout(update, 40 + Math.random() * 60);
      } else {
        this.displayText = nextMessage;
        this.currentMessage = nextMessage;
        this.isGlitching = true;
        this.glitchText();
      }
    };

    this.isGlitching = false;
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
    update();
  }

  private glitchText(): void {
    if (!this.isGlitching) return;

    const probability = Math.random();

    if (probability < 0.05) {
      const scrambledText = this.currentMessage
        .split('')
        .map(() => (Math.random() > 0.5 ? '0' : '1'))
        .join('');
      this.displayText = scrambledText;

      setTimeout(() => {
        this.displayText = this.currentMessage;
      }, 25);
    } else if (probability < 0.15) {
      const textArray = this.currentMessage.split('');
      for (let i = 0; i < Math.floor(textArray.length * 0.2); i++) {
        const idx = Math.floor(Math.random() * textArray.length);
        textArray[idx] = Math.random() > 0.5 ? '0' : '1';
      }
      this.displayText = textArray.join('');

      setTimeout(() => {
        this.displayText = this.currentMessage;
      }, 20);
    }

    const jitterProbability = Math.random();
    if (jitterProbability < 0.1) {
      setTimeout(() => {
        const textArray = this.displayText.split('');
        for (let i = 0; i < 2; i++) {
          const idx = Math.floor(Math.random() * textArray.length);
          if (textArray[idx] === '0' || textArray[idx] === '1') {
            textArray[idx] = textArray[idx] === '0' ? '1' : '0';
          }
        }
        this.displayText = textArray.join('');

        setTimeout(() => {
          this.displayText = this.currentMessage;
        }, 15);
      }, 15);
    }

    this.frameRequest = requestAnimationFrame(() => {
      setTimeout(() => this.glitchText(), Math.random() * 500);
    });
  }

  private glitchName(): void {
    if (!this.isNameGlitching) return;

    const probability = Math.random();

    if (probability < 0.03) {
      // Less frequent than displayText glitching
      const scrambledName = this.currentName
        .split('')
        .map((char) => (char === '\n' ? '\n' : Math.random() > 0.5 ? '0' : '1'))
        .join('');
      this.nameText = scrambledName;

      setTimeout(() => {
        this.nameText = this.currentName;
      }, 30);
    } else if (probability < 0.08) {
      const nameArray = this.currentName.split('');
      for (let i = 0; i < Math.floor(nameArray.length * 0.15); i++) {
        const idx = Math.floor(Math.random() * nameArray.length);
        if (nameArray[idx] !== '\n') {
          // Don't replace line breaks
          nameArray[idx] = Math.random() > 0.5 ? '0' : '1';
        }
      }
      this.nameText = nameArray.join('');

      setTimeout(() => {
        this.nameText = this.currentName;
      }, 25);
    }

    // Subtle character jitter
    const jitterProbability = Math.random();
    if (jitterProbability < 0.05) {
      setTimeout(() => {
        const nameArray = this.nameText.split('');
        for (let i = 0; i < 1; i++) {
          // Just 1 character at a time for name
          const idx = Math.floor(Math.random() * nameArray.length);
          if (nameArray[idx] === '0' || nameArray[idx] === '1') {
            nameArray[idx] = nameArray[idx] === '0' ? '1' : '0';
          }
        }
        this.nameText = nameArray.join('');

        setTimeout(() => {
          this.nameText = this.currentName;
        }, 20);
      }, 20);
    }

    this.nameFrameRequest = requestAnimationFrame(() => {
      setTimeout(() => this.glitchName(), Math.random() * 800); // Slower glitching for name
    });
  }
}
