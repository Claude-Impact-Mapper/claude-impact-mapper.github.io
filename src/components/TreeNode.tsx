import type { HierarchyPointNode } from 'd3-hierarchy';
import type { TreeNodeData, NodeLevel } from '../types';
import { LEVEL_COLORS } from '../utils/treeUtils';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 48;
const STATUS_ICONS: Record<string, string> = {
  planned: '○',
  'in-progress': '◐',
  done: '●',
};

interface TreeNodeProps {
  node: HierarchyPointNode<TreeNodeData>;
  isSelected: boolean;
  onSelect: (node: HierarchyPointNode<TreeNodeData>) => void;
  onToggleCollapse: (nodeId: string) => void;
}

function hasChildren(level: NodeLevel): boolean {
  return level !== 'deliverable';
}

export default function TreeNode({ node, isSelected, onSelect, onToggleCollapse }: TreeNodeProps) {
  const { data } = node;
  const color = LEVEL_COLORS[data.level];
  const halfW = NODE_WIDTH / 2;
  const halfH = NODE_HEIGHT / 2;

  return (
    <g
      transform={`translate(${node.y},${node.x})`}
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
      }}
    >
      <rect
        x={-halfW}
        y={-halfH}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        ry={8}
        fill={isSelected ? color : '#1e1e2e'}
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
      />
      <text
        textAnchor="middle"
        dy="0.35em"
        fill={isSelected ? '#fff' : '#e0e0e0'}
        fontSize={13}
        fontWeight={500}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {data.status ? `${STATUS_ICONS[data.status] || ''} ` : ''}
        {data.text.length > 18 ? data.text.slice(0, 16) + '…' : data.text}
      </text>

      {/* Collapse/expand toggle */}
      {hasChildren(data.level) && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(data.id);
          }}
        >
          <circle
            cx={halfW}
            cy={0}
            r={10}
            fill="#2a2a3e"
            stroke={color}
            strokeWidth={1.5}
          />
          <text
            x={halfW}
            y={0}
            textAnchor="middle"
            dy="0.35em"
            fill={color}
            fontSize={14}
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {data.collapsed ? '+' : '−'}
          </text>
        </g>
      )}
    </g>
  );
}

export { NODE_WIDTH, NODE_HEIGHT };
