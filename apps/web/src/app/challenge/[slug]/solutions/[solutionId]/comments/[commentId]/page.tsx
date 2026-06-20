import { auth } from '~/server/auth';
import { SolutionDetails } from '~/app/challenge/[slug]/solutions/_components/solution-detail';
import { getSolutionIdRouteData } from '../../getSolutionIdRouteData';

interface SolutionPageCommentsProps {
  params: Promise<{
    slug: string;
    commentId: string;
    solutionId: string;
  }>;
}

export default async function SolutionPageComments(props: SolutionPageCommentsProps) {
  const params = await props.params;

  const { solutionId, slug } = params;

  const session = await auth();
  const solution = await getSolutionIdRouteData(slug, solutionId, session);

  return (
    <div className="relative h-full">
      <SolutionDetails solution={solution} />
    </div>
  );
}
