import { useSearchContext } from "../SearchContext";

export const Paging = () => {
  const { results, page, setPage } = useSearchContext();
  if (results == null) return null;
  const totalPages = Math.ceil(results.totalHits / results.pageSize);
  return (
    <div className="paging">
      <button
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
        title="Previous"
      >
        &lt;
      </button>
      <span>
        Page {page + 1}/{totalPages}
      </span>
      <strong>Total hits: {results?.totalHits}</strong>
      <button
        disabled={page >= totalPages - 1}
        onClick={() => setPage(page + 1)}
        title="Next"
      >
        &gt;
      </button>
    </div>
  );
};
