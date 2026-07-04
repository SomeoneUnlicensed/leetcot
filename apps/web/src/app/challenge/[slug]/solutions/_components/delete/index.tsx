import type { DialogTriggerProps } from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@repo/ui/components/dialog';
import { TypographyLarge } from '@repo/ui/components/typography/large';
import type { ChallengeSolution } from '~/app/challenge/[slug]/solutions/[solutionId]/page';
import { Button } from '@repo/ui/components/button';
import { TypographyP } from '@repo/ui/components/paragraph';
import { deleteSolution } from '../_actions';
import { toast } from '@repo/ui/components/use-toast';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface SolutionDeleteDialogProps extends DialogTriggerProps {
  solution: ChallengeSolution;
  slug: string[] | string | undefined;
}

export function SolutionDeleteDialog({
  children,
  slug,
  solution,
  ...props
}: SolutionDeleteDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  async function handleDeleteSolution() {
    try {
      await deleteSolution(solution);
      toast({
        title: 'Решение удалено',
        variant: 'success',
        description: 'Решение успешно удалено.',
      });
      // invalidate cache on deleting a solution successfully
      queryClient.invalidateQueries({
        queryKey: ['challenge-solutions', slug],
      });
      queryClient.refetchQueries({
        queryKey: ['challenge-solutions', slug],
      });
      router.back();
    } catch {
      toast({
        title: 'Что-то пошло не так',
        variant: 'destructive',
        description: 'Не удалось удалить решение.',
      });
    }
  }

  return (
    <Dialog onOpenChange={() => setIsOpen(!isOpen)} open={isOpen}>
      <DialogTrigger {...props}>{children}</DialogTrigger>
      <DialogContent className="flex flex-col space-y-2">
        <TypographyLarge>Удалить решение</TypographyLarge>
        <TypographyP>Вы уверены, что хотите удалить это решение?</TypographyP>
        <div className="flex flex-row gap-2">
          <Button onClick={() => setIsOpen(!isOpen)} variant="outline">
            Отмена
          </Button>
          <Button
            onClick={() => {
              void handleDeleteSolution();
            }}
            variant="destructive"
          >
            Удалить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
