import useSWR from "swr";
import { getWordConfig } from "../../lib/datalayer/api";
import useSWRMutation from "swr/mutation";

const useWordConfig = () => {
  return useSWR("/admin/words", getWordConfig, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
};

const useWordConfigMutation = () => {
  return useSWRMutation("/admin/words", (_, { arg }) => {
    return fetch("/admin/words", {
      method: "POST",
      body: JSON.stringify(arg),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  });
};

export const Words = () => {
  const { data, isLoading, error } = useWordConfig();
  const { trigger } = useWordConfigMutation();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;
  const { splitWords, wordMappings } = data;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Words</h1>
      <p>Manage your words here.</p>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Split Words</h2>
        <p>Words that should be split into multiple words.</p>
        <ul className="list-disc pl-6">
          {splitWords.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Word Mappings</h2>
        <p>Words that should be mapped to other words.</p>
        <ul className="list-disc pl-6">
          {Object.entries(wordMappings).map(([key, value]) => (
            <li key={key}>
              from:{key}, to:{value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
