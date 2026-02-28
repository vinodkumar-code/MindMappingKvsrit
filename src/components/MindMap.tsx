import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Panel,
  Node,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sparkles, Plus, Trash2, Maximize2 } from 'lucide-react';
import { expandNode } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { CustomNode } from './CustomNode';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface MindMapProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onExpand: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

export const MindMap: React.FC<MindMapProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onExpand,
  onDelete,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.type === 'input') return '#0041d0';
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.type === 'input') return '#0041d0';
            return '#fff';
          }}
        />
        
        <AnimatePresence>
          {selectedNode && (
            <Panel position="bottom-center" className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex items-center gap-2"
              >
                <button
                  onClick={() => onExpand(selectedNode)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Sparkles size={18} />
                  <span>AI Expand</span>
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button
                  onClick={() => onDelete(selectedNode)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete Node"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            </Panel>
          )}
        </AnimatePresence>
      </ReactFlow>
    </div>
  );
};
