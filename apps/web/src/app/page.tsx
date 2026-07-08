import type { Metadata } from 'next';
import { Footsies } from '~/components/footsies';
import { SITE_URL, buildMetaForDefault, tagline } from './metadata';
import { Features } from './_components/features';
import { Hero } from './_components/hero';
import { PartnerCta } from './_components/partner-cta';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'ЛитКот — задачи по программированию, которые хочется дорешать',
    description: tagline,
  });
}

export default function Index() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalApplication',
    name: 'ЛитКот',
    alternateName: 'LeetCot',
    url: SITE_URL,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    inLanguage: 'ru-RU',
    description: tagline,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RUB',
    },
    teaches: ['Python', 'SQL', 'Go', 'Алгоритмы', 'Структуры данных'],
    publisher: {
      '@type': 'Organization',
      name: 'Арлист Тех',
      url: 'https://arlist.ru/',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      <Features />
      <PartnerCta />
      <Footsies />
    </>
  );
}
