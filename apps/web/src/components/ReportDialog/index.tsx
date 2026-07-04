import { type IssueType } from '@repo/db/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  type ChallengeReport,
  type UserReport,
  type CommentReport,
  addReport,
  type SolutionReport,
} from './report-dialog.action';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { toast } from '@repo/ui/components/use-toast';
import { Text } from '@repo/ui/components/typography/typography';
import { FormField, FormItem } from '@repo/ui/components/form';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Textarea } from '@repo/ui/components/textarea';
import { Button } from '@repo/ui/components/button';

export interface ReportDialogPropsBase {
  triggerAsChild?: boolean;
}

export interface ReportUserDialogProps extends ReportDialogPropsBase {
  reportType: 'USER';
  userId: string;
}

export interface ReportChallengeDialogProps extends ReportDialogPropsBase {
  reportType: 'CHALLENGE';
  challengeId: number;
}

export interface ReportCommentDialogProps extends ReportDialogPropsBase {
  reportType: 'COMMENT';
  commentId: number;
}

export interface ReportSolutionDialogProps extends ReportDialogPropsBase {
  reportType: 'SOLUTION';
  solutionId: number;
}

export function ReportDialog({
  children,
  triggerAsChild = false,
  reportType = 'COMMENT',
  ...props
}: React.PropsWithChildren<
  | ReportChallengeDialogProps
  | ReportCommentDialogProps
  | ReportSolutionDialogProps
  | ReportUserDialogProps
>) {
  const { handleSubmit, register, control, setValue } = useForm({
    defaultValues: {
      derogatory: false,
      unclear: false,
      bullying: false,
      spam: false,
      hateSpeech: false,
      threat: false,
      comments: '',
    },
  });

  const [show, setShow] = React.useState(false);

  let desc = '';
  switch (reportType) {
    case 'CHALLENGE':
      desc = 'Пожаловаться на задачу';
      break;
    case 'COMMENT':
      desc = 'Пожаловаться на комментарий';
      break;
    case 'USER':
      desc = 'Пожаловаться на пользователя';
      break;
    case 'SOLUTION':
      desc = 'Пожаловаться на решение';
      break;
  }

  return (
    <Dialog
      onOpenChange={(e) => {
        setShow(e);
      }}
      open={show}
    >
      <DialogTrigger asChild={triggerAsChild} className="focus:outline-none focus-visible:ring-2">
        {children}
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={handleSubmit(async (e) => {
            let args = {} as ChallengeReport | CommentReport | SolutionReport | UserReport;
            switch (reportType) {
              case 'CHALLENGE':
                args = {
                  ...props,
                  text: e.comments,
                  type: reportType,
                } as ChallengeReport;
                break;
              case 'COMMENT':
                args = {
                  ...props,
                  text: e.comments,
                  type: reportType,
                } as CommentReport;
                break;
              case 'USER':
                args = {
                  ...props,
                  text: e.comments,
                  type: reportType,
                } as UserReport;
                break;
              case 'SOLUTION':
                args = {
                  ...props,
                  text: e.comments,
                  type: reportType,
                } as SolutionReport;
            }

            // This shit is like... extra jank.
            const issues = Object.entries(e).reduce<{ type: IssueType }[]>((all, [key, value]) => {
              if (key === 'comments') return all;
              if (value)
                all.push({
                  type: key.toUpperCase() as IssueType,
                });
              return all;
            }, []);

            const value = await addReport({
              ...args,
              issues,
            });

            switch (value) {
              case 'already_exists':
                toast({
                  title: 'Жалоба уже отправлена',
                  description: <p>Вы уже отправляли жалобу с такими данными.</p>,
                });
                break;
              case 'created':
                toast({
                  title: 'Жалоба отправлена',
                  variant: 'success',
                  description: <p>Спасибо, мы проверим это.</p>,
                });
                break;
              case 'not_logged_in':
                toast({
                  title: 'Нужен вход',
                  variant: 'destructive',
                  description: <p>Войдите в аккаунт, чтобы отправить жалобу.</p>,
                });
            }
            setShow(false);
          })}
        >
          <DialogHeader>
            <DialogTitle>{desc}</DialogTitle>
            <DialogDescription>Опишите проблему как можно подробнее.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-2">
            <Text intent="leading">Выберите все подходящие причины:</Text>
            <FormField
              control={control}
              name="derogatory"
              render={() => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="derogatory"
                      {...register('derogatory')}
                      onCheckedChange={(e) => setValue('derogatory', e as boolean)}
                    />
                    <label htmlFor="derogatory">Оскорбительный тон</label>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="derogatory"
              render={() => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bullying"
                      {...register('bullying')}
                      onCheckedChange={(e) => setValue('bullying', e as boolean)}
                    />
                    <label htmlFor="bullying">Травля</label>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="hateSpeech"
              render={() => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hateSpeech"
                      {...register('hateSpeech')}
                      onCheckedChange={(e) => setValue('hateSpeech', e as boolean)}
                    />
                    <label htmlFor="hateSpeech">Ненавистнические высказывания</label>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="spam"
              render={() => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="spam"
                      {...register('spam')}
                      onCheckedChange={(e) => setValue('spam', e as boolean)}
                    />
                    <label htmlFor="spam">Spam</label>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="threat"
              render={() => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="threat"
                      {...register('threat')}
                      onCheckedChange={(e) => setValue('threat', e as boolean)}
                    />
                    <label htmlFor="threat">Угроза насилия</label>
                  </div>
                </FormItem>
              )}
            />
            {reportType === 'CHALLENGE' && (
              <FormField
                control={control}
                name="unclear"
                render={() => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="unclear"
                        {...register('unclear')}
                        onCheckedChange={(e) => setValue('unclear', e as boolean)}
                      />
                      <label htmlFor="unclear">Непонятное условие</label>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={control}
              name="comments"
              render={() => (
                <FormItem className="my-3">
                  <div className="flex flex-col gap-3">
                    <div>Дополнительная информация</div>
                    <Textarea
                      {...register('comments')}
                      placeholder="Что еще стоит знать модераторам при проверке жалобы?"
                    />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setShow(false);
              }}
              variant="outline"
            >
              Отмена
            </Button>
            <Button type="submit">Отправить жалобу</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
