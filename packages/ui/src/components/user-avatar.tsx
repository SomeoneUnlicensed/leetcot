import { cn } from '../cn';
import { Avatar, AvatarFallback, AvatarImage, DefaultAvatar } from './avatar';

interface UserAvatarProps {
  src: string | null;
  username?: string | null;
  className?: string;
}
export function UserAvatar(props: UserAvatarProps) {
  return (
    <Avatar className={cn('h-7 w-7', props.className)}>
      {props.src && <AvatarImage src={props.src} alt={props.username ?? 'user avatar'} />}
      <AvatarFallback>
        <DefaultAvatar username={props.username} />
      </AvatarFallback>
    </Avatar>
  );
}
