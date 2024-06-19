import { useSearchContext } from "../SearchContext";

const SEK = new Intl.NumberFormat("se-SV", {
  style: "currency",
  compactDisplay: "short",
  unitDisplay: "narrow",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  signDisplay: "auto",
  currency: "SEK",
});

export const SearchResultList = () => {
  const { results } = useSearchContext();

  return results != null ? (
    <div>
      <strong>Total hits: {results.totalHits}</strong>
      <ul className="hits">
        {results.items.map((item) => {
          //console.log(item);
          const { id, title, props, values } = item;

          return (
            <li key={`item-${id}`}>
              <strong>{title}</strong>
              <div>
                <em>{id}</em>
              </div>
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
                  ?.filter((d) => d?.length)
                  .map((bp) => (
                    <li key={bp}>{bp}</li>
                  ))}
              </ul>
              <strong>{SEK.format(Number(values["4"] ?? 0) / 100)}</strong>
            </li>
          );
        })}
      </ul>
    </div>
  ) : (
    <div>No results</div>
  );
};
