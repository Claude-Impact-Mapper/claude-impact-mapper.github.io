import type { ImpactMap, TreeNodeData, NodeLevel } from '../types';

export interface TreeNodeWithChildren extends TreeNodeData {
  children?: TreeNodeWithChildren[];
}

export function mapToHierarchy(map: ImpactMap): TreeNodeWithChildren {
  const goal = map.goal;

  return {
    id: goal.id,
    text: goal.text,
    notes: goal.notes,
    level: 'goal' as NodeLevel,
    collapsed: goal.collapsed,
    children: goal.collapsed
      ? undefined
      : goal.actors.map(actor => ({
          id: actor.id,
          text: actor.text,
          notes: actor.notes,
          level: 'actor' as NodeLevel,
          collapsed: actor.collapsed,
          parentId: goal.id,
          children: actor.collapsed
            ? undefined
            : actor.impacts.map(impact => ({
                id: impact.id,
                text: impact.text,
                notes: impact.notes,
                level: 'impact' as NodeLevel,
                collapsed: impact.collapsed,
                parentId: actor.id,
                children: impact.collapsed
                  ? undefined
                  : impact.deliverables.map(del => ({
                      id: del.id,
                      text: del.text,
                      notes: del.notes,
                      level: 'deliverable' as NodeLevel,
                      status: del.status,
                      parentId: impact.id,
                    })),
              })),
        })),
  };
}

export const LEVEL_COLORS: Record<NodeLevel, string> = {
  goal: '#3b82f6',
  actor: '#22c55e',
  impact: '#f97316',
  deliverable: '#a855f7',
};

export const LEVEL_LABELS: Record<NodeLevel, string> = {
  goal: 'Goal',
  actor: 'Actor',
  impact: 'Impact',
  deliverable: 'Deliverable',
};

export const CHILD_LEVEL: Partial<Record<NodeLevel, NodeLevel>> = {
  goal: 'actor',
  actor: 'impact',
  impact: 'deliverable',
};
