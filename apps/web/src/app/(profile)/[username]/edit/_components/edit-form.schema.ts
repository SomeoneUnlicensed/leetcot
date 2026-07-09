import { z } from 'zod';
import { createNoProfanitySchemaWithValidate } from '~/utils/antiProfanityZod';

const allowedProfileLinkHosts = new Set([
  'github.com',
  'gitlab.com',
  'gitverse.ru',
  'bitbucket.org',
  'codeberg.org',
]);

const validUrlWithHttpOrHttps = z.string().refine(
  (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  },
  {
    message: 'URL должен начинаться с https://',
  },
);

const allowedProfileLink = z.string().refine(
  (url) => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

      return allowedProfileLinkHosts.has(hostname);
    } catch {
      return false;
    }
  },
  {
    message: 'Можно добавить только GitHub, GitLab, GitVerse, Bitbucket или Codeberg.',
  },
);

export const EditFormSchema = z.object({
  userLinks: z.array(
    z.object({
      url: createNoProfanitySchemaWithValidate((str) => str.url().max(256))
        .and(validUrlWithHttpOrHttps)
        .and(allowedProfileLink)
        .or(z.literal('')),
    }),
  ),
});
export type EditFormSchema = z.infer<typeof EditFormSchema>;
