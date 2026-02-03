import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-detail-block',
  imports: [],
  templateUrl: './detail-block.component.html',
  styleUrl: './detail-block.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailBlockComponent {
  label = input<string>();
  value = input<string>();
}
