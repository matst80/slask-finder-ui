// src/app/builder/product/[componentId]/[id]/page.tsx

import { Suspense } from "react";
import { getRawData } from "../../../../../lib/datalayer/api";
import { ComponentId } from "../../../../../page-components/builder/builder-types";
import { BuilderProductPage } from "../../../../../page-components/builder/BuilderProductPage";
import { Loader } from "../../../../../components/Loader";

// Data fetching for 'id' and 'componentId' (useLoaderData) needs to be handled here or in the component

const BuilderPageLoader = async ({
  id,
  componentId,
}: {
  id: number;
  componentId: ComponentId;
}) => {
  const details = await getRawData(id);
  return <BuilderProductPage {...details} componentId={componentId} />;
};

export default async function BuilderProductDetailsPage({
  params,
}: {
  params: Promise<{ id: number; componentId: ComponentId }>;
}) {
  const { id, componentId } = await params; // Await the params promise to get the actual id and componentId

  return (
    <Suspense fallback={<Loader size="md" />}>
      <BuilderPageLoader id={id} componentId={componentId} />
    </Suspense>
  );
}
