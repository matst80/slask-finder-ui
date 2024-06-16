import { useSearchContext } from "../SearchContext";

export const Paging = () => {
  const ctx = useSearchContext();
  return (
    <>
      <button
        disabled={ctx.page === 0}
        onClick={() => ctx.setPage(ctx.page - 1)}
      >
        Previous
      </button>
      <span>Page {ctx.page}</span>
      <button onClick={() => ctx.setPage(ctx.page + 1)}>Next</button>
    </>
  );
};
