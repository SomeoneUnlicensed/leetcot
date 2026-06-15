import { Settings } from '@repo/ui/icons';
import { SettingsForm } from './settings-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';

export function SettingsButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-zinc-200 focus:outline-none"
          aria-label="Настройки"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Settings className="stroke-current stroke-[1.5]" size={18} />
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1">Настройки</TooltipContent>
          </Tooltip>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Настройки редактора</DialogTitle>
        </DialogHeader>
        <SettingsForm />
      </DialogContent>
    </Dialog>
  );
}
