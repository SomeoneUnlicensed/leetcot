import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '../src';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Loads the pre-registration list for the Lenta event and grants those emails access to
// /register on this fork. Point EVENT_INVITES_FILE at a JSON file with an array of emails
// (e.g. exported from the organizers' registration form), or pass it as
// EVENT_INVITE_EMAILS="a@example.com,b@example.com".
const DEFAULT_INVITES_FILE = path.join(__dirname, 'event-invites.local.json');

function loadEmails(): string[] {
  if (process.env.EVENT_INVITE_EMAILS) {
    return process.env.EVENT_INVITE_EMAILS.split(',').map((e) => e.trim());
  }

  const file = process.env.EVENT_INVITES_FILE ?? DEFAULT_INVITES_FILE;
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as string[];
  }

  return [];
}

async function main() {
  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });

  if (!championship) {
    console.error(
      `Championship "${LENTA_CHAMPIONSHIP_SLUG}" not found — run db:seed:debug-simulator first.`,
    );
    process.exit(1);
  }

  const emails = loadEmails()
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length === 0) {
    console.log(
      'No emails to invite. Set EVENT_INVITE_EMAILS or put a JSON array of emails at ' +
        `${DEFAULT_INVITES_FILE} (or point EVENT_INVITES_FILE at it).`,
    );
    return;
  }

  for (const email of emails) {
    await prisma.eventInvite.upsert({
      where: { championshipId_email: { championshipId: championship.id, email } },
      update: {},
      create: { championshipId: championship.id, email },
    });
  }

  console.log(`Invited ${emails.length} email(s) to "${championship.name}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
