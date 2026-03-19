export type MoscowPriority = 'must' | 'should' | 'could' | 'wont' | 'unknown';

export interface Deliverable {
  id: string;
  text: string;
  notes: string;
  status: 'planned' | 'in-progress' | 'done' | 'unplanned';
  moscow: MoscowPriority;
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

export interface HistoryEntry {
  timestamp: string;
  author: string;
  summary: string;
}

export interface ImpactMap {
  version: number;
  title: string;
  goal: Goal;
  lastModified?: string;
  history?: HistoryEntry[];
}

export type NodeLevel = 'goal' | 'actor' | 'impact' | 'deliverable';

export interface TreeNodeData {
  id: string;
  text: string;
  notes: string;
  level: NodeLevel;
  collapsed?: boolean;
  status?: string;
  moscow?: MoscowPriority;
  parentId?: string;
}
