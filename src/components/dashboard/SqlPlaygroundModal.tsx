import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api-client';
import {
  Database,
  Play,
  RotateCw,
  X,
  Trash2,
  Copy,
  Check,
  Table as TableIcon,
  Clock,
  History,
  Code2,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import Editor from '@monaco-editor/react';

interface SqlPlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface SqlTableColumn {
  name: string;
  type: string;
}

interface SqlTableSchema {
  tableName: string;
  columns: SqlTableColumn[];
}

interface QueryHistoryItem {
  query_id: string;
  project_id: string;
  query: string;
  status: 'success' | 'error';
  rows: number;
  duration_ms: number;
  created_at: string;
}

export const SqlPlaygroundModal: React.FC<SqlPlaygroundModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [query, setQuery] = useState(`-- BILZX CODEX — SQL Playground
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  role TEXT DEFAULT 'Developer'
);

INSERT INTO users (name, age, role) VALUES
  ('Bilal', 13, 'Creator'),
  ('BilzxDev', 21, 'Lead Architect'),
  ('Alex', 19, 'Frontend Engineer');

SELECT * FROM users;`);

  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'schema'>('editor');
  const [isRunning, setIsRunning] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [executionStats, setExecutionStats] = useState<{
    rowCount: number;
    durationMs: number;
    commandType: string;
    truncated: boolean;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [schema, setSchema] = useState<SqlTableSchema[]>([]);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const data = await apiRequest<{ history: QueryHistoryItem[] }>('/api/sql/history', {
        query: { projectId },
        timeoutMs: 15000,
      });
      setHistory(data.history || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleRunSql = async (queryToRun?: string) => {
    const sql = queryToRun || query;
    if (!sql.trim() || isRunning) return;

    setIsRunning(true);
    setErrorMessage(null);

    try {
      const data = await apiRequest<{
        columns: string[];
        rows: any[][];
        rowCount: number;
        durationMs: number;
        commandType: string;
        truncated: boolean;
        schema?: SqlTableSchema[];
      }>('/api/sql/query', {
        method: 'POST',
        body: { query: sql, projectId },
        timeoutMs: 30000,
      });

      setColumns(data.columns || []);
      setRows(data.rows || []);
      setExecutionStats({
        rowCount: data.rowCount,
        durationMs: data.durationMs,
        commandType: data.commandType,
        truncated: data.truncated,
      });
      if (data.schema) {
        setSchema(data.schema);
      }
      fetchHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error running SQL query');
      setColumns([]);
      setRows([]);
      setExecutionStats(null);
      fetchHistory();
    } finally {
      setIsRunning(false);
    }
  };

  const handleFormatSql = () => {
    // Basic SQL formatter
    const formatted = query
      .replace(/\s+/g, ' ')
      .replace(/\s*;\s*/g, ';\n\n')
      .replace(/\b(SELECT|FROM|WHERE|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE TABLE|ALTER TABLE|JOIN|LEFT JOIN|GROUP BY|ORDER BY|LIMIT)\b/gi, (m) => `\n${m.toUpperCase()} `)
      .trim();
    setQuery(formatted);
  };

  const handleClearSql = () => {
    setQuery('');
    setColumns([]);
    setRows([]);
    setExecutionStats(null);
    setErrorMessage(null);
  };

  const handleCopyHistory = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-white border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#18181B] text-white p-3.5 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#2563EB] border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base leading-none">SQL Online Playground</h3>
                <span className="font-mono text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 border border-emerald-500">
                  SQLite Engine
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Isolated Session Database: <span className="text-zinc-200">{projectId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex border border-zinc-700 bg-zinc-900 rounded-xs text-xs font-bold text-zinc-300 overflow-hidden">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 cursor-pointer ${
                  activeTab === 'editor' ? 'bg-[#2563EB] text-white font-black' : 'hover:bg-zinc-800'
                }`}
              >
                Query & Results
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1 cursor-pointer ${
                  activeTab === 'schema' ? 'bg-[#2563EB] text-white font-black' : 'hover:bg-zinc-800'
                }`}
              >
                Schema Viewer ({schema.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 cursor-pointer ${
                  activeTab === 'history' ? 'bg-[#2563EB] text-white font-black' : 'hover:bg-zinc-800'
                }`}
              >
                Query History ({history.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Editor & Results Table */}
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* SQL Editor Area (Height ~ 190px) */}
            <div className="h-48 border-b-2 border-black relative">
              <Editor
                height="100%"
                language="sql"
                value={query}
                onChange={(val) => setQuery(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Action Bar */}
            <div className="bg-[#DBEAFE] border-b-2 border-black px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRunSql()}
                  disabled={isRunning}
                  className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-gray-400 text-white font-black text-xs px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                >
                  {isRunning ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run SQL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleFormatSql}
                  className="bg-white hover:bg-gray-100 font-bold text-xs px-2.5 py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer"
                  title="Format SQL"
                >
                  Format
                </button>

                <button
                  onClick={handleClearSql}
                  className="bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs px-2.5 py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer"
                  title="Clear Query"
                >
                  Clear
                </button>
              </div>

              {executionStats && (
                <div className="flex items-center space-x-3 text-xs font-mono font-bold text-[#1D4ED8]">
                  <span>Command: {executionStats.commandType}</span>
                  <span>{executionStats.rowCount} baris</span>
                  <span>{executionStats.durationMs}ms</span>
                </div>
              )}
            </div>

            {/* Result Area */}
            <div className="flex-1 overflow-auto p-3 bg-gray-50 min-h-0">
              {errorMessage && (
                <div className="p-3 bg-rose-100 border-2 border-black text-rose-900 font-mono text-xs shadow-[2px_2px_0px_#000] mb-3">
                  <strong>SQL Error:</strong> {errorMessage}
                </div>
              )}

              {columns.length > 0 && rows.length > 0 ? (
                <div className="border-2 border-black bg-white shadow-[3px_3px_0px_#000] overflow-auto max-h-60">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead className="bg-[#18181B] text-white sticky top-0">
                      <tr>
                        {columns.map((col, idx) => (
                          <th key={idx} className="p-2 border-b-2 border-r border-black font-black uppercase">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-blue-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-gray-200 whitespace-nowrap">
                              {cell === null ? (
                                <span className="text-gray-400 italic">NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : !errorMessage && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8 text-center">
                  <TableIcon className="w-8 h-8 mb-2 opacity-40" />
                  <p className="font-black text-xs text-[#18181B]">Belum ada output tabel</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tulis query SQL di atas dan tekan <strong>Run SQL</strong> untuk mengeksekusi.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Schema Viewer */}
        {activeTab === 'schema' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between pb-2 border-b border-gray-300">
              <span className="font-black text-xs uppercase text-gray-700">
                Struktur Tabel Database Sesi ({schema.length} Tabel Terdeteksi)
              </span>
              <button
                onClick={() => handleRunSql('SELECT 1;')}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                Refresh Schema
              </button>
            </div>

            {schema.length === 0 ? (
              <div className="text-center py-10 bg-white border-2 border-dashed border-gray-300 p-6">
                <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-black text-sm text-[#18181B]">Belum ada tabel yang dibuat</p>
                <p className="text-xs text-gray-500 mt-1">
                  Jalankan perintah <code>CREATE TABLE ...</code> di tab Query untuk membuat tabel.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schema.map((tbl) => (
                  <div key={tbl.tableName} className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0px_#000]">
                    <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-gray-200">
                      <TableIcon className="w-4 h-4 text-[#2563EB]" />
                      <span className="font-mono font-black text-sm text-[#18181B]">{tbl.tableName}</span>
                    </div>
                    <div className="space-y-1">
                      {tbl.columns.map((c, i) => (
                        <div key={i} className="flex justify-between font-mono text-xs py-0.5">
                          <span className="text-gray-800">{c.name}</span>
                          <span className="text-gray-400 font-bold uppercase">{c.type}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setQuery(`SELECT * FROM ${tbl.tableName} LIMIT 50;`);
                        setActiveTab('editor');
                        handleRunSql(`SELECT * FROM ${tbl.tableName} LIMIT 50;`);
                      }}
                      className="mt-3 w-full text-center bg-gray-100 hover:bg-gray-200 text-xs font-bold py-1 border border-black cursor-pointer"
                    >
                      SELECT * FROM {tbl.tableName}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Query History */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <span className="font-black text-xs uppercase text-gray-700 block pb-1 border-b border-gray-300">
              Riwayat Eksekusi SQL Sesi Ini
            </span>

            {history.length === 0 ? (
              <div className="text-center py-10 bg-white border-2 border-dashed border-gray-300 p-6">
                <History className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-black text-sm text-[#18181B]">Belum ada riwayat query tersimpan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.query_id}
                    className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <pre className="font-mono text-xs text-gray-900 truncate whitespace-pre">
                        {item.query}
                      </pre>
                      <div className="flex items-center space-x-3 text-[10px] font-mono text-gray-500 mt-1">
                        <span className={item.status === 'success' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {item.status.toUpperCase()}
                        </span>
                        <span>{item.rows} rows</span>
                        <span>{item.duration_ms}ms</span>
                        <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyHistory(item.query, item.query_id)}
                        className="p-1 hover:bg-gray-100 border border-black bg-white cursor-pointer"
                        title="Salin Query"
                      >
                        {copiedIndex === item.query_id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setQuery(item.query);
                          setActiveTab('editor');
                          handleRunSql(item.query);
                        }}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black px-2.5 py-1 border border-black cursor-pointer"
                      >
                        Run Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#F3F4F6] border-t-2 border-black p-3 flex justify-between items-center shrink-0">
          <span className="text-[11px] font-mono text-gray-500">
            Maks. 1.000 baris output • Database terisolasi aman
          </span>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 font-black text-xs px-4 py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
