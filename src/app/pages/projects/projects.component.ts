// projects.component.ts
import { Component, signal, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { SectionTitleComponent } from '../../components/section-title/section-title.component';
import { type Project } from '../../shared/models/project.model';
import { ProjectTreeComponent } from './project-tree/project-tree.component';
import { ProjectModalComponent } from './project-modal/project-modal.component';
import { ProjectFooterComponent } from './project-footer/project-footer.component';
import { ProjectLoaderDecoratorComponent } from './project-loader-decorator/project-loader-decorator.component';
import { ProjectListComponent } from './projects-list/projects-list.component';
import { DataService } from '../../shared/services/data.service';

@Component({
  selector: 'app-projects',
  imports: [
    SectionTitleComponent,
    ProjectTreeComponent,
    ProjectModalComponent,
    ProjectFooterComponent,
    ProjectLoaderDecoratorComponent,
    ProjectListComponent,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit {
  private readonly dataService = inject(DataService);

  // Use data service signals directly
  projects = this.dataService.projects;

  // Component-specific signals
  selectedProject = signal<Project | null>(null);
  isLoading = signal(false);

  ngOnInit(): void {
    this.dataService.loadProjects();
    this.startLoadingAnimation();
  }

  private startLoadingAnimation(): void {
    this.isLoading.set(true);
    // Stop animation after 3 seconds
    setTimeout(() => {
      this.isLoading.set(false);
    }, 3000);
  }

  openCaseStudy(project: Project): void {
    this.selectedProject.set(project);
  }

  closeCaseStudy(): void {
    this.selectedProject.set(null);
  }
}
