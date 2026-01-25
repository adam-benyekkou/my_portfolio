import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-info-card',
  imports: [],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.css',
  encapsulation: ViewEncapsulation.None, // Add this line
})
export class InfoCardComponent {
  headerTitle = input.required<string>();
}
