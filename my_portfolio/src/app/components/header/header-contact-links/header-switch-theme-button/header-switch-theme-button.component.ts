// header-switch-theme-nav-button.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-switch-theme-button',
  templateUrl: './header-switch-theme-button.component.html',
  styleUrls: ['./header-switch-theme-button.component.css'],
})
export class HeaderSwitchThemeButtonComponent implements OnInit {
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
