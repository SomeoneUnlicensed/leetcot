'use client';

import { useSession } from '@repo/auth/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { useState, useEffect } from 'react';

export function ArlistLinkedModal() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.arlistJustLinked) {
      setOpen(true);
    }
  }, [session?.user?.arlistJustLinked]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Аккаунт привязан к Arlist ID</DialogTitle>
          <DialogDescription>
            Теперь входи на сайт через кнопку «Войти с Arlist ID». Вход по email и паролю для этого
            аккаунта больше не доступен. Мы также отправили письмо с подтверждением на твою почту.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
