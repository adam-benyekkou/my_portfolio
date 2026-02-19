import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { HeaderSwitchThemeButtonComponent } from './header-switch-theme-button/header-switch-theme-button.component';

@Component({
  selector: 'app-header-contact-links',
  imports: [HeaderSwitchThemeButtonComponent],
  templateUrl: './header-contact-links.component.html',
  styleUrl: './header-contact-links.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderContactLinksComponent implements OnInit {
  isDarkMode = signal(false);


  ngOnInit(): void {
    // Check initial theme on load
    const theme = this.getCurrentTheme();
    this.isDarkMode.set(theme === 'dark');
    
    // Apply initial theme to body
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const nextTheme = this.isDarkMode() ? 'light' : 'dark';
    this.isDarkMode.set(nextTheme === 'dark');
    this.applyTheme(nextTheme);

    // Dispatch custom event for other components that might need to react
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: { theme: nextTheme },
      }),
    );
  }

  private applyTheme(theme: string): void {
    // Update body data attribute
    document.body.setAttribute('data-theme', theme);

    // Add/remove dark class from body for :host-context
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Store preference in localStorage
    localStorage.setItem('theme', theme);
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
