import { Footsies } from '~/components/footsies';
import { Features } from './_components/features';
import { Hero } from './_components/hero';
import { SqlCoursePromo } from './_components/sql-course-promo';

export default function Index() {
  return (
    <>
      <Hero />
      <SqlCoursePromo />
      <Features />
      <Footsies />
    </>
  );
}
