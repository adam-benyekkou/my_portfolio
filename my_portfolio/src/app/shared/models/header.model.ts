interface TextItem {
  readonly id: number;
  readonly text: string;
  readonly displayed: string;
  readonly isTyping: boolean;
  readonly isComplete: boolean;
}

export { type TextItem };
