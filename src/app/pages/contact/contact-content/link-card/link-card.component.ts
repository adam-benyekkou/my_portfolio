import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-link-card',
  imports: [],
  templateUrl: './link-card.component.html',
  styleUrl: './link-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkCardComponent {
  title = input.required<string>();
  contact_link = input.required<string>();
  description = input.required<string>();
}
