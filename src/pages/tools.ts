import fuzzysort from "fuzzysort";
import {
  getCompatible,
  getRawData,
  getRelated,
  getYourPopularItems,
} from "../lib/datalayer/api";
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
        //$schema: "http://json-schema.org/draft-07/schema#",
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
        //$schema: "http://json-schema.org/draft-07/schema#",
      },
    },
  },
  {
    type: "function",
    function: {
      name: "similar",
      description: "Get similar products",
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
        //$schema: "http://json-schema.org/draft-07/schema#",
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compatible",
      description: "Get compatible products and accessories",
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
        //$schema: "http://json-schema.org/draft-07/schema#",
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
      name: "popular_items",
      description: "Get popular items",
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

const convertProperties =
  (facets: Record<string | number, FacetListItem>, all = false) =>
  (values: Item["values"]) => {
    let product_type = "";
    let brand = "";
    let price = "";
    const properties = Object.entries(values)
      .map(([id, value]) => {
        if (id === "2") {
          brand = String(value);
        }
        if (id === "31158") {
          product_type = String(value);
        }
        if (id === "4") {
          price = `${Number(value) / 100} SEK`;
        }
        const facet = facets?.[id];

        if (facet && (facet.isKey || all)) {
          return {
            name: facet.name,
            //id: facet.id,
            value: value,
          };
        }
        return null;
      })
      .filter(isDefined);
    return {
      properties,
      price,
      product_type,
      brand,
    };
  };

const convertItemSimple = (facets: Record<string | number, FacetListItem>) => {
  const convertProps = convertProperties(facets, false);
  return ({ values, bp, id, sku, title, img }: Item) => {
    const { properties, product_type, brand, price } = convertProps(values);

    return {
      title,
      id,
      sku,
      price,
      product_type,
      brand,
      properties,
      bulletPoints: bp,
      img: makeImageUrl(img),
    };
  };
};

const convertDetails = (facets: Record<string | number, FacetListItem>) => {
  const convertProps = convertProperties(facets, true);
  return ({ values, bp, id, sku, title, img, description }: Item) => {
    const { properties, product_type, brand, price } = convertProps(values);

    return {
      title,
      id,
      sku,
      description,
      product_type,
      price,
      brand,
      properties,
      bulletPoints: bp,
      img: makeImageUrl(img),
    };
  };
};

const getProduct = async (
  { id }: { id: string },
  facets?: Record<string | number, FacetListItem>
) => {
  const convertItem = convertDetails(facets ?? {});
  return await getRawData(id).then((data) => {
    return JSON.stringify(convertItem(data));
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
        threshold: 0.9,
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
        threshold: 0.9,
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
  const convertItem = convertItemSimple(facets ?? {});
  for (const line of data.split("\n")) {
    if (line === "") {
      break;
    }
    const item = convertItem(JSON.parse(line) as Item);

    items.push(item);
  }
  return JSON.stringify(items);
};

const getCompatibleItems = async (
  { id }: { id: number },
  facets?: Record<string | number, FacetListItem>
) => {
  const convertItem = convertItemSimple(facets ?? {});
  return getCompatible(id).then((data) => {
    const items = data.map(convertItem);
    return JSON.stringify(items);
  });
};

const getSimilarItems = async (
  { id }: { id: number },
  facets?: Record<string | number, FacetListItem>
) => {
  const convertItem = convertItemSimple(facets ?? {});
  return getRelated(id).then((data) => {
    const items = data.map(convertItem);
    return JSON.stringify(items);
  });
};

const getPopularItems = async (
  _: {},
  facets?: Record<string | number, FacetListItem>
) => {
  const convertItem = convertItemSimple(facets ?? {});
  return getYourPopularItems().then((items) => {
    return JSON.stringify(items.map(convertItem));
  });
};

export const availableFunctions = {
  search: searchProducts,
  get_product: getProduct,
  compatible: getCompatibleItems,
  similar: getSimilarItems,
  popular_items: getPopularItems,
  get_brands: getPropertyValues("2", "possible brands: "),
  get_product_types: getPropertyValues("31158", "possible product types: "),
  open_product: async ({ id }: { id: string }) => {
    window.open("/product/" + id, "_blank");
    return "ok";
  },
};
