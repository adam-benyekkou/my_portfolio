import { Component } from '@angular/core';
import { InfoPanelComponent } from './info-panel/info-panel.component';
import { LinkCardComponent } from './link-card/link-card.component';

@Component({
  selector: 'app-contact-content',
  imports: [InfoPanelComponent, LinkCardComponent],
  templateUrl: './contact-content.component.html',
  styleUrl: './contact-content.component.css',
})
export class ContactContentComponent {}
