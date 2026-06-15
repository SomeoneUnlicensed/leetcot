import { ArrowRightLeft } from '@repo/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';

interface SwapPanelButtonProps {
  toggleDirection: () => void;
}

const SwapPanelButton = ({ toggleDirection }: SwapPanelButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleDirection}
          className="hidden items-center justify-center rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-zinc-200 focus:outline-none lg:flex"
          aria-label="Поменять панели"
        >
          <ArrowRightLeft className="stroke-current stroke-[1.5]" size={18} />
        </button>
      </TooltipTrigger>
      <TooltipContent className="px-2 py-1">Поменять панели местами</TooltipContent>
    </Tooltip>
  );
};

export default SwapPanelButton;
