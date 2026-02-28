import React, { useState, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from '@xyflow/react';
import { MindMap } from './components/MindMap';
import { generateMindMap, expandNode } from './services/gemini';
import { Brain, Send, Loader2, Plus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const data = await generateMindMap(prompt);
      const root = data.root;
      
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Simple layout logic
      const addNodeAndChildren = (nodeData: any, x: number, y: number, level: number, parentId?: string) => {
        const id = nodeData.id || `node-${Math.random().toString(36).substr(2, 9)}`;
        newNodes.push({
          id,
          position: { x, y },
          data: { label: nodeData.label },
          type: 'custom',
        });

        if (parentId) {
          newEdges.push({
            id: `e-${parentId}-${id}`,
            source: parentId,
            target: id,
            animated: true,
          });
        }

        if (nodeData.children) {
          const childCount = nodeData.children.length;
          const spread = 300;
          nodeData.children.forEach((child: any, index: number) => {
            const childX = x + (index - (childCount - 1) / 2) * spread;
            const childY = y + 150;
            addNodeAndChildren(child, childX, childY, level + 1, id);
          });
        }
      };

      addNodeAndChildren(root, 0, 0, 0);
      
      setNodes(newNodes);
      setEdges(newEdges);
      setHasStarted(true);
    } catch (error) {
      console.error('Failed to generate mind map:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpand = async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Mark node as generating
    setNodes((nds) => 
      nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: true } } : n)
    );

    try {
      const children = await expandNode(node.data.label as string, prompt);
      
      const newNodes: Node[] = [...nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: false } } : n)];
      const newEdges: Edge[] = [...edges];

      const spread = 250;
      const childCount = children.length;

      children.forEach((child: any, index: number) => {
        const id = `node-${Math.random().toString(36).substr(2, 9)}`;
        const x = node.position.x + (index - (childCount - 1) / 2) * spread;
        const y = node.position.y + 150;

        newNodes.push({
          id,
          position: { x, y },
          data: { label: child.label },
          type: 'custom',
        });

        newEdges.push({
          id: `e-${nodeId}-${id}`,
          source: nodeId,
          target: id,
          animated: true,
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Failed to expand node:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-bottom border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">MindMap AI</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Intelligent Visualization</p>
          </div>
        </div>

        {hasStarted && (
          <form onSubmit={handleGenerate} className="flex-1 max-w-2xl mx-12 relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-slate-100 border-none rounded-2xl py-3 px-6 pr-12 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
          </form>
        )}

        <div className="flex items-center gap-4">
          {hasStarted && (
            <button 
              onClick={() => {
                setHasStarted(false);
                setNodes([]);
                setEdges([]);
                setPrompt('');
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              Reset
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Info size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <div className="max-w-xl w-full text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Visualize your <span className="text-indigo-600">thoughts</span> with AI.
                  </h2>
                  <p className="text-lg text-slate-600">
                    Transform a single prompt into a comprehensive mind map. Expand, explore, and organize your ideas effortlessly.
                  </p>
                </div>

                <form onSubmit={handleGenerate} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2 border border-slate-100">
                    <input
                      type="text"
                      autoFocus
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter a topic (e.g., 'Quantum Computing', 'Baking a Cake')"
                      className="flex-1 py-4 px-6 text-lg outline-none rounded-xl"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Brain size={20} />
                          <span>Generate Map</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="flex items-center justify-center gap-8 pt-8 text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium">Powered by Gemini</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-sm font-medium">Interactive Canvas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    <span className="text-sm font-medium">Infinite Expansion</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full"
            >
              <MindMap
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onExpand={handleExpand}
                onDelete={handleDelete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Loading Overlay */}
      {isLoading && hasStarted && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="font-semibold text-slate-700">AI is thinking...</p>
          </div>
        </div>
      )}
    </div>
  );
}
