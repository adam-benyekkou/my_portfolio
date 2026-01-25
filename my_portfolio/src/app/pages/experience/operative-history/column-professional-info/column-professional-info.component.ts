import { Component, inject, OnInit } from '@angular/core';
import { DetailBlockComponent } from '../shared/detail-block/detail-block.component';
import { TechStackComponent } from '../tech-stack/tech-stack.component';
import { DataService } from '../../../../shared/services/data.service';

@Component({
  selector: 'app-column-professional-info',
  imports: [DetailBlockComponent, TechStackComponent],
  templateUrl: './column-professional-info.component.html',
  styleUrl: './column-professional-info.component.css',
})
export class ColumnProfessionalInfoComponent implements OnInit {
  readonly dataService = inject(DataService);

  // Use experiences from DataService
  experiences = this.dataService.experiences;

  ngOnInit(): void {
    this.dataService.loadExperiences();
  }
}
