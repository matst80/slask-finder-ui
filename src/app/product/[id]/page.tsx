import { getRawData } from "../../../lib/datalayer/api";
import { ItemDetails } from "../../../components/ItemDetails";
import { Suspense } from "react";
import { Loader } from "../../../components/Loader";

const DetailLoader = async ({ id }: { id: number }) => {
  const details = await getRawData(id); // Replace with actual ID or logic to fetch details
  return <ItemDetails {...details} />;
};

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: number | string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loader size="md" />}>
        <DetailLoader id={Number(id)} />
      </Suspense>
    </div>
  );
}
