import {
  Component,
  input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-section-title',
  imports: [],
  templateUrl: './section-title.component.html',
  styleUrl: './section-title.component.css',
})
export class SectionTitleComponent implements OnInit, OnDestroy {
  @ViewChild('mainText', { static: true })
  mainTextRef!: ElementRef<HTMLElement>;
  @ViewChild('shadow1', { static: true }) shadow1Ref!: ElementRef<HTMLElement>;
  @ViewChild('shadow2', { static: true }) shadow2Ref!: ElementRef<HTMLElement>;

  title = input<string>();

  private animationFrame?: number;
  private timeoutIds: number[] = [];

  ngOnInit() {
    // Start animation after component initializes
    setTimeout(() => this.startScrambleAnimation(), 100);
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.timeoutIds.forEach((id) => clearTimeout(id));
  }

  private startScrambleAnimation() {
    const titleText = this.title() || '';
    if (!titleText) return;

    const duration = 2000; // Total animation duration
    const letterDelay = 80; // Delay between each letter reveal

    this.simultaneousScrambleAndReveal(titleText, duration, letterDelay);
  }

  private simultaneousScrambleAndReveal(
    targetText: string,
    totalDuration: number,
    letterDelay: number,
  ) {
    const startTime = Date.now();
    const revealedLetters = new Array(targetText.length).fill(false);
    const letterBinaryStates = new Array(targetText.length)
      .fill(null)
      .map(() => (Math.random() > 0.5 ? '0' : '1'));

    // Schedule letter reveals
    for (let i = 0; i < targetText.length; i++) {
      if (targetText[i] !== ' ') {
        const timeoutId = setTimeout(() => {
          revealedLetters[i] = true;
        }, i * letterDelay);
        this.timeoutIds.push(timeoutId as unknown as number);
      } else {
        revealedLetters[i] = true; // Spaces are always "revealed"
      }
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < totalDuration) {
        let displayText = '';

        for (let i = 0; i < targetText.length; i++) {
          if (targetText[i] === ' ') {
            displayText += ' ';
          } else if (revealedLetters[i]) {
            displayText += targetText[i];
          } else {
            // Each position gets its own random binary that changes
            letterBinaryStates[i] = Math.random() > 0.5 ? '0' : '1';
            displayText += letterBinaryStates[i];
          }
        }

        this.updateTextContent(displayText);
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        // Final state - show complete text
        this.updateTextContent(targetText);
      }
    };

    animate();
  }

  private updateTextContent(text: string) {
    if (this.mainTextRef?.nativeElement) {
      this.mainTextRef.nativeElement.textContent = text;
    }
    if (this.shadow1Ref?.nativeElement) {
      this.shadow1Ref.nativeElement.textContent = text;
    }
    if (this.shadow2Ref?.nativeElement) {
      this.shadow2Ref.nativeElement.textContent = text;
    }
  }
}
