import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-project-tree',
  imports: [],
  templateUrl: './project-tree.component.html',
  styleUrl: './project-tree.component.css',
})
export class ProjectTreeComponent {
  directoryLines = signal([
    'EXECUTE//DIRECTORY/',
    '├── INFRASTRUCTURE/',
    '│   ├── homelab_infra.exe',
    '│   └── cavydev_blog.exe',
    '├── WEB_APPLICATIONS/',
    '│   ├── greenroots_ecom.exe',
    '│   ├── mobility_web.exe',
    '│   ├── portfolio_system.exe',
    '│   └── [CLASSIFIED].exe',
    '└── EXPERIMENTAL_PROJECTS/',
  ]);
}
