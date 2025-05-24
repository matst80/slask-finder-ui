// src/app/builder/component/[id]/page.tsx

import { ComponentId } from "../../../../page-components/builder/builder-types";
import { BuilderComponentFilter } from "../../../../page-components/builder/BuilderComponentFilter";

export default async function BuilderComponentPage({
  params,
}: {
  params: Promise<{ id: ComponentId }>;
}) {
  const { id } = await params; // Await the params promise to get the actual id
  return <BuilderComponentFilter componentId={id} />;
}
