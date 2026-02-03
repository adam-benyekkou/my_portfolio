import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SectionTitleComponent } from '../../components/section-title/section-title.component';
import { ContactContentComponent } from './contact-content/contact-content.component';

@Component({
  selector: 'app-contact',
  imports: [SectionTitleComponent, ContactContentComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent { }
