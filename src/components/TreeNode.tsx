import type { HierarchyPointNode } from 'd3-hierarchy';
import type { TreeNodeData, NodeLevel } from '../types';
import { LEVEL_COLORS, MOSCOW_COLORS, MOSCOW_LABELS } from '../utils/treeUtils';
import type { MoscowPriority } from '../types';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 64;
const STATUS_ICONS: Record<string, string> = {
  planned: '○',
  'in-progress': '◐',
  done: '●',
  unplanned: '✕',
};

interface TreeNodeProps {
  node: HierarchyPointNode<TreeNodeData>;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (node: HierarchyPointNode<TreeNodeData>) => void;
  onToggleCollapse: (nodeId: string) => void;
}

function hasChildren(level: NodeLevel): boolean {
  return level !== 'deliverable';
}

export default function TreeNode({ node, isSelected, isDimmed, onSelect, onToggleCollapse }: TreeNodeProps) {
  const { data } = node;
  const color = LEVEL_COLORS[data.level];
  const halfW = NODE_WIDTH / 2;
  const halfH = NODE_HEIGHT / 2;
  const moscow = data.moscow as MoscowPriority | undefined;
  const moscowColor = moscow ? MOSCOW_COLORS[moscow] : undefined;

  return (
    <g
      transform={`translate(${node.y},${node.x})`}
      style={{ cursor: 'pointer' }}
      opacity={isDimmed ? 0.25 : 1}
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
        fontSize={11}
        fontWeight={500}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {data.status ? `${STATUS_ICONS[data.status] || ''} ` : ''}
        {data.text.length > 24 ? data.text.slice(0, 22) + '…' : data.text}
      </text>

      {/* MoSCoW priority badge */}
      {moscow && moscow !== 'unknown' && (
        <g>
          <rect
            x={-halfW + 4}
            y={halfH - 6}
            width={36}
            height={14}
            rx={4}
            fill={moscowColor}
            opacity={0.9}
          />
          <text
            x={-halfW + 22}
            y={halfH + 1}
            textAnchor="middle"
            dy="0.35em"
            fill="#fff"
            fontSize={7}
            fontWeight={700}
            style={{ pointerEvents: 'none', userSelect: 'none', textTransform: 'uppercase' }}
          >
            {MOSCOW_LABELS[moscow]}
          </text>
        </g>
      )}

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
