// src/app/admin/layout.tsx
"use client"; // Assuming Admin component or its children might use client hooks
import { Admin } from "../../page-components/Admin"; // Adjust path as needed
import { PageContainer } from "../../PageContainer"; // Adjust path as needed

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      {/* The Admin component itself will render its own UI, and then the children page */}
      <Admin>{children}</Admin>
    </PageContainer>
  );
}
