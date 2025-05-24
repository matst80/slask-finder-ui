// src/app/product/[id]/page.tsx
import { ProductPage } from "../../../components/ProductPage";
import { PageContainer } from "../../../PageContainer";
import ScrollToTop from "../../../components/ScrollToTop";
import { getRawData } from "../../../lib/datalayer/api";

// Data fetching will need to be adapted to Next.js (getServerSideProps or client-side with SWR/useEffect)

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: number | string }>;
}) {
  const { id } = await params; // Await the params promise to get the actual id
  // const productData = useLoaderData(); // This is from react-router, needs replacement
  // In Next.js, you'd fetch data based on params.id
  const data = await getRawData(id); // Example API call, adjust as needed
  return (
    <PageContainer>
      {/* Pass params.id or fetched data to ProductPage */}
      <ProductPage {...data} />
      <ScrollToTop />
    </PageContainer>
  );
}
