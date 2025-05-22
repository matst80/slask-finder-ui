import { useMemo, useState } from "react";
import { Facets } from "../components/Facets";
import { SearchResultList } from "../components/SearchResultList";
import { FacetProvider } from "../lib/hooks/FacetProvider";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { ItemsQuery, NumberValue } from "../lib/types";
import { QueryUpdater } from "../components/QueryMerger";
import { Slider } from "../components/facets/Slider";
import { AiShoppingProvider, MessageList, QueryInput } from "./AiShopper";

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
  husband: {
    title: "Husband",
    string: [
      //{ id: 10, value: ["Outlet"], exclude: true },
      { id: 31, value: ["PT221"] },
    ],
    id: "husband",
  },
  wife: {
    title: "Wife",
    string: [
      //{ id: 10, value: ["Outlet"], exclude: true },

      //32:PT424
      { id: 30, value: ["PT106"] },
      { id: 32, value: ["PT424"], exclude: true },
    ],
    id: "wife",
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
                Price range (per gifter):
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
                Recommendations:
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
            <AiShoppingProvider
              //customTools={[{}]}
              messages={[
                {
                  role: "system",
                  content: `You are a gift assistant. use the tools to find the perfect gift, start by identifying who should receive the gift, price id 4 is in öre, use filter refinement based on string cgm id:37 values for the cgms (dont use the cgm name, and skip the q parameter to start with) [
	{
		"value": "511",
		"title": "Tablet readers and notes"
	},
	{
		"value": "518",
		"title": "Handheld Gaming PCs"
	},
	{
		"value": "519",
		"title": "Laptop Apple"
	},
	{
		"value": "520",
		"title": "Laptop Chromebook"
	},
	{
		"value": "521",
		"title": "Laptop Commercial"
	},
	{
		"value": "522",
		"title": "Laptop Gaming"
	},
	{
		"value": "523",
		"title": "Monitor gaming"
	},
	{
		"value": "525",
		"title": "Tablet Apple"
	},
	{
		"value": "526",
		"title": "Desktop Apple"
	},
	{
		"value": "530",
		"title": "Desktop Gaming"
	},
	{
		"value": "531",
		"title": "Desktop Windows"
	},
	{
		"value": "533",
		"title": "Laptop Windows"
	},
	{
		"value": "534",
		"title": "Tablet Android"
	},
	{
		"value": "536",
		"title": "Monitor Classic"
	},
	{
		"value": "537",
		"title": "Multifunctional Cutters"
	},
	{
		"value": "538",
		"title": "Printers"
	},
	{
		"value": "541",
		"title": "Communication"
	},
	{
		"value": "543",
		"title": "Storage"
	},
	{
		"value": "545",
		"title": "Consumables"
	},
	{
		"value": "547",
		"title": "Office Equipment"
	},
	{
		"value": "550",
		"title": "Gaming Consoles"
	},
	{
		"value": "553",
		"title": "VR Equipment"
	},
	{
		"value": "555",
		"title": "PC Gaming Accessories"
	},
	{
		"value": "557",
		"title": "Input devices"
	},
	{
		"value": "561",
		"title": "Cameras"
	},
	{
		"value": "568",
		"title": "Drones"
	},
	{
		"value": "569",
		"title": "Camera Accessories"
	},
	{
		"value": "589",
		"title": "Accessories Computing"
	},
	{
		"value": "590",
		"title": "Components"
	},
	{
		"value": "594",
		"title": "LEGO"
	},
	{
		"value": "595",
		"title": "Toys"
	},
	{
		"value": "110",
		"title": "Special Fridges"
	},
	{
		"value": "130",
		"title": "Fridge/Freezer 76+cm"
	},
	{
		"value": "131",
		"title": "Refrigerators"
	},
	{
		"value": "132",
		"title": "Fridge/Freezer"
	},
	{
		"value": "133",
		"title": "Chest Freeze"
	},
	{
		"value": "134",
		"title": "Freezer"
	},
	{
		"value": "135",
		"title": "Cooker"
	},
	{
		"value": "136",
		"title": "Built In Cooker"
	},
	{
		"value": "138",
		"title": "Micro"
	},
	{
		"value": "140",
		"title": "Hoods"
	},
	{
		"value": "143",
		"title": "Dishwasher"
	},
	{
		"value": "144",
		"title": "Washing Machine"
	},
	{
		"value": "145",
		"title": "Dryer"
	},
	{
		"value": "150",
		"title": "Solar energy and power stations"
	},
	{
		"value": "158",
		"title": "Car Charging"
	},
	{
		"value": "163",
		"title": "Lighting"
	},
	{
		"value": "195",
		"title": "MDA Accessories"
	},
	{
		"value": "199",
		"title": "Unspecified WG"
	},
	{
		"value": "210",
		"title": "Headphones"
	},
	{
		"value": "211",
		"title": "Smart Home"
	},
	{
		"value": "219",
		"title": "Projector"
	},
	{
		"value": "224",
		"title": "Flat Screen"
	},
	{
		"value": "236",
		"title": "Optical Player Total"
	},
	{
		"value": "245",
		"title": "Media Players"
	},
	{
		"value": "260",
		"title": "Soundbar"
	},
	{
		"value": "271",
		"title": "Hifi Components"
	},
	{
		"value": "273",
		"title": "Hifi mini & micro system"
	},
	{
		"value": "274",
		"title": "Radio"
	},
	{
		"value": "275",
		"title": "Clockradio Total"
	},
	{
		"value": "278",
		"title": "Speakers"
	},
	{
		"value": "301",
		"title": "Heating"
	},
	{
		"value": "303",
		"title": "Cooling"
	},
	{
		"value": "304",
		"title": "BBQ"
	},
	{
		"value": "305",
		"title": "Climate"
	},
	{
		"value": "307",
		"title": "Cleaning"
	},
	{
		"value": "309",
		"title": "Iron"
	},
	{
		"value": "336",
		"title": "Table grill"
	},
	{
		"value": "337",
		"title": "Sandwich maker"
	},
	{
		"value": "339",
		"title": "Garden"
	},
	{
		"value": "340",
		"title": "Soda Maker"
	},
	{
		"value": "343",
		"title": "Espresso machine"
	},
	{
		"value": "344",
		"title": "Coffee capsule machine"
	},
	{
		"value": "345",
		"title": "Coffee Equipment"
	},
	{
		"value": "346",
		"title": "Coffee Maker"
	},
	{
		"value": "347",
		"title": "Kettle"
	},
	{
		"value": "348",
		"title": "Toasters"
	},
	{
		"value": "350",
		"title": "Waffle maker"
	},
	{
		"value": "352",
		"title": "Kitchen machine"
	},
	{
		"value": "353",
		"title": "Foodprocessor"
	},
	{
		"value": "354",
		"title": "Blender"
	},
	{
		"value": "355",
		"title": "Mixers"
	},
	{
		"value": "356",
		"title": "Juicer"
	},
	{
		"value": "358",
		"title": "Frying Machines"
	},
	{
		"value": "359",
		"title": "Other Household"
	},
	{
		"value": "364",
		"title": "Massage and body treatment"
	},
	{
		"value": "366",
		"title": "Health and Beauty"
	},
	{
		"value": "368",
		"title": "Oral care"
	},
	{
		"value": "375",
		"title": "Pet Care"
	},
	{
		"value": "376",
		"title": "Hair Care"
	},
	{
		"value": "384",
		"title": "Grooming and Hair Removal"
	},
	{
		"value": "391",
		"title": "Electric Commute"
	},
	{
		"value": "395",
		"title": "Accessories SDA"
	},
	{
		"value": "431",
		"title": "Mobile Phones"
	},
	{
		"value": "440",
		"title": "Wearables and Watches"
	},
	{
		"value": "445",
		"title": "Radio Transmitters/Receivers"
	},
	{
		"value": "447",
		"title": "Satelitte Navigators"
	},
	{
		"value": "487",
		"title": "Accessories Mobiles"
	},
	{
		"value": "490",
		"title": "Accessories Watches and Wearables"
	},
	{
		"value": "602",
		"title": "Cabinets"
	},
	{
		"value": "605",
		"title": "Taps"
	},
	{
		"value": "609",
		"title": "Handles & knobs"
	},
	{
		"value": "695",
		"title": "Kitchen Accessories"
	},
	{
		"value": "698",
		"title": "Spare parts"
	}
]`,
                },
              ]}
            >
              <div className="container mx-auto p-6 max-w-3xl">
                <div className="flex flex-col gap-6">
                  <div className="flex-1 overflow-auto">
                    <MessageList />
                  </div>

                  <QueryInput />
                </div>
              </div>
            </AiShoppingProvider>
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
