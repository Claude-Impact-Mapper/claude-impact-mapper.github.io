import type { ImpactMap } from '../types';
import { MOSCOW_LABELS } from './treeUtils';

interface ExportRow {
  actor: string;
  impact: string;
  deliverable: string;
  status: string;
  priority: string;
  notes: string;
}

function flattenMap(map: ImpactMap): ExportRow[] {
  const rows: ExportRow[] = [];
  for (const actor of map.goal.actors) {
    for (const impact of actor.impacts) {
      if (impact.deliverables.length === 0) {
        rows.push({
          actor: actor.text,
          impact: impact.text,
          deliverable: '',
          status: '',
          priority: '',
          notes: impact.notes,
        });
      }
      for (const del of impact.deliverables) {
        rows.push({
          actor: actor.text,
          impact: impact.text,
          deliverable: del.text,
          status: del.status,
          priority: MOSCOW_LABELS[del.moscow || 'unknown'],
          notes: del.notes,
        });
      }
    }
  }
  return rows;
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(rows: ExportRow[]): string {
  const header = 'Actor,Impact,Deliverable,Status,Priority,Notes';
  const lines = rows.map(r =>
    [r.actor, r.impact, r.deliverable, r.status, r.priority, r.notes]
      .map(escapeCsv)
      .join(',')
  );
  return [header, ...lines].join('\n');
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toExcelHtml(map: ImpactMap, rows: ExportRow[]): string {
  const headerRow = '<tr><th>Actor</th><th>Impact</th><th>Deliverable</th><th>Status</th><th>Priority</th><th>Notes</th></tr>';
  const dataRows = rows.map(r =>
    `<tr>${[r.actor, r.impact, r.deliverable, r.status, r.priority, r.notes].map(v => `<td>${escapeHtml(v)}</td>`).join('')}</tr>`
  ).join('\n');

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="utf-8"></head>
<body>
<h2>${escapeHtml(map.goal.text)}</h2>
<table border="1">
${headerRow}
${dataRows}
</table>
</body>
</html>`;
}

function timestamp(): string {
  const d = new Date();
  return d.toISOString().replace(/[:T]/g, '-').replace(/\..+/, '');
}

async function saveBlob(
  blob: Blob,
  suggestedName: string,
  description: string,
  accept: Record<string, string[]>,
  startIn?: FileSystemFileHandle,
) {
  const opts: SaveFilePickerOptions = {
    suggestedName,
    types: [{ description, accept }],
  };
  if (startIn) {
    (opts as Record<string, unknown>).startIn = startIn;
  }
  const handle = await window.showSaveFilePicker(opts);
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function exportCsv(map: ImpactMap, fileHandle?: FileSystemFileHandle | null) {
  const rows = flattenMap(map);
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const name = `impact-map-${timestamp()}.csv`;
  await saveBlob(blob, name, 'CSV File', { 'text/csv': ['.csv'] }, fileHandle ?? undefined);
}

export async function exportExcel(map: ImpactMap, fileHandle?: FileSystemFileHandle | null) {
  const rows = flattenMap(map);
  const html = toExcelHtml(map, rows);
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const name = `impact-map-${timestamp()}.xls`;
  await saveBlob(blob, name, 'Excel File', { 'application/vnd.ms-excel': ['.xls'] }, fileHandle ?? undefined);
}
