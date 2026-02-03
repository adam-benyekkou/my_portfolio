import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tech-stack',
  imports: [],
  templateUrl: './tech-stack.component.html',
  styleUrl: './tech-stack.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechStackComponent {
  label = input.required<string>();
  techStack = input.required<string[]>();
}
