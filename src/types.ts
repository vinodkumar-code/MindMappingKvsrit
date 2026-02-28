import { Node, Edge } from '@xyflow/react';

export interface MindMapNode extends Node {
  data: {
    label: string;
    isGenerating?: boolean;
  };
}

export interface MindMapEdge extends Edge {}

export interface AIResponseNode {
  id: string;
  label: string;
  children?: AIResponseNode[];
}

export interface AIResponse {
  nodes: AIResponseNode[];
}
