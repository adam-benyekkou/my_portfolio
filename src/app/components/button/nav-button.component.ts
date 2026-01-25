import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-button',
  standalone: true, // Move this to the top
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-button.html',
  styleUrl: './nav-button.css',
})
export class NavButtonComponent {
  label = input<string>('label');
  routerLink = input<string>('');
  btnClick = output<void>();

  handleClick() {
    this.btnClick.emit();
  }
}
