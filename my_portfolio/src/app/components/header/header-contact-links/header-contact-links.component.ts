import { Component, OnInit } from '@angular/core';
import { HeaderSwitchThemeButtonComponent } from './header-switch-theme-button/header-switch-theme-button.component';

@Component({
  selector: 'app-header-contact-links',
  imports: [HeaderSwitchThemeButtonComponent],
  templateUrl: './header-contact-links.component.html',
  styleUrl: './header-contact-links.component.css',
})
export class HeaderContactLinksComponent implements OnInit {
  isDarkMode = false;


  ngOnInit(): void {
    // Check initial theme on load
    this.isDarkMode = this.getCurrentTheme() === 'dark';
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    // Update body data attribute
    document.body.setAttribute(
      'data-theme',
      this.isDarkMode ? 'dark' : 'light',
    );

    // Add/remove dark class from body for :host-context
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Store preference in localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');

    // Dispatch custom event for other components that might need to react
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: { theme: this.isDarkMode ? 'dark' : 'light' },
      }),
    );
  }

  /**
   * Get current theme from localStorage or system preference
   */
  private getCurrentTheme(): string {
    // First check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }

    // Fallback to system preference
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }

    return 'light';
  }
}
