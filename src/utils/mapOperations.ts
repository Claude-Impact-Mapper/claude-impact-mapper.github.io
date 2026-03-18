import type { ImpactMap, Actor, Impact, Deliverable, NodeLevel, MoscowPriority } from '../types';
import { generateId } from './idGenerator';

type DeepMutable<T> = { -readonly [P in keyof T]: DeepMutable<T[P]> };

function cloneMap(map: ImpactMap): DeepMutable<ImpactMap> {
  return JSON.parse(JSON.stringify(map));
}

export function updateNodeText(map: ImpactMap, nodeId: string, text: string): ImpactMap {
  const m = cloneMap(map);
  if (m.goal.id === nodeId) {
    m.goal.text = text;
    return m;
  }
  for (const actor of m.goal.actors) {
    if (actor.id === nodeId) { actor.text = text; return m; }
    for (const impact of actor.impacts) {
      if (impact.id === nodeId) { impact.text = text; return m; }
      for (const del of impact.deliverables) {
        if (del.id === nodeId) { del.text = text; return m; }
      }
    }
  }
  return m;
}

export function updateNodeNotes(map: ImpactMap, nodeId: string, notes: string): ImpactMap {
  const m = cloneMap(map);
  if (m.goal.id === nodeId) {
    m.goal.notes = notes;
    return m;
  }
  for (const actor of m.goal.actors) {
    if (actor.id === nodeId) { actor.notes = notes; return m; }
    for (const impact of actor.impacts) {
      if (impact.id === nodeId) { impact.notes = notes; return m; }
      for (const del of impact.deliverables) {
        if (del.id === nodeId) { del.notes = notes; return m; }
      }
    }
  }
  return m;
}

export function updateDeliverableStatus(
  map: ImpactMap,
  nodeId: string,
  status: 'planned' | 'in-progress' | 'done'
): ImpactMap {
  const m = cloneMap(map);
  for (const actor of m.goal.actors) {
    for (const impact of actor.impacts) {
      for (const del of impact.deliverables) {
        if (del.id === nodeId) { del.status = status; return m; }
      }
    }
  }
  return m;
}

export function updateDeliverableMoscow(
  map: ImpactMap,
  nodeId: string,
  moscow: MoscowPriority
): ImpactMap {
  const m = cloneMap(map);
  for (const actor of m.goal.actors) {
    for (const impact of actor.impacts) {
      for (const del of impact.deliverables) {
        if (del.id === nodeId) { del.moscow = moscow; return m; }
      }
    }
  }
  return m;
}

export function toggleCollapsed(map: ImpactMap, nodeId: string): ImpactMap {
  const m = cloneMap(map);
  if (m.goal.id === nodeId) {
    m.goal.collapsed = !m.goal.collapsed;
    return m;
  }
  for (const actor of m.goal.actors) {
    if (actor.id === nodeId) { actor.collapsed = !actor.collapsed; return m; }
    for (const impact of actor.impacts) {
      if (impact.id === nodeId) { impact.collapsed = !impact.collapsed; return m; }
    }
  }
  return m;
}

export function setAllCollapsed(map: ImpactMap, collapsed: boolean): ImpactMap {
  const m = cloneMap(map);
  m.goal.collapsed = collapsed;
  for (const actor of m.goal.actors) {
    actor.collapsed = collapsed;
    for (const impact of actor.impacts) {
      impact.collapsed = collapsed;
    }
  }
  return m;
}

export function addChild(map: ImpactMap, parentId: string, parentLevel: NodeLevel): ImpactMap {
  const m = cloneMap(map);

  if (parentLevel === 'goal' && m.goal.id === parentId) {
    const newActor: Actor = {
      id: generateId('actor'),
      text: 'New actor',
      notes: '',
      collapsed: false,
      impacts: [],
    };
    m.goal.actors.push(newActor);
    return m;
  }

  for (const actor of m.goal.actors) {
    if (parentLevel === 'actor' && actor.id === parentId) {
      const newImpact: Impact = {
        id: generateId('impact'),
        text: 'New impact',
        notes: '',
        collapsed: false,
        deliverables: [],
      };
      actor.impacts.push(newImpact);
      return m;
    }

    for (const impact of actor.impacts) {
      if (parentLevel === 'impact' && impact.id === parentId) {
        const newDel: Deliverable = {
          id: generateId('del'),
          text: 'New deliverable',
          notes: '',
          status: 'planned',
          moscow: 'unknown',
        };
        impact.deliverables.push(newDel);
        return m;
      }
    }
  }

  return m;
}

export function deleteNode(map: ImpactMap, nodeId: string): ImpactMap {
  const m = cloneMap(map);

  // Cannot delete the goal
  if (m.goal.id === nodeId) return m;

  m.goal.actors = m.goal.actors.filter(actor => {
    if (actor.id === nodeId) return false;
    actor.impacts = actor.impacts.filter(impact => {
      if (impact.id === nodeId) return false;
      impact.deliverables = impact.deliverables.filter(del => del.id !== nodeId);
      return true;
    });
    return true;
  });

  return m;
}

export function createEmptyMap(): ImpactMap {
  return {
    version: 1,
    title: 'New Impact Map',
    goal: {
      id: generateId('goal'),
      text: 'Your goal here',
      notes: '',
      collapsed: false,
      actors: [],
    },
  };
}
