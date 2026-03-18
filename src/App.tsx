import { useState, useCallback, useRef, useEffect } from 'react';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { ImpactMap, TreeNodeData, NodeLevel } from './types';
import { useFileSync } from './hooks/useFileSync';
import { useLock } from './hooks/useLock';
import {
  updateNodeText,
  updateNodeNotes,
  updateDeliverableStatus,
  toggleCollapsed,
  setAllCollapsed,
  addChild,
  deleteNode,
  createEmptyMap,
} from './utils/mapOperations';
import ImpactMapCanvas from './components/ImpactMapCanvas';
import NodeEditor from './components/NodeEditor';
import Toolbar from './components/Toolbar';
import LockIndicator from './components/LockIndicator';
import './App.css';

export default function App() {
  const {
    data,
    setData,
    fileName,
    isSynced,
    openFile,
    saveFile,
    createNewFile,
    hasFileHandle,
  } = useFileSync();
  const { lockHolder, isLocked } = useLock();

  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const scheduleAutoSave = useCallback(
    (newData: ImpactMap) => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(() => {
        saveFile(newData);
      }, 500);
    },
    [saveFile]
  );

  const applyUpdate = useCallback(
    (updater: (map: ImpactMap) => ImpactMap) => {
      if (!data) return;
      const newData = updater(data);
      setData(newData);
      if (hasFileHandle) {
        scheduleAutoSave(newData);
      }
    },
    [data, setData, hasFileHandle, scheduleAutoSave]
  );

  const handleSelectNode = useCallback((node: HierarchyPointNode<TreeNodeData> | null) => {
    if (!node) {
      setSelectedNode(null);
      return;
    }
    setSelectedNode(node.data);
  }, []);

  const handleToggleCollapse = useCallback(
    (nodeId: string) => {
      applyUpdate(map => toggleCollapsed(map, nodeId));
    },
    [applyUpdate]
  );

  const handleUpdateText = useCallback(
    (id: string, text: string) => {
      applyUpdate(map => updateNodeText(map, id, text));
      setSelectedNode(prev => (prev && prev.id === id ? { ...prev, text } : prev));
    },
    [applyUpdate]
  );

  const handleUpdateNotes = useCallback(
    (id: string, notes: string) => {
      applyUpdate(map => updateNodeNotes(map, id, notes));
      setSelectedNode(prev => (prev && prev.id === id ? { ...prev, notes } : prev));
    },
    [applyUpdate]
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: 'planned' | 'in-progress' | 'done') => {
      applyUpdate(map => updateDeliverableStatus(map, id, status));
      setSelectedNode(prev => (prev && prev.id === id ? { ...prev, status } : prev));
    },
    [applyUpdate]
  );

  const handleAddChild = useCallback(
    (parentId: string, parentLevel: NodeLevel) => {
      applyUpdate(map => addChild(map, parentId, parentLevel));
    },
    [applyUpdate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      applyUpdate(map => deleteNode(map, id));
      setSelectedNode(null);
    },
    [applyUpdate]
  );

  const handleNewMap = useCallback(() => {
    const newMap = createEmptyMap();
    setData(newMap);
    setSelectedNode(null);
    createNewFile(newMap);
  }, [setData, createNewFile]);

  const handleFitView = useCallback(() => {
    const svg = document.querySelector('.impact-map-canvas') as SVGSVGElement | null;
    if (svg) {
      const fn = (svg as unknown as Record<string, unknown>).__fitView;
      if (typeof fn === 'function') fn();
    }
  }, []);

  const handleExpandAll = useCallback(() => {
    applyUpdate(map => setAllCollapsed(map, false));
  }, [applyUpdate]);

  const handleCollapseAll = useCallback(() => {
    applyUpdate(map => setAllCollapsed(map, true));
  }, [applyUpdate]);

  // Update selectedNode when data changes externally
  useEffect(() => {
    if (!selectedNode || !data) return;
    const findNode = (map: ImpactMap, id: string): TreeNodeData | null => {
      if (map.goal.id === id) {
        return { id: map.goal.id, text: map.goal.text, notes: map.goal.notes, level: 'goal', collapsed: map.goal.collapsed };
      }
      for (const actor of map.goal.actors) {
        if (actor.id === id) return { id: actor.id, text: actor.text, notes: actor.notes, level: 'actor', collapsed: actor.collapsed, parentId: map.goal.id };
        for (const impact of actor.impacts) {
          if (impact.id === id) return { id: impact.id, text: impact.text, notes: impact.notes, level: 'impact', collapsed: impact.collapsed, parentId: actor.id };
          for (const del of impact.deliverables) {
            if (del.id === id) return { id: del.id, text: del.text, notes: del.notes, level: 'deliverable', status: del.status, parentId: impact.id };
          }
        }
      }
      return null;
    };
    const updated = findNode(data, selectedNode.id);
    if (!updated) {
      setSelectedNode(null);
    }
  }, [data]);

  return (
    <div className="app">
      <Toolbar
        fileName={fileName}
        isSynced={isSynced}
        onOpenFile={openFile}
        onNewMap={handleNewMap}
        onSave={() => data && saveFile(data)}
        onFitView={handleFitView}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        hasFileHandle={hasFileHandle}
      />

      <LockIndicator lockHolder={lockHolder} isLocked={isLocked} />

      <div className="main-content">
        {data ? (
          <ImpactMapCanvas
            data={data}
            selectedNodeId={selectedNode?.id ?? null}
            onSelectNode={handleSelectNode}
            onToggleCollapse={handleToggleCollapse}
          />
        ) : (
          <div className="empty-state">
            <h2>Claude Impact Mapper</h2>
            <p>Open an existing impact-map.json file or create a new map to get started.</p>
            <div className="empty-state-actions">
              <button className="btn btn-primary" onClick={openFile}>
                Open File
              </button>
              <button className="btn" onClick={handleNewMap}>
                New Map
              </button>
            </div>
          </div>
        )}

        {selectedNode && (
          <NodeEditor
            node={selectedNode}
            onUpdateText={handleUpdateText}
            onUpdateNotes={handleUpdateNotes}
            onUpdateStatus={handleUpdateStatus}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
