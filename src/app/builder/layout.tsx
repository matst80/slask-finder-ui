// src/app/builder/layout.tsx
"use client"; // Assuming BuilderMain or its children might use client hooks
import { BuilderMain } from "../../page-components/builder/BuilderMain"; // Adjust path as needed

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // BuilderMain itself will render its own UI, and then the children page
    <BuilderMain>{children}</BuilderMain>
  );
}
