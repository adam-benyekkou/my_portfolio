import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnPersonalInfoComponent } from './column-personal-info/column-personal-info.component';
import { ColumnEducationInfoComponent } from './column-education-info/column-education-info.component';
import { ColumnProfessionalInfoComponent } from './column-professional-info/column-professional-info.component';


@Component({
  selector: 'app-operative-history',
  standalone: true,
  imports: [
    CommonModule,
    ColumnPersonalInfoComponent,
    ColumnEducationInfoComponent,
    ColumnProfessionalInfoComponent,
  ],
  templateUrl: './operative-history.component.html',
  styleUrl: './operative-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperativeHistoryComponent { }
