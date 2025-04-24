import { Filter } from "lucide-react";
import { cm } from "../utils";
import { useQuery } from "../lib/hooks/useQuery";

type Props = {
  show: boolean;
};

export const FilterQuery = ({ show }: Props) => {
  const {
    query: { query = "" },
    setTerm,
  } = useQuery();

  const doShow = show || !!query?.length;
  return (
    <div
      className={cm(
        "relative flex-1 mb-4 transition-all overflow-hidden",
        doShow ? "h-11 opacity-100" : "h-0 opacity-0"
      )}
    >
      <input
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-hidden"
        type="search"
        value={query}
        placeholder="Filter items..."
        onChange={(e) => {
          setTerm(e.target.value);
        }}
      />
      <Filter
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />
    </div>
  );
};
