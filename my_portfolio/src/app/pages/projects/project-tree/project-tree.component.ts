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
    '├── WEB_APPLICATIONS/',
    '│   ├── portfolio_system.exe',
    '│   └── [CLASSIFIED].exe',
    '└── EXPERIMENTAL_PROJECTS/',
  ]);
}
