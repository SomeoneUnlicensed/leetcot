import { Difficulty } from '@prisma/client';

export type DebugTaskCategory =
  | 'ACCESS'
  | 'CLOUD'
  | 'CRYPTO'
  | 'INCIDENT_RESPONSE'
  | 'NETWORK'
  | 'RECON'
  | 'WEB';

export interface DebugTaskSeed {
  slug: string;
  title: string;
  category: DebugTaskCategory;
  difficulty: Difficulty;
  points: number;
  sortOrder: number;
  /// Briefing shown to the participant. Real connection details (host/port/creds)
  /// are issued separately per team by infra and are not stored here.
  instructions: string;
  /// Docker image that auto-deploys this task's live environment. Omit for tasks
  /// without one yet (participants get the "ask organizers" fallback instead).
  dockerImage?: string;
}

const POINTS: Record<'final' | 'light' | 'medium', number> = {
  light: 10,
  medium: 25,
  final: 100,
};

/**
 * "Лента" debug-simulator task set — the 20 tasks kept after dropping the "сложные"
 * (hard) tier from the original 25-item brainstorm list (see task numbers 9, 12, 13,
 * 16, 17 in the source discussion). Numbers in slugs/comments below refer to that
 * original numbering for traceability, not to be shown to participants.
 */
export const debugTasks: DebugTaskSeed[] = [
  // -- Лёгкие / стартовые --
  {
    slug: 'ssh-bruteforce',
    title: 'Взлом слабого SSH-пароля методом подбора',
    category: 'ACCESS',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 1,
    instructions:
      'На выданном сервере поднят SSH со слабым паролем у одного из пользователей. Подберите пароль и зайдите на сервер, чтобы найти флаг.',
    dockerImage: 'lentatech/ssh-bruteforce:latest',
  },
  {
    slug: 'network-scan',
    title: 'Сканирование сети и обнаружение открытых портов и сервисов',
    category: 'RECON',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 2,
    instructions:
      'Просканируйте выданный хост и определите, какие порты и сервисы на нём открыты. Флаг спрятан в баннере одного из непубличных сервисов.',
  },
  {
    slug: 'unprotected-database',
    title: 'Подключение к незащищённой базе данных',
    category: 'ACCESS',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 3,
    instructions:
      'На сервере запущена база данных (Redis / MongoDB / Elasticsearch) без аутентификации. Подключитесь к ней и найдите флаг среди хранимых данных.',
  },
  {
    slug: 'traffic-sniffing',
    title: 'Перехват незашифрованного сетевого трафика',
    category: 'NETWORK',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 5,
    instructions:
      'На сервере ходит незашифрованный трафик между двумя сервисами. Используя дампер трафика (tcpdump), перехватите его и найдите флаг в передаваемых данных.',
  },
  {
    slug: 'path-traversal-lfi',
    title: 'Чтение конфигов через уязвимость выхода за пределы директории',
    category: 'WEB',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 7,
    instructions:
      'Веб-приложение на сервере уязвимо к Path Traversal / LFI. Прочитайте файл вне корня сайта, чтобы найти флаг в конфиге.',
  },
  {
    slug: 'firewall-header-spoof-bypass',
    title: 'Обход фаервола с помощью подмены HTTP-заголовков',
    category: 'NETWORK',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 10,
    instructions:
      'Доступ к внутреннему эндпоинту ограничен фаерволом по IP. Подменив заголовок X-Forwarded-For, обойдите ограничение и заберите флаг из ответа.',
  },
  {
    slug: 'command-injection-ping',
    title: 'Внедрение OS-команд через утилиту проверки связи',
    category: 'WEB',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 11,
    instructions:
      'На сервере есть веб-форма проверки связи (ping) с уязвимостью Command Injection. Выполните через неё произвольную команду и прочитайте флаг из файловой системы.',
  },
  {
    slug: 'stolen-ssh-key',
    title: 'Подключение к серверу с помощью украденного приватного SSH-ключа',
    category: 'ACCESS',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 14,
    instructions:
      'Вам выдан приватный SSH-ключ, оставленный в публично доступном месте. Используйте его, чтобы зайти на сервер и найти флаг.',
  },
  {
    slug: 'abandoned-admin-panel',
    title: 'Поиск заброшенного сервиса или админки на нестандартном порту',
    category: 'RECON',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 18,
    instructions:
      'На сервере поднята забытая админ-панель на нестандартном порту. Найдите её и заберите флаг со страницы входа или дашборда.',
  },
  {
    slug: 'firewall-block-malicious-ip',
    title: 'Настройка фаервола для блокировки входящего вредоносного IP-трафика',
    category: 'NETWORK',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 19,
    instructions:
      'Сервер получает вредоносные запросы с конкретного IP. Настройте правило фаервола, блокирующее этот IP, — после успешной блокировки на сервере появится флаг.',
  },
  {
    slug: 'attacker-ip-log-filtering',
    title: 'Фильтрация логов доступа для поиска атакующего',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 24,
    instructions:
      'В логах доступа сервера смешаны легитимные и вредоносные запросы. Отфильтруйте логи и определите IP атакующего — он и есть флаг.',
  },
  {
    slug: 'log-rotation-setup',
    title: 'Настройка правил ротации логов для предотвращения переполнения диска',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 25,
    instructions:
      'Диск сервера почти заполнен разросшимися логами. Настройте ротацию логов (logrotate) так, чтобы место освободилось, — флаг появится после успешной настройки.',
  },

  // -- Средние --
  {
    slug: 'reverse-shell-access',
    title: 'Получение доступа к системе через обратное подключение',
    category: 'ACCESS',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 4,
    instructions:
      'Используя выданную уязвимость, добейтесь обратного подключения (reverse shell) с сервера и найдите флаг в домашней директории пользователя.',
  },
  {
    slug: 'web-shell-cleanup',
    title: 'Поиск и удаление загруженного веб-шелла',
    category: 'WEB',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 6,
    instructions:
      'В каталоге сайта на сервере кто-то оставил веб-шелл. Найдите и удалите его — после удаления в системе появится флаг.',
  },
  {
    slug: 'docker-api-secrets',
    title: 'Чтение секретов контейнера через открытый Docker API',
    category: 'CLOUD',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 8,
    instructions:
      'На сервере открыт Docker API без аутентификации. Используйте его, чтобы прочитать переменные окружения контейнера и найти флаг.',
  },
  {
    slug: 'nfs-smb-exfiltration',
    title: 'Извлечение конфиденциальных файлов с незащищённого сетевого диска',
    category: 'NETWORK',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 15,
    instructions:
      'В сети есть незащищённый сетевой диск (NFS / SMB). Подключитесь к нему и найдите файл с флагом среди общих ресурсов.',
  },
  {
    slug: 'restore-sudoers',
    title: 'Восстановление прав доступа после случайного изменения /etc/sudoers',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 20,
    instructions:
      'На сервере случайно сломан файл /etc/sudoers, из-за чего доступ к правам администратора потерян. Аккуратно восстановите корректные права — флаг откроется после успешного восстановления.',
  },
  {
    slug: 'hidden-process-detection',
    title: 'Обнаружение и остановка скрытого фонового процесса',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 21,
    instructions:
      'На сервере в фоне работает подозрительный скрытый процесс, потребляющий ресурсы. Найдите и остановите его — флаг лежит рядом с его следами (лог, PID-файл или crontab).',
  },
  {
    slug: 'vulnerable-library-patch',
    title: 'Обновление уязвимой версии библиотеки в контейнере',
    category: 'CLOUD',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 22,
    instructions:
      'В контейнере на сервере используется библиотека с известной уязвимостью. Обновите её до безопасной версии — после успешного обновления появится флаг.',
  },

  // -- Финальная / экспертная --
  {
    slug: 'restore-failed-replica-node',
    title: 'Восстановление упавшего реплицируемого узла',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.EVENT,
    points: POINTS.final,
    sortOrder: 23,
    instructions:
      'Один из узлов реплицируемого кластера на сервере упал и не синхронизируется с остальными. Разберитесь в причине и восстановите узел так, чтобы репликация возобновилась, — это финальная задача дебаг-симулятора.',
  },
];
