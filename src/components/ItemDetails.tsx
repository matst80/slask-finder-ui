import { X } from "lucide-react";
import { useDetails } from "../appState";
import { useFacetList } from "../searchHooks";

export const ItemDetails = () => {
  const [details, setDetails] = useDetails();
  const facets = useFacetList();
  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button
            onClick={() => setDetails(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <code>
          <pre>{JSON.stringify({ details, facets }, null, 2)}</pre>
        </code>
      </div>
    </div>
  );
};
