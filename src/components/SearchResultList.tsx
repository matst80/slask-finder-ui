import { useSearchContext } from "../SearchContext";

export const SearchResultList = () => {
  const { results } = useSearchContext();

  return results != null ? (
    <ul className="hits">
      {results.items.map(({ id, title, props }) => (
        <li key={id}>
          <h3>{title}</h3>
          <img src={props.img} alt={title} />
          <ul>
            {props.bp.map((bp) => (
              <li key={bp}>{bp}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  ) : (
    <div>No results</div>
  );
};
