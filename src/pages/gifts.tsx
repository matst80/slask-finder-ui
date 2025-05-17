import { useMemo, useState } from "react";
import { Facets } from "../components/Facets";
import { SearchResultList } from "../components/SearchResultList";
import { FacetProvider } from "../lib/hooks/FacetProvider";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { ItemsQuery, NumberValue } from "../lib/types";
import { QueryUpdater } from "../components/QueryMerger";
import { Slider } from "../components/facets/Slider";

type Persona = Partial<ItemsQuery> & {
  title: string;
  id: string;
};

const personas: Record<string, Persona> = {
  gamer: {
    title: "Gamer",
    string: [{ id: 10, value: ["Gaming"] }],
    id: "gamer",
  },
  all: {
    title: "Everyone",
    string: [{ id: 10, value: ["Outlet"], exclude: true }],
    id: "all",
  },
  homeOwner: {
    title: "Home Owner",
    string: [{ id: 30, value: ["PT100"] }],
    id: "homeOwner",
  },
  diy: {
    title: "Do it Yourself",
    string: [
      //{ id: 10, value: ["Outlet"], exclude: true },
      { id: 33249, value: ["!nil"] },
    ],
    id: "diy",
  },
};

export const GiftAssistant = () => {
  const [persona, setPersona] = useState<Persona>(personas.all);
  const [numberOfGifters, setNumberOfGifter] = useState(1);
  const [priceFilter, setPriceFilter] = useState<NumberValue>({
    min: 200,
    max: 500,
  });

  const query = useMemo<ItemsQuery>(() => {
    return {
      range: [
        {
          id: 4,
          min: priceFilter.min * 100 * numberOfGifters,
          max: priceFilter.max * 100 * numberOfGifters,
        },
        ...(persona.range ?? []),
      ],
      string: [
        ...(persona.string ?? []),
        { id: 32, value: ["PT320"], exclude: true },
      ],
      pageSize: 20,
    } satisfies ItemsQuery;
  }, [priceFilter, numberOfGifters, persona]);
  return (
    <QueryProvider initialQuery={query}>
      <QueryUpdater query={query} />
      <div className="max-w-[1920px] mx-auto md:px-6">
        <div className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 rounded-lg my-6">
          <div className="flex flex-col gap-2 md:gap-4">
            <h1 className="text-2xl font-bold">Gift Assistant</h1>
            <p className="text-gray-500">
              Find the perfect gift for your loved ones!
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col gap-2 md:gap-4">
              <label htmlFor="numberOfGifters" className="text-gray-700">
                Number of gifters:
              </label>
              <input
                type="number"
                id="numberOfGifters"
                value={numberOfGifters}
                onChange={(e) => setNumberOfGifter(Number(e.target.value))}
                min={1}
                max={20}
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-4">
              <label htmlFor="priceFilter" className="text-gray-700">
                Price range:
              </label>
              <Slider
                min={priceFilter.min}
                max={priceFilter.max}
                absoluteMax={5000}
                absoluteMin={0}
                onChange={(min, max) => setPriceFilter({ min, max })}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-4">
              <label htmlFor="persona" className="text-gray-700">
                Persona:
              </label>
              <select
                id="persona"
                value={persona.id}
                onChange={(e) => {
                  setPersona(personas[e.target.value]);
                }}
                className="border border-gray-300 rounded px-2 py-1"
              >
                {Object.entries(personas).map(([id, p]) => (
                  <option key={id} value={id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[288px_auto]">
          <div className="border-b-1 py-1 px-4 md:px-0 md:py-0 border-gray-300 md:border-none bg-gray-50 md:bg-white">
            <FacetProvider ignoreFacets={[4]}>
              <Facets />
            </FacetProvider>
          </div>
          <main className="container px-4 md:px-10">
            <SearchResultList />
          </main>
        </div>
      </div>
    </QueryProvider>
  );
};
