import React, { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { ProjectFile, EditorSettings } from '../../types';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  file: ProjectFile | null;
  settings: EditorSettings;
  onChangeContent: (newContent: string) => void;
  onRunTrigger: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  settings,
  onChangeContent,
  onRunTrigger,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom Neo-Brutalist themes
    monaco.editor.defineTheme('neo-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '71717A', fontStyle: 'italic' },
        { token: 'keyword', foreground: '60A5FA', fontStyle: 'bold' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'FBBF24' },
      ],
      colors: {
        'editor.background': '#18181B',
        'editor.foreground': '#F4F4F5',
        'editorLineNumber.foreground': '#52525B',
        'editorLineNumber.activeForeground': '#2563EB',
        'editor.selectionBackground': '#2563EB40',
        'editor.inactiveSelectionBackground': '#2563EB20',
      },
    });

    monaco.editor.defineTheme('neo-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '1D4ED8', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'D97706' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#18181B',
        'editorLineNumber.foreground': '#9CA3AF',
        'editorLineNumber.activeForeground': '#2563EB',
        'editor.selectionBackground': '#DBEAFE',
      },
    });

    // Apply theme
    monaco.editor.setTheme(settings.theme);

    // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunTrigger();
    });
  };

  useEffect(() => {
    if (editorRef.current && (window as any).monaco) {
      (window as any).monaco.editor.setTheme(settings.theme);
    }
  }, [settings.theme]);

  if (!file) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F3F4F6] text-gray-500 p-6 text-center">
        <p className="font-black text-sm">Tidak ada file yang dipilih</p>
        <p className="text-xs mt-1">Pilih file dari explorer atau buat file baru untuk mulai coding.</p>
      </div>
    );
  }

  // Map language to Monaco language identifier
  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'python':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'bash':
        return 'shell';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      case 'sql':
        return 'sql';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#18181B]">
      <Editor
        key={file.id}
        height="100%"
        width="100%"
        language={getMonacoLanguage(file.language)}
        value={file.content}
        onChange={(val) => onChangeContent(val || '')}
        onMount={handleEditorDidMount}
        theme={settings.theme}
        loading={
          <div className="w-full h-full flex items-center justify-center bg-[#18181B] text-white space-x-2 text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
            <span>Memuat Monaco Editor...</span>
          </div>
        }
        options={{
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: 'monospace, "Fira Code", "Courier New"',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
        }}
      />
    </div>
  );
};
