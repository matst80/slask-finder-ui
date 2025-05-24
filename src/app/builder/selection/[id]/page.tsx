// src/app/builder/selection/[id]/page.tsx

import { notFound } from "next/navigation";
import { BuilderComponentSelector } from "../../../../page-components/builder/BuilderComponentSelector";
import { componentRules } from "../../../../page-components/builder/rules";

export default async function BuilderSelectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Await the params to ensure they are resolved
  const rule = componentRules.find((rule) => rule.id === id);
  if (!rule) {
    notFound(); // If no rule is found, return a 404 not found response
  }
  return <BuilderComponentSelector {...rule} />;
}
