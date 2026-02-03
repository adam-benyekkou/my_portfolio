// project-footer.component.ts
import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { type Project } from '../../../shared/models/project.model';

@Component({
  selector: 'app-project-footer',
  standalone: true,
  templateUrl: './project-footer.component.html',
  styleUrl: './project-footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFooterComponent {
  // Signal input for projects array
  projects = input.required<Project[]>();

  // Computed signals for statistics
  totalProjects = computed(() => this.projects().length);

  activeProjects = computed(
    () =>
      this.projects().filter(
        (p) => !p.isRedacted && p.status === '[MISSION_ACTIVE]',
      ).length,
  );

  redactedProjects = computed(
    () => this.projects().filter((p) => p.isRedacted).length,
  );
}
