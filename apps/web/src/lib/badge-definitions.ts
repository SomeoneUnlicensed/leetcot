export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  howToEarn: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: 'registered',
    name: 'Участник ЛитКот',
    description: 'За регистрацию на платформе',
    longDescription:
      'Этот значок получают все, кто зарегистрировался на платформе ЛитКот. Добро пожаловать в сообщество!',
    howToEarn: 'Зарегистрируйтесь на платформе ЛитКот.',
  },
  {
    slug: 'contributor',
    name: 'Контрибьютер',
    description: 'За вклад в развитие ЛитКот',
    longDescription:
      'Этот значок выдаётся пользователям, которые внесли значительный вклад в развитие платформы: сообщали об ошибках, предлагали улучшения или делали pull request-ы в репозиторий ЛитКот на GitHub.',
    howToEarn: 'Выдаётся вручную администраторами за вклад в проект.',
  },
];

export function getBadgeDefinition(slug: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.slug === slug);
}
