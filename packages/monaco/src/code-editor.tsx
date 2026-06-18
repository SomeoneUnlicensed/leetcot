'use client';

import Editor, { loader, type EditorProps } from '@monaco-editor/react';
import { useMemo } from 'react';
import { useEditorSettingsStore } from './settings-store';

loader.config({
  paths: {
    vs: `https://playgroundcdn.typescriptlang.org/cdn/5.5.4/monaco/min/vs`,
  },
});

const DEFAULT_OPTIONS = {
  fixedOverflowWidgets: true,
  lineNumbers: 'on',
  tabSize: 2,
  insertSpaces: false,
  minimap: {
    enabled: false,
  },
  fontSize: 16,
} as const satisfies EditorProps['options'];

export type CodeEditorProps = Omit<EditorProps, 'theme'>;

export function CodeEditor({
  onChange,
  onMount,
  options,
  value,
  language,
  ...props
}: CodeEditorProps & { language?: string }) {
  const { settings } = useEditorSettingsStore();
  const editorOptions = useMemo(() => {
    return {
      ...DEFAULT_OPTIONS,
      ...settings,
      fontSize: parseInt(settings.fontSize),
      tabSize: parseInt(settings.tabSize),
      ...options,
    };
  }, [options, settings]);

  return (
    <Editor
      {...props}
      loading={
        <div className="flex flex-col items-center justify-center gap-3 font-sans">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
          <div className="text-center">
            <p className="text-sm font-bold text-zinc-300">Загружаем редактор...</p>
            <p className="text-xs text-zinc-500">Это займет пару секунд 🐾</p>
          </div>
        </div>
      }
      language={language || 'typescript'}
      onChange={onChange}
      onMount={onMount}
      options={editorOptions}
      theme="vs-dark"
      value={value}
    />
  );
}
