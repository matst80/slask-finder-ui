// src/app/builder/product/[componentId]/[id]/page.tsx

import ScrollToTop from "../../../../../components/ScrollToTop";
import { getRawData } from "../../../../../lib/datalayer/api";
import { ComponentId } from "../../../../../page-components/builder/builder-types";
import { BuilderProductPage } from "../../../../../page-components/builder/BuilderProductPage";

// Data fetching for 'id' and 'componentId' (useLoaderData) needs to be handled here or in the component

export default async function BuilderProductDetailsPage({
  params,
}: {
  params: Promise<{ id: number; componentId: ComponentId }>;
}) {
  const { id, componentId } = await params; // Await the params promise to get the actual id and componentId
  const details = await getRawData(id); // Example API call, adjust as needed

  return (
    <>
      <BuilderProductPage {...details} componentId={componentId} />
      <ScrollToTop />
    </>
  );
}
