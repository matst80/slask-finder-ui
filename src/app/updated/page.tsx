// src/app/updated/page.tsx
"use client";
import { UpdatedItems } from "../../page-components/tracking/updates";
import { PageContainer } from "../../PageContainer";

export default function UpdatedItemsPage() {
  return (
    <PageContainer>
      <UpdatedItems />
    </PageContainer>
  );
}
