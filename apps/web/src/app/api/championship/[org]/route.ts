import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org } = await params;
  
  // This is a mock API endpoint for demonstration purposes.
  // In a real application, this would fetch live scoreboard data from the database.
  
  const mockData = {
    organization: org,
    status: "active",
    participants: 142,
    top_scores: [
      { user: "AlexCoder", score: 850, completed_tasks: 3 },
      { user: "MeowMaster", score: 600, completed_tasks: 2 },
      { user: "TopCat", score: 350, completed_tasks: 1 }
    ],
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(mockData);
}