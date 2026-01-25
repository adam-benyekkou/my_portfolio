import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tech-stack',
  imports: [],
  templateUrl: './tech-stack.component.html',
  styleUrl: './tech-stack.component.css',
})
export class TechStackComponent {
  label = input.required<string>();
  techStack = input.required<string[]>();
}
