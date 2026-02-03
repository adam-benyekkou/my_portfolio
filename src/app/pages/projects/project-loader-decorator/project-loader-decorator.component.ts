// project-loader-decorator.component.ts
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-project-loader-decorator',
  standalone: true,
  templateUrl: './project-loader-decorator.component.html',
  styleUrl: './project-loader-decorator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectLoaderDecoratorComponent {
  // Signal input for loading state
  isLoading = input.required<boolean>();
}
