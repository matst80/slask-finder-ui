// src/app/builder/component/[id]/page.tsx

import { ComponentId } from "../../../../page-components/builder/builder-types";
import { BuilderComponentFilter } from "../../../../page-components/builder/BuilderComponentFilter";

// Data fetching for 'id' (useLoaderData) needs to be handled here or in the component
// using Next.js patterns (e.g., props passed from server component, or client-side fetching)

export default function BuilderComponentPage({
  params,
}: {
  params: { id: ComponentId };
}) {
  return <BuilderComponentFilter componentId={params.id} />;
}
