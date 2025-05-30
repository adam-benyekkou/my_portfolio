// operative-history.component.ts
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Experience {
  readonly id: string;
  readonly title: string;
  readonly classification: string;
  readonly objective: string;
  readonly timeline: string;
  readonly techStack: readonly string[];
  readonly status: 'current' | 'completed';
  readonly statusLabel: string;
  readonly isCurrent?: boolean;
}

@Component({
  selector: 'app-operative-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operative-history.component.html',
  styleUrl: './operative-history.component.css',
})
export class OperativeHistoryComponent {
  // Signals for reactive data
  private readonly _experiences = signal<readonly Experience[]>([
    {
      id: 'senior-specialist',
      title: 'PYTHON_API_SPECIALIST.EXE',
      classification: 'Python & Django API/RPA Specialist',
      objective:
        'Specialized in Python/Django development for API automation and RPA processes. Led technical interventions for complex enterprise HR system integrations, developing robust solutions that bridge business requirements with technical implementation.',
      timeline: 'UKG | January 2024 - January 2025',
      techStack: ['PYTHON', 'DJANGO', 'API', 'RPA'] as const,
      status: 'completed',
      statusLabel: 'ARCHIVED | SME_SPECIALIST',
    },
    {
      id: 'specialist-ii',
      title: 'SYSTEMS_INTEGRATION_SME.EXE',
      classification: 'Enterprise Systems Integration',
      objective:
        'Subject Matter Expert (SME) for enterprise HRSD connectors and system integrations. Specialized in complex technical challenges involving API development, RPA automation, and SFTP protocols. Provided BI support and data visualization solutions.',
      timeline: 'UKG | January 2023 - January 2024',
      techStack: ['PYTHON', 'DJANGO', 'API', 'RPA'] as const,
      status: 'completed',
      statusLabel: 'ARCHIVED | SME_SPECIALIST',
    },
    {
      id: 'specialist',
      title: 'SOLUTION_SUPPORT.EXE',
      classification: 'B2B Solution Support',
      objective:
        'Delivered high-level technical support for VIP business clients using HRSD solutions. Developed expertise in SaaS platforms and enterprise decision-making processes while managing critical client relationships.',
      timeline: 'UKG | October 2021 - January 2023',
      techStack: ['SAAS', 'HRSD', 'CLIENT_MGMT'] as const,
      status: 'completed',
      statusLabel: 'ARCHIVED | VIP_TIER',
    },
    {
      id: 'technician',
      title: 'IT_TECHNICIAN.EXE',
      classification: 'Information Technology Technician',
      objective:
        'Provided VIP end-user support, managed hardware/software deployments, and implemented networking and information security practices in a mission-critical environment.',
      timeline: 'Armée de Terre | July 2018 - December 2018',
      techStack: ['NETWORKING', 'SECURITY', 'DEPLOYMENT'] as const,
      status: 'completed',
      statusLabel: 'ARCHIVED | MILITARY',
    },
  ] as const);

  private readonly _currentTraining = signal<Experience>({
    id: 'developer-training',
    title: 'DEVELOPER_TRAINING.EXE',
    classification: "Concepteur Développeur d'Applications (RNCP Level BAC+4)",
    objective:
      'Intensive full-stack development program focusing on modern web technologies including TypeScript, Node.js, and contemporary development frameworks. Building comprehensive skills in both frontend and backend development.',
    timeline: "École O'clock | January 2025 - October 2025",
    techStack: [
      'TYPESCRIPT',
      'NODE.JS',
      'FULL_STACK',
      'WEB_FRAMEWORKS',
    ] as const,
    status: 'current',
    statusLabel: 'ACTIVE | IN_PROGRESS',
    isCurrent: true,
  } as const);

  private readonly _philosophyText = signal<readonly string[]>([
    'Four years navigating the intersection between human needs and machine logic has taught me that the most elegant code emerges from understanding both the technical substrate and the consciousness it serves. My journey through enterprise system matrices—from military-grade security protocols to corporate data synthesis—has prepared me for a world where the line between human intention and digital execution grows ever thinner.',
    'I approach development like a philosopher examining the nature of existence: with persistent curiosity and the understanding that every system, no matter how complex, serves a fundamentally human purpose. In a cyberpunk reality where APIs are neural pathways and databases are digital memories, I believe in crafting code that honors both computational efficiency and human dignity.',
    'The future belongs to those who can bridge the organic and the synthetic, who understand that behind every elegant algorithm lies a human story waiting to be told.',
  ] as const);

  private readonly _personalNote = signal<string>(
    'In the spaces between keystrokes and compiler runs, I contemplate the philosophical implications of our digital convergence. When not debugging the matrix, I tend to six small organic beings who remind me that even in our increasingly automated world, care and attention to living creatures remains profoundly important.',
  );

  // Public computed signals for template
  readonly experiences = this._experiences.asReadonly();
  readonly currentTraining = this._currentTraining.asReadonly();
  readonly philosophyText = this._philosophyText.asReadonly();
  readonly personalNote = this._personalNote.asReadonly();

  // Computed signals for derived data
  readonly totalExperience = computed(() => this.experiences().length);
  readonly currentTechStack = computed(() => [
    ...new Set(this.experiences().flatMap((exp) => exp.techStack)),
  ]);
}
