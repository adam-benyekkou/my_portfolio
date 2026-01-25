import {
  Component,
  input,
  signal,
  computed,
  inject,
  effect,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { type NeuralProfileNode } from '../../../shared/models/about.model';
import { DataService } from '../../../shared/services/data.service';

@Component({
  selector: 'app-neural-profile-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neural-profile-tree.component.html',
  styleUrl: './neural-profile-tree.component.css',
})
export class NeuralProfileTreeComponent implements OnInit {
  private readonly dataService = inject(DataService);

  // Input for external data (optional override)
  externalData = input<NeuralProfileNode[]>([]);

  // Internal tree state and interaction signals
  private treeState = signal<NeuralProfileNode[]>([]);
  public hoveredNodeId = signal<string | null>(null);
  public selectedNodeId = signal<string | null>(null);

  // Computed flattened tree for rendering
  treeData = computed(() => this.flattenTreeWithVisibility(this.treeState()));

  // Computed to determine data source
  private dataSource = computed(() => {
    const external = this.externalData();
    const fromService = this.dataService.skills();

    console.log('External data:', external);
    console.log('Service data:', fromService);
    console.log(
      'Service data type:',
      Array.isArray(fromService) ? 'array' : typeof fromService,
    );

    // Use external data if provided, otherwise use service data
    let data = external.length > 0 ? external : fromService;

    // Ensure data is an array - if it's a single object, wrap it in an array
    if (data && !Array.isArray(data)) {
      console.log('Converting single object to array');
      data = [data];
    }

    // Ensure data is actually an array
    return Array.isArray(data) ? data : [];
  });

  constructor() {
    // Effect to update tree state when data source changes
    effect(() => {
      const data = this.dataSource();
      console.log('Neural profile data updated:', data);
      this.treeState.set(data);
    });
  }

  ngOnInit(): void {
    this.dataService.loadSkills();
    this.dataService.loadTraits(); // Also traits are used in personal info but skills used here
  }

  private flattenTreeWithVisibility(
    nodes: NeuralProfileNode[],
  ): NeuralProfileNode[] {
    const result: NeuralProfileNode[] = [];

    const traverse = (
      nodes: NeuralProfileNode[],
      parentVisible = true,
    ) => {
      for (const node of nodes) {
        // Node is visible if parent is visible
        node.visible = parentVisible;
        result.push(node);

        // Only traverse children if this node is expanded AND visible
        if (node.children) {
          const childrenVisible = parentVisible && node.isExpanded;
          traverse(node.children, childrenVisible);
        }
      }
    };

    traverse(nodes, true); // Root is always visible
    return result;
  }

  toggleExpand(node: NeuralProfileNode): void {
    if (node.hasChildren) {
      this.treeState.update((state) => {
        // Create a deep copy to avoid mutation issues
        const newState = JSON.parse(JSON.stringify(state));

        this.updateNodeInTree(newState, node.id, {
          isExpanded: !node.isExpanded,
        });

        return newState;
      });
    }
  }

  selectNode(node: NeuralProfileNode): void {
    // Simple selection - just update the selected state
    this.treeState.update((state) => {
      // Create a deep copy to avoid mutation issues
      const newState = JSON.parse(JSON.stringify(state));

      // Clear all selections
      this.clearAllSelections(newState);

      // Set current node as selected
      this.updateNodeInTree(newState, node.id, { isSelected: true });

      // Update selected node ID for visual representation
      this.selectedNodeId.set(node.id);

      return newState;
    });
  }

  // Handle chip cell hover
  hoverChipChild(childId: string): void {
    this.hoveredNodeId.set(childId);
  }

  selectToolChild(childId: string): void {
    // Find the node in the tree and select it
    this.treeState.update((state) => {
      const newState = JSON.parse(JSON.stringify(state));

      // Clear all selections first
      this.clearAllSelections(newState);

      // Find and select the specific child node
      this.updateNodeInTree(newState, childId, { isSelected: true });

      // Update the signal for visual state
      this.selectedNodeId.set(childId);

      return newState;
    });
  }

  hoverNode(node: NeuralProfileNode): void {
    this.hoveredNodeId.set(node.id);
  }

  clearHover(): void {
    this.hoveredNodeId.set(null);
  }

  getVisualState(sectionId: string): 'normal' | 'selected' | 'hovered' {
    const hoveredId = this.hoveredNodeId();
    const selectedId = this.selectedNodeId();

    // Map node IDs to their corresponding visual sections
    const nodeToSection: Record<string, string> = {
      workstation: 'workstation',
      tools: 'tools',
      webstorm: 'tools',
      git: 'tools',
      docker: 'tools',
      linux: 'tools',
      dev: 'dev',
      front: 'front',
      angular: 'front',
      tailwind: 'front',
      'html-css': 'front',
      back: 'back',
      nodejs: 'back',
      typescript: 'back',
      php: 'back',
      python: 'back',
      data: 'data',
      postgresql: 'data',
      mongodb: 'data',
    };

    // Check if any hovered node belongs to this section
    if (hoveredId && nodeToSection[hoveredId] === sectionId) {
      return 'hovered';
    }

    // Check if any selected node belongs to this section
    if (selectedId && nodeToSection[selectedId] === sectionId) {
      return 'selected';
    }

    return 'normal';
  }

  private updateNodeInTree(
    nodes: NeuralProfileNode[],
    id: string,
    updates: Partial<NeuralProfileNode>,
  ): boolean {
    for (const node of nodes) {
      if (node.id === id) {
        Object.assign(node, updates);
        return true;
      }
      if (node.children && this.updateNodeInTree(node.children, id, updates)) {
        return true;
      }
    }
    return false;
  }

  private clearAllSelections(nodes: NeuralProfileNode[]): void {
    for (const node of nodes) {
      node.isSelected = false;
      if (node.children) {
        this.clearAllSelections(node.children);
      }
    }
  }

  getIndentPadding(level: number): string {
    const paddingMap = {
      0: '0.5rem',
      1: '1.5rem',
      2: '2.5rem',
      3: '3.5rem',
    };
    return paddingMap[level as keyof typeof paddingMap] || '0.5rem';
  }

  isLastChild(node: NeuralProfileNode): boolean {
    // This would need parent context to determine if it's the last child
    // For now, we'll use the node title as a simple heuristic
    return (
      node.title.includes('MongoDB') ||
      node.title.includes('Docker') ||
      node.title.includes('HTML_CSS') ||
      node.title.includes('Python')
    );
  }
}
