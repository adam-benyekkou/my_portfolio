import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Adam Benyekkou | Creative Developer',
    loadComponent: () =>
      import('./pages/hero/hero.component').then((c) => c.HeroComponent),
  },

  {
    path: 'about',
    title: 'About | Adam Benyekkou',
    loadComponent: () =>
      import('./pages/about/about.component').then((c) => c.AboutComponent),
  },
  {
    path: 'contact',
    title: 'Contact | Adam Benyekkou',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (c) => c.ContactComponent,
      ),
  },
  {
    path: 'projects',
    title: 'Projects | Adam Benyekkou',
    loadComponent: () =>
      import('./pages/projects/projects.component').then(
        (c) => c.ProjectsComponent,
      ),
  },
  {
    path: 'experience',
    title: 'Experience | Adam Benyekkou',
    loadComponent: () =>
      import('./pages/experience/experience.component').then(
        (c) => c.ExperienceComponent,
      ),
  },
  { path: '**', redirectTo: '' }, // Wildcard route for 404 handling
];
