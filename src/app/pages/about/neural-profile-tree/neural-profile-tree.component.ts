import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeuralProfileTreeComponent {
  private readonly dataService = inject(DataService);

  // Configuration Schema
  private readonly TREE_CONFIG = {
    workstation: {
      development: {
        front: {
          linkedCell: 1,
          skills: ['React', 'Angular', 'Tailwind', 'Three.js'],
        },
        back: {
          linkedCell: 2,
          skills: [
            'Node.js (TypeScript)',
            'PHP (Laravel)',
            'Python (Django)',
            'Java (Spring)',
          ],
        },
      },
      infrastructure_ops: {
        orchestration_ci: {
          linkedCell: 3,
          skills: ['Docker', 'GitHub Actions', 'Terraform', 'Ansible'],
        },
        security_monitoring: {
          linkedCell: 4,
          skills: [
            'Prometheus',
            'Grafana',
            'Authentik',
            'Vault',
            'Backblaze B2',
          ],
        },
      },
      data: {
        linkedCell: 4,
        skills: ['PostgreSQL', 'MongoDB'],
      },
    },
  };

  // Default data for each cell when no specific node is hovered/selected
  public readonly CELL_DATA = {
    1: { title: 'Frontend Development', skills: ['React', 'Angular', 'Tailwind', 'Three.js'] },
    2: { title: 'Backend Development', skills: ['Node.js', 'PHP', 'Python', 'Java'] },
    3: { title: 'Orchestration & CI/CD', skills: ['Docker', 'GitHub Actions', 'Terraform', 'Ansible'] },
    4: { title: 'Security & Data', skills: ['Prometheus', 'Grafana', 'PostgreSQL', 'MongoDB'] }
  };


  // Internal tree state and interaction signals
  private treeState = signal<NeuralProfileNode[]>([]);
  public hoveredNodeId = signal<string | null>(null);
  public selectedNodeId = signal<string | null>(null);

  // Computes the currently active node details based on selection or hover
  // Computes the currently active node details based on selection or hover
  public activeNodeDetails = computed(() => {
    const selectedId = this.selectedNodeId();
    const hoveredId = this.hoveredNodeId();
    const targetId = hoveredId || selectedId;
    const nodes = this.treeState();

    // Helper to find node by ID
    const findNode = (nodes: NeuralProfileNode[], id: string): NeuralProfileNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (targetId) {
      return findNode(nodes, targetId);
    }
    return null;
  });

  // Computed flattened tree for rendering
  treeData = computed(() => this.flattenTreeWithVisibility(this.treeState()));

  constructor() {
    // Initialize tree data from config
    const nodes = this.transformConfigToNodes(this.TREE_CONFIG);
    this.treeState.set(nodes);
  }

  private transformConfigToNodes(config: typeof this.TREE_CONFIG): NeuralProfileNode[] {
    // Helper to create a node
    const createNode = (
      id: string,
      title: string,
      level: number,
      children: NeuralProfileNode[] = [],
      extras: Partial<NeuralProfileNode> = {}
    ): NeuralProfileNode => ({
      id,
      title,
      level,
      children,
      hasChildren: children.length > 0,
      isExpanded: true, // Default expanded
      isSelected: false,
      visible: true,
      ...extras
    });

    // Parse the config structure
    // Root: Workstation (Virtual root, we actually want distinct roots as per request)
    // But request says: "The tree is now divided into three primary roots: Development, Infrastructure, Data"

    // Development Root
    const devConfig = config.workstation.development;
    const devChildren: NeuralProfileNode[] = [
      createNode('front', 'Front', 1, [], {
        linkedCell: devConfig.front.linkedCell,
        skills: devConfig.front.skills
      }),
      createNode('back', 'Back', 1, [], {
        linkedCell: devConfig.back.linkedCell,
        skills: devConfig.back.skills
      })
    ];
    // Aggregation for Development Root
    const devRoot = createNode('development', 'Development', 0, devChildren, {
      linkedCell: 1, // Default to first cell or logic to show both?
      skills: [...devConfig.front.skills, ...devConfig.back.skills]
    });

    // Infrastructure Root
    const infraConfig = config.workstation.infrastructure_ops;
    const infraChildren: NeuralProfileNode[] = [
      createNode('orchestration_ci', 'Orchestration', 1, [], {
        linkedCell: infraConfig.orchestration_ci.linkedCell,
        skills: infraConfig.orchestration_ci.skills
      }),
      createNode('security_monitoring', 'Security', 1, [], {
        linkedCell: infraConfig.security_monitoring.linkedCell,
        skills: infraConfig.security_monitoring.skills
      })
    ];
    // Aggregation for Infrastructure Root
    const infraRoot = createNode('infrastructure_ops', 'Infrastructure', 0, infraChildren, {
      linkedCell: 3,
      skills: [...infraConfig.orchestration_ci.skills, ...infraConfig.security_monitoring.skills]
    });

    // Data Root (Direct mapping as per request logic, it shares Cell 4)
    const dataConfig = config.workstation.data;
    const dataRoot = createNode('data', 'Data', 0, [], {
      linkedCell: dataConfig.linkedCell,
      skills: dataConfig.skills
    });

    return [devRoot, infraRoot, dataRoot];
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

  getVisualState(cellId: number): 'normal' | 'selected' | 'hovered' {
    const selectedId = this.selectedNodeId();
    const hoveredId = this.hoveredNodeId();
    const targetId = hoveredId || selectedId;
    const nodes = this.treeState();

    const findNode = (nodes: NeuralProfileNode[], id: string): NeuralProfileNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (targetId) {
      const node = findNode(nodes, targetId);
      if (node?.linkedCell === cellId) {
        return hoveredId ? 'hovered' : 'selected';
      }
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
