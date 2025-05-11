import { FacetListItem } from "../lib/types";

export const tools = [
  {
    type: "function",
    function: {
      name: "search",
      description: "Find products based on a query",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Query to search for, keep short and simple, you can make multiple queries is needed, request a higher number of results if needed",
          },
          maxResults: {
            type: "integer",
            description: "Maximum number of results to return",
          },

          brand: {
            type: "string",
            description: `can be found in the result properties with id 2`,
          },
          product_type: {
            type: "string",
            description: `can be found in the result properties with id 31158`,
          },
        },
        required: ["query", "maxResults"],
        $schema: "http://json-schema.org/draft-07/schema#",
      },
    },
  },
];

const searchProducts = async (
  args: { query: string; maxResults?: number },
  facets?: Record<string | number, FacetListItem>
) => {
  const { query, maxResults = 50 } = args;
  console.log("searchProducts", args);
  const qs = new URLSearchParams({
    page: "0",
    query,
    size: String(maxResults),
  });
  console.log("qs", qs.toString());
  const data = await fetch(`/api/stream?${qs}`).then((res) => {
    if (res.ok) {
      return res.text();
    } else {
      throw new Error("Network response was not ok");
    }
  });
  const items = [];
  for (const line of data.split("\n")) {
    if (line === "") {
      break;
    }
    const { stock, values, aItem, boxSize, bItem, bp, ...rest } =
      JSON.parse(line);

    const properties = Object.entries(values)
      .map(([id, value]) => {
        const facet = facets?.[id];
        if (
          facet &&
          !facet.hide &&
          (facet.categoryLevel == null || facet.categoryLevel === 0)
        ) {
          return {
            name: facet.name,
            id: facet.id,
            value: value,
          };
        }
        return null;
      })
      .filter(Boolean);

    items.push({ ...rest, properties, bulletPoints: bp });
  }
  return `Here is the resuls in json: \n${JSON.stringify(
    items
  )}\nUse the information to give the user relevant results based on the query. be sure to include the product title, price`;
};

export const availableFunctions = {
  search: searchProducts,
};
