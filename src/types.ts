export interface Deliverable {
  id: string;
  text: string;
  notes: string;
  status: 'planned' | 'in-progress' | 'done';
}

export interface Impact {
  id: string;
  text: string;
  notes: string;
  collapsed: boolean;
  deliverables: Deliverable[];
}

export interface Actor {
  id: string;
  text: string;
  notes: string;
  collapsed: boolean;
  impacts: Impact[];
}

export interface Goal {
  id: string;
  text: string;
  notes: string;
  collapsed: boolean;
  actors: Actor[];
}

export interface ImpactMap {
  version: number;
  title: string;
  goal: Goal;
}

export type NodeLevel = 'goal' | 'actor' | 'impact' | 'deliverable';

export interface TreeNodeData {
  id: string;
  text: string;
  notes: string;
  level: NodeLevel;
  collapsed?: boolean;
  status?: string;
  parentId?: string;
}
