import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Sparkles } from 'lucide-react';

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`
      relative px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[150px]
      ${selected 
        ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-4 ring-indigo-500/10' 
        : 'border-slate-200 bg-white hover:border-indigo-300 shadow-sm'}
    `}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-400 border-2 border-white" />
      
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-slate-800 leading-tight">
          {data.label as string}
        </span>
        {data.isGenerating && (
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase tracking-wider animate-pulse">
            <Sparkles size={10} />
            <span>AI Expanding...</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-400 border-2 border-white" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
