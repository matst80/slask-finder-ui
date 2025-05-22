import fuzzysort from "fuzzysort";
import {
  getCompatible,
  getRawData,
  getRelated,
  getYourPopularItems,
} from "../lib/datalayer/api";
import { FacetListItem, Item } from "../lib/types";
import { isDefined, makeImageUrl } from "../utils";
import { addToCart, getCart, removeFromCart } from "../lib/datalayer/cart-api";
import { addProductToCompare } from "../lib/hooks/CompareProvider";

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
          q: {
            type: "string",
            description:
              "query to search for. Not natural language, example: 'tv', 'headset', 'cpu' or 'iphone.",
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return",
          },
          brand: {
            type: "string",
            description: `possible values found with get_brands, dont make up values!`,
          },
          product_type: {
            type: "string",
            description: `possible values found with get_product_types, dont make up values!`,
          },
        },
        required: ["q", "maxResults"],
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
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_shipping",
      description: "Get shipping options for cart",
      parameters: {
        type: "object",
        properties: {
          zip: {
            type: "string",
            description:
              "postal code to get shipping options for, must be a valid swedish postal code",
          },
        },
        required: ["zip"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_shipping_option",
      description: "Select shipping for cart",
      parameters: {
        type: "object",
        properties: {
          deliveryOptionId: {
            type: "string",
            description:
              "delivery option id to get details for, can be found in the get_shipping response",
          },
        },
        required: ["deliveryOptionId"],
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
              "the product id to get details for, must come from the product answer",
          },
        },
        required: ["id"],
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
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Add product to cart",
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
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_from_cart",
      description: "Remove item from cart",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description:
              "the id of the item to remove from the cart, can be found in the get_cart response",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_cart",
      description: "Show cart contents",
    },
  },
  {
    type: "function",
    function: {
      name: "checkout",
      description: "Checkout your cart",
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_compare",
      description: "Add product to comparison list",
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
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_brands",
      description: "Get available brands",
    },
  },
  {
    type: "function",
    function: {
      name: "popular_items",
      description: "Get popular items",
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_types",
      description: "Get available product types",
    },
  },
];

const convertProperties =
  (facets?: FacetMap, all = false) =>
  (values: Item["values"]) => {
    let product_type = "";
    let brand = "";
    let price = "";
    const properties = Object.fromEntries(
      Object.entries(values)
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

          if (facet && (facet.isKey || all) && value != null) {
            if (facet.fieldType == "fps" || facet.hide) {
              return null;
            }
            return [
              facet.name,
              Array.isArray(value) ? value.join(", ") : String(value),
            ];
            // return {
            //   name: facet.name,
            //   //id: facet.id,
            //   value: value,
            // };
          }
          return null;
        })
        .filter(isDefined)
    );
    return {
      properties,
      price,
      product_type,
      brand,
    };
  };

export const convertItemSimple = (facets?: FacetMap) => {
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

export const convertDetails = (facets?: FacetMap) => {
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
  { id }: FunctionArgs,
  facets?: Record<string | number, FacetListItem>
) => {
  if (id == null) {
    return "product id argument is missing";
  }
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

type SearchArgs = {
  q: string;
  maxResults?: number;
  brand?: string;
  product_type?: string;
};

const getSearchArguments = (args: unknown): SearchArgs => {
  if (args == null) {
    return {
      q: "*",
      maxResults: 20,
    };
  }
  if (typeof args === "string") {
    return {
      q: args,
      maxResults: 20,
    };
  }
  if (typeof args === "object" && !Array.isArray(args)) {
    if ("properties" in args) {
      console.log("props", args.properties);
      const { q, product_type, maxResults } = args.properties as {
        [key: string]: { value: any };
      };
      return {
        q: q.value ?? "*",
        product_type: product_type.value,
        maxResults: maxResults.value ?? 20,
      };
    }
    const { q, maxResults, brand, product_type } = args as SearchArgs;
    return {
      q: q ?? "*",
      maxResults: maxResults ?? 20,
      brand,
      product_type,
    };
  }

  return {
    q: "*",
    maxResults: 20,
  };
};

const searchProducts = async (
  args: unknown,
  facets?: Record<string | number, FacetListItem>
) => {
  const { q, maxResults = 20, brand, product_type } = getSearchArguments(args);

  const qs = new URLSearchParams({
    page: "0",
    query: q.length > 0 ? q : "*",
    size: String(maxResults),
  });
  if (brand) {
    await fetch("/api/values/2").then(async (res) => {
      const items = (await res.json()) as string[];
      const matchingBrand = fuzzysort.go(brand, items, {
        limit: 3,
        threshold: 0.8,
      })[0]?.target;
      if (!matchingBrand) {
        console.log("no matching brand found", brand);
      } else {
        console.log("matching brand", matchingBrand, "for", brand);
        qs.append("str", `2:${matchingBrand}`);
      }
    });
  }
  if (product_type) {
    await fetch("/api/values/31158").then(async (res) => {
      const items = (await res.json()) as string[];

      const matchingProductType = fuzzysort.go(product_type, items, {
        limit: 3,
        threshold: 0.8,
      })[0]?.target;
      if (!matchingProductType) {
        console.log("no matching brand found", brand);
      } else {
        console.log(
          "matching product type",
          matchingProductType,
          "for",
          product_type
        );
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

type FacetMap = Record<string | number, FacetListItem>;

const getCompatibleItems: ToolFunction = async ({ id }, facets) => {
  if (id == null) {
    return "product id argument is missing";
  }
  const convertItem = convertItemSimple(facets ?? {});
  return getCompatible(Number(id)).then((data) => {
    const items = data.map(convertItem);
    return JSON.stringify(items);
  });
};

const getSimilarItems: ToolFunction = async ({ id }, facets) => {
  if (id == null) {
    return "product id argument is missing";
  }
  const convertItem = convertItemSimple(facets ?? {});
  return getRelated(Number(id)).then((data) => {
    const items = data.map(convertItem);
    return JSON.stringify(items);
  });
};

const getPopularItems: ToolFunction = async (_, facets) => {
  const convertItem = convertItemSimple(facets ?? {});
  return getYourPopularItems().then((items) => {
    return JSON.stringify(items.map(convertItem));
  });
};

type ToolFunction<T extends FunctionArgs = FunctionArgs> = (
  args: T,
  facets?: FacetMap
) => Promise<string>;

type FunctionArgs = { id?: number | string; [key: string]: unknown };

export const availableFunctions: Record<
  (typeof tools)[number]["function"]["name"],
  ToolFunction
> = {
  search: searchProducts,
  get_product: getProduct,
  compatible: getCompatibleItems,
  similar: getSimilarItems,
  popular_items: getPopularItems,
  get_cart: async () => {
    const cart = getCart();
    return JSON.stringify(cart);
  },
  get_shipping: async ({ zip }) => {
    const cart = await getCart();
    if (zip == null) {
      return "postal code argument is missing";
    }
    if (cart == null) {
      return "cart is empty";
    }
    return fetch(`/api/shipping-options/${cart.id}/${zip}`).then((response) =>
      response.text()
    );
  },
  set_shipping_option: async ({ deliveryOptionId }) => {
    const cart = await getCart();
    if (cart == null) {
      return "cart is empty";
    }
    if (deliveryOptionId == null) {
      return "delivery option id argument is missing";
    }
    return await fetch(`/api/shipping-options/${cart.id}/${deliveryOptionId}`, {
      method: "PUT",
    }).then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error("Network response was not ok");
      }
    }
  },
  remove_from_cart: async ({ id }) => {
    if (id == null) {
      return "product id argument is missing";
    }
    return removeFromCart({ id: Number(id) }).then((res) => {
      if (res) {
        return "Your cart now looks like this: " + JSON.stringify(res);
      } else {
        return "Failed to remove from cart";
      }
    });
  },
  checkout: async () => {
    window.open(
      window.location.origin + "/checkout",
      "target=_blank,menubar=1,resizable=1,width=350,height=500"
    );
    return "user redirected to checkout";
  },
  add_to_compare: async ({ id }, facets) => {
    if (id == null) {
      return "product id argument is missing";
    }
    const convertItem = convertItemSimple(facets);
    return getRawData(id)
      .then((data) => {
        const items = addProductToCompare(data);
        return `Items in compare: ${items.map(convertItem).join(", ")}`;
      })
      .catch((e) => {
        console.error("Error adding to compare", e);
        return "Failed to add to compare";
      });
  },
  add_to_cart: async ({ id }) => {
    if (id == null) {
      return "product id argument is missing";
    }
    return addToCart({ sku: String(id), quantity: 1 }).then((res) => {
      if (res) {
        return "Your cart now looks like this: " + JSON.stringify(res);
      } else {
        return "Failed to add to cart";
      }
    });
  },
  get_brands: getPropertyValues("2", "possible brands: "),
  get_product_types: getPropertyValues("31158", "possible product types: "),
  open_product: async ({ id }) => {
    window.open("/product/" + id, "_blank");
    return "ok";
  },
};
