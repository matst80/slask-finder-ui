// src/app/ai/page.tsx
"use client"; // Assuming AiShopper might use client-side hooks
import { AiShopper } from "../../page-components/AiShopper";
import { PageContainer } from "../../PageContainer"; // Corrected import

export default function AiShopperPage() {
  return (
    <PageContainer>
      <AiShopper />
    </PageContainer>
  );
}
