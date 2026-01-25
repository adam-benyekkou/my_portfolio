import { Component } from '@angular/core';
import { SectionTitleComponent } from '../../components/section-title/section-title.component';
import { HoloVideoContainerComponent } from '../../components/holo-video-container/holo-video-container.component';
import { NeuralProfileTreeComponent } from './neural-profile-tree/neural-profile-tree.component';

@Component({
  selector: 'app-about',
  imports: [
    SectionTitleComponent,
    HoloVideoContainerComponent,
    NeuralProfileTreeComponent,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {}
