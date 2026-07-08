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
  {
    slug: 'all-ultra',
    name: 'Ультра-охотник',
    description: 'За решение всех ультра-задач',
    longDescription:
      'Этот значок получают пользователи, которые закрыли все активные задачи сложности «Ультра» на ЛитКоте.',
    howToEarn: 'Решите все активные задачи сложности «Ультра».',
  },
];

export function getBadgeDefinition(slug: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.slug === slug);
}
