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
  /// Short in-character mission story shown once before the task starts (~1-2 min
  /// read). Sets the scene; instructions stays the terse technical brief.
  narrative: string;
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
 *
 * All tasks share one narrative frame: the participant is a junior security analyst
 * doing an internal audit of "Продукты и Баги" — a fictional retail chain's
 * infrastructure — during a practice red-team day.
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
    narrative:
      'Служба безопасности «Продукты и Баги» получила алерт: один из серверов складского учёта отвечает на SSH из внешней сети, а пароль администратора, судя по всему, никто не менял с момента установки. Прежде чем об этом узнают настоящие злоумышленники, нужно доказать, что взлом возможен — подобрать пароль и зайти на сервер.',
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
    narrative:
      'Вам выдали IP одного из серверов подсети склада — и больше почти ничего. Задача разведки: понять, что на нём вообще работает, какие порты открыты и какие сервисы за ними прячутся, включая один, о котором в документации ни слова.',
    instructions:
      'Просканируйте выданный хост и определите, какие порты и сервисы на нём открыты. Флаг спрятан в баннере одного из непубличных сервисов.',
    dockerImage: 'lentatech/network-scan:latest',
  },
  {
    slug: 'unprotected-database',
    title: 'Подключение к незащищённой базе данных',
    category: 'ACCESS',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 3,
    narrative:
      'На одном из внутренних серверов администратор поднял базу данных «на скорую руку», чтобы протестировать интеграцию, — и забыл включить аутентификацию. Она до сих пор открыта. Проверьте, что можно найти внутри, прежде чем это сделает кто-то другой.',
    instructions:
      'На сервере запущен Redis без аутентификации. Подключитесь к нему и найдите флаг среди хранимых ключей.',
    dockerImage: 'lentatech/unprotected-database:latest',
  },
  {
    slug: 'traffic-sniffing',
    title: 'Перехват незашифрованного сетевого трафика',
    category: 'NETWORK',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 5,
    narrative:
      'Два внутренних сервиса склада обмениваются данными в открытую, без шифрования. Ваша задача — встать «посередине» сетевого пути и перехватить трафик между ними, чтобы показать, какие данные утекают в чистом виде.',
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
    narrative:
      'Веб-панель мониторинга склада принимает имя файла параметром в URL — и, похоже, никак его не проверяет. Проверьте, можно ли таким образом выбраться за пределы папки сайта и прочитать то, что видеть не должны.',
    instructions:
      'Веб-приложение на сервере уязвимо к Path Traversal / LFI. Прочитайте файл вне корня сайта, чтобы найти флаг в конфиге.',
    dockerImage: 'lentatech/path-traversal-lfi:latest',
  },
  {
    slug: 'firewall-header-spoof-bypass',
    title: 'Обход фаервола с помощью подмены HTTP-заголовков',
    category: 'NETWORK',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 10,
    narrative:
      'Внутренний API-эндпоинт доступен только с определённых IP — так, по крайней мере, думает команда инфраструктуры. На деле фаервол смотрит на заголовок X-Forwarded-For, а не на реальный источник запроса.',
    instructions:
      'Доступ к внутреннему эндпоинту ограничен фаерволом по IP. Подменив заголовок X-Forwarded-For, обойдите ограничение и заберите флаг из ответа.',
    dockerImage: 'lentatech/firewall-header-spoof-bypass:latest',
  },
  {
    slug: 'command-injection-ping',
    title: 'Внедрение OS-команд через утилиту проверки связи',
    category: 'WEB',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 11,
    narrative:
      'На внутреннем портале есть утилита «проверить связь с сервером» — вводишь адрес, получаешь результат ping. Разработчики явно поверили пользовательскому вводу чуть больше, чем следовало.',
    instructions:
      'На сервере есть веб-форма проверки связи (ping) с уязвимостью Command Injection. Выполните через неё произвольную команду и прочитайте флаг из файловой системы.',
    dockerImage: 'lentatech/command-injection-ping:latest',
  },
  {
    slug: 'stolen-ssh-key',
    title: 'Подключение к серверу с помощью украденного приватного SSH-ключа',
    category: 'ACCESS',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 14,
    narrative:
      'В открытом облачном хранилище, которым пользовалась команда разработки, случайно оказался приватный SSH-ключ от одного из серверов. Он всё ещё рабочий — воспользуйтесь им, прежде чем администраторы спохватятся.',
    instructions:
      'Вам выдан приватный SSH-ключ, оставленный в публично доступном месте. Используйте его, чтобы зайти на сервер и найти флаг.',
    dockerImage: 'lentatech/stolen-ssh-key:latest',
  },
  {
    slug: 'abandoned-admin-panel',
    title: 'Поиск заброшенного сервиса или админки на нестандартном порту',
    category: 'RECON',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 18,
    narrative:
      'Два года назад для одного из проектов подняли админ-панель на нестандартном порту — и благополучно забыли про неё после релиза. Она где-то всё ещё крутится.',
    instructions:
      'На сервере поднята забытая админ-панель на нестандартном порту. Найдите её и заберите флаг со страницы входа или дашборда.',
    dockerImage: 'lentatech/abandoned-admin-panel:latest',
  },
  {
    slug: 'firewall-block-malicious-ip',
    title: 'Настройка фаервола для блокировки входящего вредоносного IP-трафика',
    category: 'NETWORK',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 19,
    narrative:
      'С одного и того же IP на сервер идёт поток подозрительных запросов — похоже на сканирование или попытку подбора. Ваша задача не расследование, а реакция: настройте фаервол так, чтобы источник был заблокирован.',
    instructions:
      'Сервер получает вредоносные запросы с конкретного IP (видно в access-логе). Настройте правило фаервола (iptables), блокирующее этот IP на INPUT, — после успешной блокировки на сервере появится флаг.',
    dockerImage: 'lentatech/firewall-block-malicious-ip:latest',
  },
  {
    slug: 'attacker-ip-log-filtering',
    title: 'Фильтрация логов доступа для поиска атакующего',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 24,
    narrative:
      'Среди тысяч строк access-лога веб-сервера спрятаны следы одной серии атак. Найдите IP, который выбивается из обычного трафика магазина, — в его последнем запросе оставлен флаг.',
    instructions:
      'В логах доступа сервера (/var/log/app/access.log) смешаны легитимные и вредоносные запросы. Отфильтруйте логи, найдите IP атакующего по характеру запросов (сканирование путей) и заберите флаг из его последнего запроса.',
    dockerImage: 'lentatech/attacker-ip-log-filtering:latest',
  },
  {
    slug: 'log-rotation-setup',
    title: 'Настройка правил ротации логов для предотвращения переполнения диска',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.EASY,
    points: POINTS.light,
    sortOrder: 25,
    narrative:
      'Диск сервера мониторинга почти заполнен — логи растут годами и никогда не архивировались. Прежде чем сервис упадёт от нехватки места, настройте ротацию логов.',
    instructions:
      'Диск сервера почти заполнен разросшимся файлом /var/log/app/access.log. Напишите конфиг logrotate (rotate + compress) и примените его (logrotate -f), чтобы файл сжался, — флаг появится после успешной ротации.',
    dockerImage: 'lentatech/log-rotation-setup:latest',
  },

  // -- Средние --
  {
    slug: 'reverse-shell-access',
    title: 'Получение доступа к системе через обратное подключение',
    category: 'ACCESS',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 4,
    narrative:
      'На сервере есть уязвимость, позволяющая заставить его самому «позвонить» вам обратно. Добейтесь обратного подключения и закрепитесь в системе достаточно, чтобы найти флаг в домашней директории.',
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
    narrative:
      'Кто-то уже был здесь до вас. В каталоге сайта затаился веб-шелл — точка входа, которую злоумышленник может использовать снова в любой момент. Найдите и уберите его.',
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
    narrative:
      'На одном из хостов остался открытым Docker API — без токена, без TLS, доступный всем, кто до него достучится. А в переменных окружения одного из контейнеров лежит то, чего там быть не должно.',
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
    narrative:
      'Общий сетевой диск склада настроен так, что подключиться к нему может кто угодно в сети — без пароля, без проверки. Посмотрите, что лежит на расшаренных ресурсах.',
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
    narrative:
      'После неудачного обновления конфигурации файл /etc/sudoers оказался повреждён, и администраторы разом потеряли права. Аккуратно всё восстановите — одна лишняя ошибка, и можно потерять доступ насовсем.',
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
    narrative:
      'Сервер необъяснимо тормозит уже второй день. Где-то в фоне работает процесс, который не должен там быть, — маскируется под системный. Найдите его и остановите.',
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
    narrative:
      'В одном из контейнеров инфраструктуры используется библиотека с давно опубликованной и давно закрытой уязвимостью — просто никто не обновился. Устраните риск, обновив зависимость до безопасной версии.',
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
    narrative:
      'Финал дня: один из узлов реплицируемого кластера отвалился от остальных, и репликация встала. Это уже не тренировочная задача — это то, с чем реальная команда эксплуатации сталкивается по ночам. Разберитесь, в чём дело, и верните узел в строй.',
    instructions:
      'Один из узлов реплицируемого кластера на сервере упал и не синхронизируется с остальными. Разберитесь в причине и восстановите узел так, чтобы репликация возобновилась, — это финальная задача дебаг-симулятора.',
  },
];
