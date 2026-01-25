import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-logo',
  imports: [RouterLink],
  templateUrl: './header-logo.component.html',
  styleUrl: './header-logo.component.css',
})
export class HeaderLogoComponent {
  routerLink = input<string>('');
}
