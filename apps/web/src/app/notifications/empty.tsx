import { AlertCircle, AtSign } from '@repo/ui/icons';

export function Empty({ type }: { type: 'all' | 'mentions' }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      {type === 'all' ? (
        <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
      ) : (
        <AtSign className="text-muted-foreground mb-4 h-12 w-12" />
      )}
      <h3 className="text-foreground mb-2 text-lg font-semibold">
        {type === 'all' ? 'Уведомлений пока нет' : 'Упоминаний пока нет'}
      </h3>
      <p className="text-muted-foreground max-w-sm text-sm">
        {type === 'all'
          ? 'Когда у вас появятся уведомления, они отобразятся здесь. Начните с общения в комментариях к задачам.'
          : 'Когда кто-то упомянет вас в комментариях, это отобразится здесь.'}
      </p>
    </div>
  );
}
