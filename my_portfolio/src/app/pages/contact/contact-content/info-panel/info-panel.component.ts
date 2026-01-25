import { Component, input } from '@angular/core';

@Component({
  selector: 'app-info-panel',
  imports: [],
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.css',
})
export class InfoPanelComponent {
  title = input.required<string>();
  description = input.required<string>();
}
