// projects-list.component.ts
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { type Project } from '../../../shared/models/project.model';

@Component({
  selector: 'app-project-list',
  imports: [ProjectCardComponent],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  projects = input.required<Project[]>();
  caseStudyOpen = output<Project>();

  onCaseStudyOpen(project: Project): void {
    this.caseStudyOpen.emit(project);
  }
}
