interface NeuralProfileNode {
  id: string;
  title: string;
  isExpanded: boolean;
  isSelected: boolean;
  children?: NeuralProfileNode[];
  level: number;
  hasChildren: boolean;
  visible: boolean;
  linkedCell?: number;
  skills?: string[];
}

export type { NeuralProfileNode };
