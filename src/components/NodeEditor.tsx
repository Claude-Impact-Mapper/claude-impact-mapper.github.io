import { useState, useEffect } from 'react';
import type { TreeNodeData, NodeLevel } from '../types';
import { LEVEL_COLORS, LEVEL_LABELS, CHILD_LEVEL } from '../utils/treeUtils';

interface NodeEditorProps {
  node: TreeNodeData;
  onUpdateText: (id: string, text: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateStatus: (id: string, status: 'planned' | 'in-progress' | 'done') => void;
  onAddChild: (parentId: string, parentLevel: NodeLevel) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function NodeEditor({
  node,
  onUpdateText,
  onUpdateNotes,
  onUpdateStatus,
  onAddChild,
  onDelete,
  onClose,
}: NodeEditorProps) {
  const [text, setText] = useState(node.text);
  const [notes, setNotes] = useState(node.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setText(node.text);
    setNotes(node.notes);
    setConfirmDelete(false);
  }, [node.id, node.text, node.notes]);

  const color = LEVEL_COLORS[node.level];
  const childLevel = CHILD_LEVEL[node.level];

  return (
    <div className="node-editor">
      <div className="node-editor-header" style={{ borderColor: color }}>
        <span className="node-editor-level" style={{ color }}>
          {LEVEL_LABELS[node.level]}
        </span>
        <button className="node-editor-close" onClick={onClose}>✕</button>
      </div>

      <label>
        Text
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onUpdateText(node.id, e.target.value);
          }}
        />
      </label>

      <label>
        Notes
        <textarea
          value={notes}
          rows={4}
          onChange={(e) => {
            setNotes(e.target.value);
            onUpdateNotes(node.id, e.target.value);
          }}
        />
      </label>

      {node.level === 'deliverable' && (
        <label>
          Status
          <select
            value={node.status || 'planned'}
            onChange={(e) =>
              onUpdateStatus(node.id, e.target.value as 'planned' | 'in-progress' | 'done')
            }
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      )}

      <div className="node-editor-actions">
        {childLevel && (
          <button
            className="btn btn-add"
            onClick={() => onAddChild(node.id, node.level)}
          >
            + Add {LEVEL_LABELS[childLevel]}
          </button>
        )}

        {node.level !== 'goal' && (
          <>
            {confirmDelete ? (
              <div className="delete-confirm">
                <span>Delete this {LEVEL_LABELS[node.level].toLowerCase()}?</span>
                <button className="btn btn-danger" onClick={() => onDelete(node.id)}>
                  Yes, delete
                </button>
                <button className="btn" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="btn btn-danger"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
