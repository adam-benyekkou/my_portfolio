import { Component, input } from '@angular/core';

@Component({
  selector: 'app-detail-block',
  imports: [],
  templateUrl: './detail-block.component.html',
  styleUrl: './detail-block.component.css',
})
export class DetailBlockComponent {
  label = input<string>();
  value = input<string>();
}
