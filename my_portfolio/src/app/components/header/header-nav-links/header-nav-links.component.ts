import { Component } from '@angular/core';
import { NavButtonComponent } from '../../../components/button/nav-button.component';

@Component({
  selector: 'app-header-nav-links',
  imports: [NavButtonComponent],
  templateUrl: './header-nav-links.component.html',
  styleUrl: './header-nav-links.component.css',
})
export class HeaderNavLinksComponent {
  onClick() {
    console.log('click');
  }
}
