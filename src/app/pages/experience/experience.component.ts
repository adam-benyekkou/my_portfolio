import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SectionTitleComponent } from '../../components/section-title/section-title.component';
import { OperativeHistoryComponent } from './operative-history/operative-history.component';

@Component({
  selector: 'app-experience',
  imports: [SectionTitleComponent, OperativeHistoryComponent],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent { }
