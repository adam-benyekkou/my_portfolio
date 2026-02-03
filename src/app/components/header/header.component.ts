import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderNavLinksComponent } from './header-nav-links/header-nav-links.component';
import { HeaderLogoComponent } from './header-logo/header-logo.component';
import { HeaderContactLinksComponent } from './header-contact-links/header-contact-links.component';
import { HeaderTextAnimateSectionComponent } from './header-text-animate-section/header-text-animate-section.component';

@Component({
  selector: 'app-header',
  imports: [
    HeaderNavLinksComponent,
    HeaderLogoComponent,
    HeaderContactLinksComponent,
    HeaderTextAnimateSectionComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent { }
