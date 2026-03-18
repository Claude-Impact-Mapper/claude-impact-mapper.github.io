import type { HistoryEntry } from '../types';

interface GitHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  lastModified: string | undefined;
}

export default function GitHistory({ isOpen, onClose, history, lastModified }: GitHistoryProps) {
  if (!isOpen) return null;

  return (
    <div className="git-history-overlay" onClick={onClose}>
      <div className="git-history-panel" onClick={e => e.stopPropagation()}>
        <div className="git-history-header">
          <h3>Edit History</h3>
          <button className="node-editor-close" onClick={onClose}>✕</button>
        </div>

        {lastModified && (
          <div className="git-history-meta">
            <span className="build-time">
              Last modified: {new Date(lastModified).toLocaleString()}
            </span>
          </div>
        )}

        <div className="git-history-list">
          {history.length === 0 && (
            <p className="git-history-status">No history yet. Edits will be tracked here.</p>
          )}

          {history.map((entry, i) => (
            <div key={`${entry.timestamp}-${i}`} className="git-commit">
              <div className="git-commit-top">
                <span className={`git-author-badge ${entry.author === 'browser' ? 'author-browser' : 'author-external'}`}>
                  {entry.author}
                </span>
                <span className="git-commit-date">
                  {timeAgo(entry.timestamp)}
                </span>
              </div>
              <p className="git-commit-message">{entry.summary}</p>
              <span className="git-commit-sha">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
