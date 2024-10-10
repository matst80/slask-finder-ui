import { useEffect, useState } from "react";
import { useQueryHelpers } from "../searchHooks";
import { Filter } from "lucide-react";

export const FilterQuery = () => {
  const {
    query: { query },
    setTerm,
  } = useQueryHelpers();

  const [value, setValue] = useState(query ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query != value) {
        setTerm(value);
      }
    }, 260);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, query, setTerm]);

  return (
    <div className="relative flex-1 mb-4">
      <input
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        type="search"
        value={value}
        placeholder="Filter items..."
        onChange={(e) => setValue(e.target.value)}
      />
      <Filter
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />
    </div>
  );
};