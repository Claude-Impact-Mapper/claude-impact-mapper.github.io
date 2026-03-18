import { linkHorizontal } from 'd3-shape';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { TreeNodeData } from '../types';
import { LEVEL_COLORS } from '../utils/treeUtils';
import { NODE_WIDTH } from './TreeNode';

interface TreeLinkProps {
  source: HierarchyPointNode<TreeNodeData>;
  target: HierarchyPointNode<TreeNodeData>;
}

const linkGenerator = linkHorizontal<unknown, { x: number; y: number }>()
  .x(d => d.y)
  .y(d => d.x);

export default function TreeLink({ source, target }: TreeLinkProps) {
  const halfW = NODE_WIDTH / 2;

  const path = linkGenerator({
    source: { x: source.x, y: source.y + halfW + 10 },
    target: { x: target.x, y: target.y - halfW },
  });

  if (!path) return null;

  return (
    <path
      d={path}
      fill="none"
      stroke={LEVEL_COLORS[target.data.level]}
      strokeWidth={1.5}
      strokeOpacity={0.5}
    />
  );
}
