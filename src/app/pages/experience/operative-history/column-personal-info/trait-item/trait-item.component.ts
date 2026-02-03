import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-trait-item',
  imports: [],
  templateUrl: './trait-item.component.html',
  styleUrl: './trait-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraitItemComponent {
  traitvalue = input<string>();
}
