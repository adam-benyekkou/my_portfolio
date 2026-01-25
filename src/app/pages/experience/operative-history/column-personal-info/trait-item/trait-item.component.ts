import { Component, input } from '@angular/core';

@Component({
  selector: 'app-trait-item',
  imports: [],
  templateUrl: './trait-item.component.html',
  styleUrl: './trait-item.component.css',
})
export class TraitItemComponent {
  traitvalue = input<string>();
}
