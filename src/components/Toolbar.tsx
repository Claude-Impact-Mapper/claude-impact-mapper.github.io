import type { MoscowPriority } from '../types';
import { MOSCOW_LABELS, MOSCOW_COLORS } from '../utils/treeUtils';

interface ToolbarProps {
  fileName: string | null;
  isSynced: boolean;
  onOpenFile: () => void;
  onNewMap: () => void;
  onSave: () => void;
  onFitView: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onShowHistory: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  hasFileHandle: boolean;
  moscowFilter: MoscowPriority | 'all';
  onMoscowFilterChange: (filter: MoscowPriority | 'all') => void;
}

export default function Toolbar({
  fileName,
  isSynced,
  onOpenFile,
  onNewMap,
  onSave,
  onFitView,
  onExpandAll,
  onCollapseAll,
  onShowHistory,
  onExportCsv,
  onExportExcel,
  hasFileHandle,
  moscowFilter,
  onMoscowFilterChange,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <span className="toolbar-title">Claude Impact Mapper</span>
        {fileName && (
          <span className="toolbar-filename">
            {fileName}
            <span className={`sync-dot ${isSynced ? 'synced' : 'unsynced'}`} />
          </span>
        )}
      </div>
      <div className="toolbar-right">
        <button className="btn" onClick={onOpenFile}>Open File</button>
        <button className="btn" onClick={onNewMap}>New Map</button>
        {hasFileHandle && (
          <>
            <button className="btn" onClick={onSave}>Save</button>
            <button className="btn" onClick={onShowHistory}>History</button>
            <button className="btn" onClick={onExportCsv}>Export CSV</button>
            <button className="btn" onClick={onExportExcel}>Export Excel</button>
            <div className="toolbar-divider" />
            <select
              className="btn moscow-filter"
              value={moscowFilter}
              onChange={(e) => onMoscowFilterChange(e.target.value as MoscowPriority | 'all')}
              style={{
                borderLeftWidth: 3,
                borderLeftColor: moscowFilter === 'all' ? '#3a3a4e' : MOSCOW_COLORS[moscowFilter],
              }}
            >
              <option value="all">All priorities</option>
              {(Object.keys(MOSCOW_LABELS) as MoscowPriority[]).map(key => (
                <option key={key} value={key}>{MOSCOW_LABELS[key]}</option>
              ))}
            </select>
            <div className="toolbar-divider" />
            <button className="btn" onClick={onFitView}>Fit View</button>
            <button className="btn" onClick={onExpandAll}>Expand All</button>
            <button className="btn" onClick={onCollapseAll}>Collapse All</button>
          </>
        )}
      </div>
    </div>
  );
}
