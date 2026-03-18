import { useRef, useEffect, useMemo } from 'react';
import { tree, hierarchy } from 'd3-hierarchy';
import { zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import 'd3-transition';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { ImpactMap, TreeNodeData } from '../types';
import { mapToHierarchy, type TreeNodeWithChildren } from '../utils/treeUtils';
import TreeNode from './TreeNode';
import TreeLink from './TreeLink';

interface ImpactMapCanvasProps {
  data: ImpactMap;
  selectedNodeId: string | null;
  onSelectNode: (node: HierarchyPointNode<TreeNodeData>) => void;
  onToggleCollapse: (nodeId: string) => void;
}

const NODE_SEP_X = 220;
const NODE_SEP_Y = 70;

export default function ImpactMapCanvas({
  data,
  selectedNodeId,
  onSelectNode,
  onToggleCollapse,
}: ImpactMapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ReturnType<typeof zoom<SVGSVGElement, unknown>> | null>(null);

  const layoutRoot = useMemo(() => {
    const root = hierarchy<TreeNodeWithChildren>(
      mapToHierarchy(data),
      d => d.children,
    );
    const treeLayout = tree<TreeNodeWithChildren>().nodeSize([NODE_SEP_Y, NODE_SEP_X]);
    return treeLayout(root);
  }, [data]);

  const nodes = useMemo(() => layoutRoot.descendants(), [layoutRoot]);
  const links = useMemo(() => layoutRoot.links(), [layoutRoot]);

  // Set up zoom
  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svg || !g) return;

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        select(g).attr('transform', event.transform.toString());
      });

    zoomRef.current = zoomBehavior;
    select(svg).call(zoomBehavior);

    // Initial centering
    const svgRect = svg.getBoundingClientRect();
    const initialTransform = zoomIdentity
      .translate(svgRect.width * 0.1, svgRect.height / 2)
      .scale(0.9);
    select(svg).call(zoomBehavior.transform, initialTransform);

    return () => {
      select(svg).on('.zoom', null);
    };
  }, []);

  const fitView = () => {
    const svg = svgRef.current;
    if (!svg || !zoomRef.current || nodes.length === 0) return;

    const svgRect = svg.getBoundingClientRect();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }

    const padding = 100;
    const treeW = maxY - minY + padding * 2;
    const treeH = maxX - minX + padding * 2;
    const scale = Math.min(svgRect.width / treeW, svgRect.height / treeH, 1.5);
    const tx = svgRect.width / 2 - ((minY + maxY) / 2) * scale;
    const ty = svgRect.height / 2 - ((minX + maxX) / 2) * scale;

    select(svg)
      .transition()
      .duration(500)
      .call(zoomRef.current.transform, zoomIdentity.translate(tx, ty).scale(scale));
  };

  // Expose fitView on the SVG element so the toolbar can call it
  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      (svg as unknown as Record<string, unknown>).__fitView = fitView;
    }
  });

  // Auto-fit when data changes (new file opened, external edit)
  useEffect(() => {
    // Small delay so layout has rendered
    const t = setTimeout(fitView, 100);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <svg
      ref={svgRef}
      className="impact-map-canvas"
      onClick={() => onSelectNode(null!)}
    >
      <g ref={gRef}>
        {links.map(link => (
          <TreeLink
            key={`${link.source.data.id}-${link.target.data.id}`}
            source={link.source as HierarchyPointNode<TreeNodeData>}
            target={link.target as HierarchyPointNode<TreeNodeData>}
          />
        ))}
        {nodes.map(node => (
          <TreeNode
            key={node.data.id}
            node={node as HierarchyPointNode<TreeNodeData>}
            isSelected={node.data.id === selectedNodeId}
            onSelect={n => onSelectNode(n)}
            onToggleCollapse={onToggleCollapse}
          />
        ))}
      </g>
    </svg>
  );
}
