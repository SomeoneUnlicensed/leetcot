import { useResetEditor } from '@repo/monaco/editor-hooks';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogFooter,
} from '@repo/ui/components/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { RotateCcw } from '@repo/ui/icons';

const ResetEditorButton = () => {
  const { dispatch } = useResetEditor();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="flex items-center justify-center rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-zinc-200 focus:outline-none"
          aria-label="Сбросить код"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <RotateCcw className="stroke-current stroke-[1.5]" size={18} />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Сбросить код до исходного</p>
            </TooltipContent>
          </Tooltip>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Сбросить код до исходного?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={() => dispatch('resetCode')}>Продолжить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export { ResetEditorButton };
