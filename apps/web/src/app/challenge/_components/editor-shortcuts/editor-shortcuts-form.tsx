'use client';

import type { PropsWithChildren } from 'react';

interface EditorShortcutProps {
  title: string;
  description: React.ReactNode;
}

function EditorShortcut(props: EditorShortcutProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <h1>{props.title}</h1>
      {props.description}
    </div>
  );
}

const Key = (props: PropsWithChildren) => {
  return (
    <kbd className="rounded-md border border-zinc-300 bg-neutral-200 p-1 py-0.5 font-mono text-xs text-zinc-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
      {props.children}
    </kbd>
  );
};
function isMacOS() {
  // TODO: Use a package or some such
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return navigator.platform.toLowerCase().includes('mac');
}
export function EditorShortcuts() {
  const isMac = isMacOS();
  const cmdOrCtrl = isMac ? 'Cmd' : 'Ctrl';
  const optionOrAlt = isMac ? 'Option' : 'Alt';
  return (
    <div className="flex flex-col gap-2">
      <EditorShortcut
        title="Увеличить отступ"
        description={
          <p>
            <Key>Tab</Key> или <Key>{cmdOrCtrl}</Key> + <Key>&#91;</Key>
          </p>
        }
      />
      <EditorShortcut
        title="Уменьшить отступ"
        description={
          <p>
            <Key>Shift</Key> + <Key>Tab</Key> или <Key>{cmdOrCtrl}</Key> + <Key>&#93;</Key>
          </p>
        }
      />
      <EditorShortcut
        title="Переместить строки вверх/вниз"
        description={
          <p>
            <Key>{optionOrAlt}</Key> + <Key>Вверх</Key>/<Key>Вниз</Key>
          </p>
        }
      />
      <EditorShortcut
        title="Удалить строку и скопировать"
        description={
          <p>
            <Key>{cmdOrCtrl}</Key> + <Key>X</Key>
          </p>
        }
      />
      <EditorShortcut
        title="Комментировать выделение"
        description={
          <p>
            <Key>{cmdOrCtrl}</Key> + <Key>/</Key>
          </p>
        }
      />
      <EditorShortcut
        title="Отменить действие"
        description={
          <p>
            <Key>{cmdOrCtrl}</Key> + <Key>Z</Key>
          </p>
        }
      />
      <EditorShortcut
        title="Повторить действие"
        description={
          <p>
            <Key>{cmdOrCtrl}</Key> + <Key>Shift</Key> + <Key>Z</Key>
          </p>
        }
      />
    </div>
  );
}
