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
  /// The queue order: participants work the tasks strictly in this order, simple to hard.
  sortOrder: number;
  /// Briefing shown to the participant (markdown). Commands go in fenced blocks.
  instructions: string;
  /// Short in-character mission story shown once before the task starts.
  narrative: string;
  /// Docker image that provides the task's live environment (challenges/docker/<slug>).
  dockerImage?: string;
  /// Three progressive hints, opened one by one at a cost in points. The last one may give the
  /// solution away; the participant should never be stuck without a way forward.
  hints: string[];

  // ---- test-only (scripts/ops/e2e-tasks.ts); not stored in the database -------------------------
  /// Shell commands, run in order in the task's container, that solve it. EVERY command must appear
  /// verbatim in `instructions` or `hints`: the test checks that and then runs them, so the text a
  /// participant reads is exactly what is verified (a command that fails on purpose is allowed).
  solution: string[];
  /// ms to wait after the commands for watcher loops inside the container to notice the fix
  settleMs?: number;
  /// true when the flag must NOT be readable anywhere before the task is solved
  earnedLater?: boolean;
}

const POINTS = { easy: 10, medium: 25, final: 100 } as const;

const lines = (...parts: string[]) => parts.join('\n');

/**
 * Task set for the Lenta event. Blocks are short (40 and 75 minutes), so the queue starts with
 * one-command tasks that teach the terminal itself and only then gets harder. Story frame: the
 * participant is the new junior admin of "Продукты и Баги", a fictional retail chain.
 */
export const debugTasks: DebugTaskSeed[] = [
  {
    slug: 'first-steps',
    title: 'Первые шаги: осмотритесь на сервере',
    category: 'ACCESS',
    difficulty: Difficulty.EASY,
    points: POINTS.easy,
    sortOrder: 1,
    narrative:
      'Первый рабочий день в «Продуктах и Багах». Вам выдали доступ к серверу магазина, а предыдущий администратор оставил записку прямо в домашней папке.',
    instructions: lines(
      'Вы подключены к серверу. Терминал — это окно, в которое вводят команды и нажимают Enter.',
      '',
      'В домашней папке лежит записка от предыдущего администратора. Сначала посмотрите, какие файлы здесь есть, затем прочитайте записку:',
      '',
      '```sh',
      'ls',
      'cat welcome.txt',
      '```',
      '',
      'В записке есть флаг — строка вида `LENTA{...}`. Отправьте его командой `submit`, например: `submit LENTA{...}`.',
    ),
    dockerImage: 'lentatech/first-steps:latest',
    hints: [
      '`ls` показывает список файлов в текущей папке. Найдите в списке файл `welcome.txt`.',
      '`cat имя_файла` печатает содержимое файла на экран. Попробуйте `cat welcome.txt`.',
      'Выполните `ls`, затем `cat welcome.txt`. Скопируйте строку `LENTA{...}` целиком (выделите мышью и нажмите Ctrl+Shift+C), затем отправьте: `submit ` и вставьте флаг (Ctrl+Shift+V).',
    ],
    solution: ['ls', 'cat welcome.txt'],
  },
  {
    slug: 'hidden-file',
    title: 'Скрытая записка',
    category: 'ACCESS',
    difficulty: Difficulty.EASY,
    points: POINTS.easy,
    sortOrder: 2,
    narrative:
      'Коллеги говорят, что администратор ведёт личные заметки прямо на сервере, но обычный список файлов их не показывает.',
    instructions: lines(
      'Файлы, имена которых начинаются с точки, обычная команда `ls` не показывает. В вашей домашней папке спрятана личная записка администратора. Найдите её и прочитайте:',
      '',
      '```sh',
      'ls -a',
      'cat .private-note',
      '```',
      '',
      'Флаг — строка `LENTA{...}` в записке. Отправьте его командой `submit`.',
    ),
    dockerImage: 'lentatech/hidden-file:latest',
    hints: [
      'У команды `ls` есть параметры. Ключ `-a` (от слова all) показывает и скрытые файлы тоже.',
      'Выполните `ls -a`: среди файлов будет один, чьё имя начинается с точки.',
      'Выполните `ls -a`, затем `cat .private-note` и отправьте найденный флаг через `submit`.',
    ],
    solution: ['ls -a', 'cat .private-note'],
  },
  {
    slug: 'find-file',
    title: 'Найдите отчёт по имени файла',
    category: 'RECON',
    difficulty: Difficulty.EASY,
    points: POINTS.easy,
    sortOrder: 3,
    narrative:
      'Руководитель просит срочно прислать отчёт об инциденте с кассой, а на сервере десятки папок с отчётами за разные годы.',
    instructions: lines(
      'В каталоге `/srv/reports` лежат отчёты за три года, и вручную искать нужный файл долго. Команда `find` ищет файлы по имени во всём дереве папок.',
      '',
      'Найдите файл `incident-report.txt`:',
      '',
      '```sh',
      'find /srv -name incident-report.txt',
      '```',
      '',
      'Команда напечатает путь к файлу. Прочитайте файл командой `cat` — в нём флаг.',
    ),
    dockerImage: 'lentatech/find-file:latest',
    hints: [
      '`find /srv -name incident-report.txt` печатает полный путь к файлу. Ищите строку, которая начинается с `/srv/`.',
      'Скопируйте путь из вывода `find` и подставьте его после `cat` (через пробел).',
      'Можно одной командой: `cat $(find /srv -name incident-report.txt)`.',
    ],
    solution: ['find /srv -name incident-report.txt', 'cat $(find /srv -name incident-report.txt)'],
  },
  {
    slug: 'grep-log',
    title: 'Токен в логе',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.EASY,
    points: POINTS.easy,
    sortOrder: 4,
    narrative:
      'Разработчик признался: в лог приложения случайно попал платёжный токен. Найдите строку, пока лог не ушёл на сторонний сервер.',
    instructions: lines(
      'Лог приложения `/var/log/shop/app.log` — три тысячи строк. Читать его глазами бессмысленно, для поиска есть `grep`: он печатает только те строки файла, где встречается нужное слово.',
      '',
      'Найдите строку со словом `token`:',
      '',
      '```sh',
      'grep token /var/log/shop/app.log',
      '```',
      '',
      'Флаг — это и есть «утёкший токен» в найденной строке.',
    ),
    dockerImage: 'lentatech/grep-log:latest',
    hints: [
      '`grep слово файл` печатает строки файла, где встречается слово. Так не нужно листать весь лог.',
      'Искать нужно слово `token` (маленькими буквами).',
      'Выполните `grep token /var/log/shop/app.log`. Флаг стоит сразу после `payment-token=`.',
    ],
    solution: ['grep token /var/log/shop/app.log'],
  },
  {
    slug: 'local-web',
    title: 'Сайт на этом же сервере',
    category: 'WEB',
    difficulty: Difficulty.EASY,
    points: POINTS.easy,
    sortOrder: 5,
    narrative:
      'Сайт-витрина ещё не открыт для покупателей, но администратор уже оставил в его коде служебную заметку.',
    instructions: lines(
      'На этом сервере работает сайт на порту 8080. Браузера в терминале нет, зато есть `curl`: он запрашивает страницу по адресу и печатает ответ. Загляните на сайт и внимательно прочитайте его код — администратор оставил служебную заметку.',
      '',
      '```sh',
      'curl http://127.0.0.1:8080/',
      '```',
    ),
    dockerImage: 'lentatech/local-web:latest',
    hints: [
      'Адрес `127.0.0.1` означает «этот же сервер», а `:8080` — порт сайта.',
      'Заметка спрятана в HTML-комментарии — тексте между `<!--` и `-->`. В браузере его не видно, а в коде страницы видно.',
      'Выполните `curl http://127.0.0.1:8080/` — флаг стоит в комментарии. Чтобы вывести только нужную строку: `curl -s http://127.0.0.1:8080/ | grep LENTA`.',
    ],
    solution: ['curl http://127.0.0.1:8080/'],
  },
  {
    slug: 'which-port',
    title: 'Неизвестный сервис',
    category: 'NETWORK',
    difficulty: Difficulty.EASY,
    points: POINTS.easy,
    sortOrder: 6,
    narrative:
      'Разработчики забыли, на каком порту работает внутренний сервис синхронизации склада, а документации нет.',
    instructions: lines(
      'На этом сервере запущено несколько служб, и одна из них — сервис синхронизации склада. Сначала выясните, какие порты сервер сейчас слушает:',
      '',
      '```sh',
      'netstat -tln',
      '```',
      '',
      'Служебные порты вам не нужны — ищите необычные. Обратитесь к найденной службе через `curl` (адрес вида `http://127.0.0.1:НОМЕР_ПОРТА/`) и прочитайте ответ: у нужной службы в ответе есть флаг.',
    ),
    dockerImage: 'lentatech/which-port:latest',
    hints: [
      'В списке `netstat -tln` важны строки со словом LISTEN. Порт — число после двоеточия в колонке Local Address.',
      'Проверьте каждый порт по очереди: `curl http://127.0.0.1:НОМЕР_ПОРТА/`. Обычные службы отвечают коротко: `ok`. Нужная напишет `inventory-sync`.',
      'Нужный порт — 7431: `curl http://127.0.0.1:7431/`.',
    ],
    solution: ['netstat -tln', 'curl http://127.0.0.1:7431/'],
  },
  {
    slug: 'open-redis',
    title: 'База данных без пароля',
    category: 'ACCESS',
    difficulty: Difficulty.EASY,
    points: POINTS.easy,
    sortOrder: 7,
    narrative:
      'Служба безопасности нашла на сервере базу Redis, которая не защищена паролем. Проверьте, что из неё можно прочитать.',
    instructions: lines(
      'Внутренняя база Redis на этом сервере работает без пароля — любой, кто зашёл на сервер, может читать из неё данные. Подключитесь клиентом `redis-cli` и сначала посмотрите, какие ключи есть в базе:',
      '',
      '```sh',
      'redis-cli KEYS "*"',
      '```',
      '',
      'Затем прочитайте значение нужного ключа командой `redis-cli GET имя_ключа`. Флаг лежит в служебной резервной заметке.',
    ),
    dockerImage: 'lentatech/open-redis:latest',
    hints: [
      '`KEYS "*"` перечисляет все ключи. Обратите внимание на ключ, похожий на резервную заметку (`backup`).',
      'Значение ключа читается командой `GET`: `redis-cli GET имя_ключа`.',
      'Нужный ключ называется `backup:note`: `redis-cli GET backup:note`.',
    ],
    solution: ['redis-cli KEYS "*"', 'redis-cli GET backup:note'],
  },
  {
    slug: 'docker-api-secrets',
    title: 'Docker API без защиты',
    category: 'CLOUD',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 8,
    narrative:
      'Аудит нашёл на сервере открытый Docker API. Такой порт отдаёт настройки всех контейнеров — вместе с их секретами.',
    instructions: lines(
      'На `127.0.0.1:2375` открыт Docker Engine API без аутентификации: так делать нельзя, потому что через него видны все контейнеры вместе с их настройками и секретами.',
      '',
      'Получите список контейнеров (`jq` красиво печатает JSON) и найдите среди них `payment-worker`:',
      '',
      '```sh',
      'curl -s http://127.0.0.1:2375/containers/json | jq',
      '```',
      '',
      'У каждого контейнера есть идентификатор — поле `Id`. Подробности о контейнере отдаёт адрес `/containers/ИДЕНТИФИКАТОР/json`. Найдите в переменных окружения контейнера `payment-worker` секрет `DEBUG_TOKEN` — это и есть флаг.',
    ),
    dockerImage: 'lentatech/docker-api-secrets:latest',
    hints: [
      'Идентификатор `payment-worker` — в поле `Id` первого контейнера из списка.',
      'Подставьте идентификатор в адрес: `curl -s http://127.0.0.1:2375/containers/ИДЕНТИФИКАТОР/json | jq`. Переменные окружения лежат в разделе `Config`, поле `Env`.',
      'Идентификатор здесь — `a1b2c3d4e5f6`: `curl -s http://127.0.0.1:2375/containers/a1b2c3d4e5f6/json | jq -r ".Config.Env[]"`. Среди переменных найдите `DEBUG_TOKEN=`.',
    ],
    solution: [
      'curl -s http://127.0.0.1:2375/containers/json | jq',
      'curl -s http://127.0.0.1:2375/containers/a1b2c3d4e5f6/json | jq -r ".Config.Env[]"',
    ],
  },
  {
    slug: 'perm-denied',
    title: 'Скрипт не запускается',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 9,
    narrative:
      'Утренний отчёт по кассам не сформировался: скрипт, который его готовит, отказывается запускаться.',
    instructions: lines(
      'Админ подготовил скрипт формирования отчёта `/opt/tools/report.sh`, но он не запускается. Попробуйте запустить его и прочитайте, что говорит система:',
      '',
      '```sh',
      '/opt/tools/report.sh',
      '```',
      '',
      'Разберитесь с ошибкой и добейтесь успешного запуска. Когда скрипт отработает, он запишет код подтверждения в файл `/root/flag.txt`.',
    ),
    dockerImage: 'lentatech/perm-denied:latest',
    hints: [
      '`Permission denied` при запуске означает, что у файла нет права на исполнение. Права видны в `ls -l /opt/tools/report.sh`: в начале строки нет буквы `x`.',
      'Право на исполнение добавляет команда `chmod +x путь_к_файлу`.',
      'Выполните `chmod +x /opt/tools/report.sh`, затем снова `/opt/tools/report.sh`, затем прочитайте флаг: `cat /root/flag.txt`.',
    ],
    solution: ['/opt/tools/report.sh', 'chmod +x /opt/tools/report.sh', '/opt/tools/report.sh', 'cat /root/flag.txt'],
    settleMs: 3000,
    earnedLater: true,
  },
  {
    slug: 'dead-service',
    title: 'Сервис инвентаризации упал',
    category: 'INCIDENT_RESPONSE',
    difficulty: Difficulty.MEDIUM,
    points: POINTS.medium,
    sortOrder: 10,
    narrative:
      'Склад не может провести инвентаризацию: сервис, который считает остатки, не отвечает с самого утра.',
    instructions: lines(
      'Сервис инвентаризации на порту 9000 не отвечает. Убедитесь в этом:',
      '',
      '```sh',
      'curl http://127.0.0.1:9000/status',
      '```',
      '',
      'Найдите причину — логи сервиса лежат в `/var/log/inventory/error.log` — исправьте её и запустите сервис скриптом `/opt/inventory/start.sh`. Когда сервис начнёт отвечать на запросы, флаг появится в файле `/root/flag.txt`.',
    ),
    dockerImage: 'lentatech/dead-service:latest',
    hints: [
      'Начните с лога: `cat /var/log/inventory/error.log`. Там написано, чего не хватает сервису.',
      'Сервису нужен файл настроек `/etc/inventory/config.ini`. Готовый образец лежит в `/opt/inventory/config.ini.example`.',
      'Скопируйте образец: `cp /opt/inventory/config.ini.example /etc/inventory/config.ini`, затем запустите `/opt/inventory/start.sh` и прочитайте флаг: `cat /root/flag.txt`.',
    ],
    solution: [
      'cat /var/log/inventory/error.log',
      'cp /opt/inventory/config.ini.example /etc/inventory/config.ini',
      '/opt/inventory/start.sh',
      'cat /root/flag.txt',
    ],
    settleMs: 6000,
    earnedLater: true,
  },
];
