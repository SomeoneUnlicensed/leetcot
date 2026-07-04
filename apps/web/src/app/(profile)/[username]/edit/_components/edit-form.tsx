'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Separator } from '@repo/ui/components/separator';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
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
    bio: string;
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
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex max-w-sm flex-col lg:max-w-full lg:flex-row lg:items-center lg:justify-between ">
              <FormLabel className="w-32">О себе</FormLabel>
              <div className="max-w-sm grow space-y-2 lg:mx-auto lg:max-w-md">
                <FormControl>
                  <Textarea {...field} placeholder="Расскажите немного о себе" rows={4} />
                </FormControl>
                <FormDescription>{form.getValues().bio.length} / 256 символов</FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Separator />
        <FormItem className="flex max-w-sm flex-col lg:max-w-full lg:flex-row lg:items-center lg:justify-between ">
          <FormLabel className="w-32">Ссылки</FormLabel>
          <div className="max-w-sm grow space-y-2 lg:mx-auto lg:max-w-md">
            {userLinksField.fields.map((field, i) => (
              <div key={i}>
                <FormControl>
                  <Input
                    {...form.register(`userLinks.${i}.url`)}
                    defaultValue={field.url}
                    placeholder="https://"
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.userLinks?.[i]?.url?.message}</FormMessage>
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
