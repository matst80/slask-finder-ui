import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "../lib/hooks/useQuery";

export const Paging = () => {
  const {
    query: { page: currentPage = 0, pageSize = 40 },
    isLoading,
    setPage: changePage,
    totalHits,
  } = useQuery();

  const totalPages = Math.ceil(totalHits / pageSize) - 1;
  if (isNaN(totalHits) || totalPages <= 1 || isLoading) return null;

  return (
    <div className="mt-8 flex items-center justify-center">
      <button
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="mx-4 flex items-center">
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index;
          if (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNumber}
                onClick={() => changePage(pageNumber)}
                className={`mx-1 px-3 py-1 rounded-md ${
                  currentPage === pageNumber
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {pageNumber + 1}
              </button>
            );
          } else if (
            pageNumber === currentPage - 2 ||
            pageNumber === currentPage + 2
          ) {
            return (
              <span key={pageNumber} className="mx-1">
                ...
              </span>
            );
          }
          return null;
        })}
      </div>
      <button
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
