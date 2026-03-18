interface ToolbarProps {
  fileName: string | null;
  isSynced: boolean;
  onOpenFile: () => void;
  onNewMap: () => void;
  onSave: () => void;
  onFitView: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  hasFileHandle: boolean;
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
  hasFileHandle,
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
