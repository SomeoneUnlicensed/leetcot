'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { useFieldArray, useForm } from 'react-hook-form';
import Link from 'next/link';
import { cn } from '@repo/ui/cn';
import { EditFormSchema } from './edit-form.schema';
import { updateProfile } from './edit-form.action';
import { toast } from '@repo/ui/components/use-toast';

export function EditForm(props: {
  className?: string;
  user: {
    id: string;
    userLinks: { url: string }[];
  };
}) {
  const form = useForm<EditFormSchema>({
    resolver: zodResolver(EditFormSchema),
    defaultValues: {
      ...props.user,
      userLinks: [
        ...props.user.userLinks,
        ...Array.from({ length: 4 - props.user.userLinks.length }).map(() => ({ url: '' })),
      ],
    },
    mode: 'onTouched',
  });
  const userLinksField = useFieldArray({
    control: form.control,
    name: 'userLinks',
  });

  async function onSubmit(data: EditFormSchema) {
    try {
      await updateProfile(data);
      toast({
        title: 'Профиль обновлен',
        description: 'Изменения успешно сохранены.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Не удалось обновить профиль',
        description: 'Проверьте, что ссылки ведут на разрешённые код-хостинги.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex max-w-sm flex-col lg:max-w-full', props.className)}
      >
        <FormItem className="flex max-w-sm flex-col lg:max-w-full lg:flex-row lg:items-start lg:justify-between">
          <div className="w-32 space-y-1">
            <FormLabel>Ссылки</FormLabel>
            <p className="text-muted-foreground text-xs">
              GitHub, GitLab, GitVerse, Bitbucket или Codeberg.
            </p>
          </div>
          <div className="max-w-sm grow space-y-2 lg:mx-auto lg:max-w-md">
            {userLinksField.fields.map((field, i) => (
              <div key={i}>
                <FormField
                  control={form.control}
                  name={`userLinks.${i}.url`}
                  render={({ field: linkField }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...linkField}
                          placeholder="https://github.com/username"
                          inputMode="url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </FormItem>
        <div className="space-x-2 self-end">
          <Button variant="outline">
            <Link href=".">Отмена</Link>
          </Button>
          <Button type="submit">Сохранить профиль</Button>
        </div>
      </form>
    </Form>
  );
}
