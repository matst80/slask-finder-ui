import { SessionView } from "../../../../components/Sessions";
import { getTrackingSession } from "../../../../lib/datalayer/api";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionData = await getTrackingSession(id);
  if (!sessionData) {
    return <div>Session not found</div>;
  }
  return <SessionView {...sessionData} />;
}
