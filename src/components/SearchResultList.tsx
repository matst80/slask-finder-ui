import { useSearchContext } from "../SearchContext";

export const SearchResultList = () => {
  const { results } = useSearchContext();

  return results != null ? (
    <div>
      <strong>Total hits: {results.totalHits}</strong>
      <ul className="hits">
        {results.items.map(({ id, title, props }) => (
          <li key={id}>
            <strong>{title}</strong>
            {props.img != null && (
              <img
                src={
                  "https://www.elgiganten.se" +
                  props.img?.replace(".jpg", "--pdp_main-640.jpg")
                }
                alt={title}
              />
            )}
            <ul>
              {props.bp
                .filter((d) => d?.length)
                .map((bp) => (
                  <li key={bp}>{bp}</li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div>No results</div>
  );
};
