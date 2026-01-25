// project-loader-decorator.component.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-project-loader-decorator',
  standalone: true,
  templateUrl: './project-loader-decorator.component.html',
  styleUrl: './project-loader-decorator.component.css',
})
export class ProjectLoaderDecoratorComponent {
  // Signal input for loading state
  isLoading = input.required<boolean>();
}
