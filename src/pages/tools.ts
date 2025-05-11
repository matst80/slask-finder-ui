import fuzzysort from "fuzzysort";
import { getRawData } from "../lib/datalayer/api";
import { FacetListItem, Item } from "../lib/types";
import { isDefined, makeImageUrl } from "../utils";

export const tools = [
  {
    type: "function",
    function: {
      name: "search",
      description:
        "Search for products, responds with a list of products in json format with. show title, price and relevant properties to the user",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "query to search for products. use broad terms, never natural language",
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return",
          },
          brand: {
            type: "string",
            description: `possible values found with get_brands, dont make up values for this!!`,
          },
          product_type: {
            type: "string",
            description: `possible values found with get_product_types, dont make up values for this!!`,
          },
        },
        required: ["query", "maxResults"],
        $schema: "http://json-schema.org/draft-07/schema#",
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product",
      description: "Get product details",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description:
              "the product id to get details for, can be found in the search results",
          },
        },
        required: ["id"],
        $schema: "http://json-schema.org/draft-07/schema#",
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_product",
      description: "Open product details",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description:
              "the product id to get details for, can be found in the search results",
          },
        },
        required: ["id"],
        $schema: "http://json-schema.org/draft-07/schema#",
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_brands",
      description: "Get available brands",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        $schema: "http://json-schema.org/draft-07/schema#",
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_types",
      description: "Get available product types",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        $schema: "http://json-schema.org/draft-07/schema#",
      },
    },
  },
];

const getProduct = async (
  { id }: { id: string },
  facets?: Record<string | number, FacetListItem>
) => {
  return await getRawData(id).then((data) => {
    const { values, ...rest } = data;
    const properties = Object.entries(values)
      .map(([id, value]) => {
        if (id === "2") {
          return {
            name: "brand",
            value: value,
          };
        }
        if (id === "31158") {
          return {
            name: "product_type",
            value: value,
          };
        }
        const facet = facets?.[id];
        if (facet && !facet.hide) {
          return {
            name: facet.name,
            //id: facet.id,
            value: value,
          };
        }
        return null;
      })
      .filter(Boolean);
    return JSON.stringify({ ...rest, properties });
  });
};

const getPropertyValues = (id: string, description: string) => async () => {
  return await fetch("/api/values/" + id).then(async (res) => {
    const items = await res.json();
    return `${description} ${items.join("; ")}`;
  });
};

const searchProducts = async (
  args: {
    query: string;
    maxResults?: number;
    brand?: string;
    product_type?: string;
  },
  facets?: Record<string | number, FacetListItem>
) => {
  const { query, maxResults = 20, brand, product_type } = args;

  const qs = new URLSearchParams({
    page: "0",
    query: query.length > 0 ? query : "*",
    size: String(maxResults),
  });
  if (brand) {
    await fetch("/api/values/2").then(async (res) => {
      const items = await res.json();
      const matchingBrand = fuzzysort.go(brand, items, {
        limit: 1,
        threshold: 0.6,
      })[0]?.target;
      if (!matchingBrand) {
        console.log("no matching brand found", brand);
      } else {
        qs.append("str", `2:${matchingBrand}`);
      }
    });
  }
  if (product_type) {
    await fetch("/api/values/31158").then(async (res) => {
      const items = await res.json();
      const matchingProductType = fuzzysort.go(product_type, items, {
        limit: 1,
        threshold: 0.6,
      })[0]?.target;
      if (!matchingProductType) {
        console.log("no matching brand found", brand);
      } else {
        qs.append("str", `31158:${matchingProductType}`);
      }
    });
  }
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
    const { values, bp, id, sku, title, img } = JSON.parse(line) as Item;

    const properties = Object.entries(values)
      .map(([id, value]) => {
        if (id === "2") {
          return {
            name: "brand",
            value: value,
          };
        }
        if (id === "31158") {
          return {
            name: "product_type",
            value: value,
          };
        }
        const facet = facets?.[id];

        if (facet && facet.isKey) {
          return {
            name: facet.name,
            //id: facet.id,
            value: value,
          };
        }
        return null;
      })
      .filter(isDefined);

    items.push({
      title,
      id,
      sku,
      properties,
      bulletPoints: bp,
      img: makeImageUrl(img),
    });
  }
  return JSON.stringify(items);
};

export const availableFunctions = {
  search: searchProducts,
  get_product: getProduct,
  get_brands: getPropertyValues("2", "possible brands: "),
  get_product_types: getPropertyValues("31158", "possible product types: "),
  open_product: async ({ id }: { id: string }) => {
    window.open("/product/" + id, "_blank");
    return "ok";
  },
};
