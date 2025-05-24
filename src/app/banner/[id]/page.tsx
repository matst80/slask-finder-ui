// src/app/banner/[id]/page.tsx
import { Banner } from "../../../components/Banner"; // Adjust import path
import { PageContainer } from "../../../PageContainer"; // Adjust import path
import { getRawData } from "../../../lib/datalayer/api";
import { Suspense } from "react";

// Placeholder for Next.js data fetching (e.g., getServerSideProps or generateStaticParams + fetch)
// For now, we'll keep the structure similar and mark what needs to change.

export default async function BannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // const id = useLoaderData(); // This is from react-router, needs replacement
  // In Next.js, you get params directly
  const { id } = await params; // Await the params promise to get the actual id
  const itemId = Number(id);
  const data = await getRawData(itemId); // Example API call, adjust as needed

  return (
    <PageContainer>
      <Suspense>
        <Banner item={data} />
      </Suspense>
    </PageContainer>
  );
}
