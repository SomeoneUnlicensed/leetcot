import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { EditorShortcuts } from './editor-shortcuts-form';
import { SquareSlash } from '@repo/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';

export function EditorShortcutsButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-zinc-200 focus:outline-none"
          aria-label="Горячие клавиши"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SquareSlash className="stroke-current stroke-[1.5]" size={18} />
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1">Горячие клавиши</TooltipContent>
          </Tooltip>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Горячие клавиши</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <EditorShortcuts />
        </div>
      </DialogContent>
    </Dialog>
  );
}
