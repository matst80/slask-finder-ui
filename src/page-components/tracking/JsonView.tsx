"use client";
import { useClipboard } from "../../lib/hooks/useClipboard";

export const JsonView = ({ data }: { data: unknown }) => {
  const copy = useClipboard();
  return (
    <pre
      className="bg-black text-white p-4 text-sm overflow-x-hidden rounded-md whitespace-pre-wrap"
      onClick={() => copy(JSON.stringify(data, null, 2))}
    >
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
};
