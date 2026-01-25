import { Component, inject, computed, OnInit } from '@angular/core';
import { DetailBlockComponent } from '../shared/detail-block/detail-block.component';
import { InfoCardComponent } from '../shared/info-card/info-card.component';
import { TechStackComponent } from '../tech-stack/tech-stack.component';
import { DataService } from '../../../../shared/services/data.service';

@Component({
  selector: 'app-column-education-info',
  imports: [DetailBlockComponent, InfoCardComponent, TechStackComponent],
  templateUrl: './column-education-info.component.html',
  styleUrl: './column-education-info.component.css',
})
export class ColumnEducationInfoComponent implements OnInit {
  readonly dataService = inject(DataService);

  ngOnInit(): void {
    this.dataService.loadEducations();
  }

  // Find the current training (status: 'current' or isCurrent: true)
  currentTraining = computed(() => {
    const educations = this.dataService.educations();
    console.log('Educations:', educations);

    if (educations.length === 0) {
      console.log('No educations loaded yet');
      return null;
    }

    const current = educations.find(
      (edu) => edu.status === 'current' || edu.isCurrent,
    );
    console.log('Current training:', current);
    return current || null;
  });
}
