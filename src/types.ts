export type Suggestion = {
  match: string;
  hits: number;
};

export type ItemValues = {
  [key: string]: string | number | undefined;
  "4": number;
  "5"?: number;
  "8"?: number;
};

export const Sort = {
  POPULAR_SORT: "popular",
  PRICE_SORT: "price",
  UPDATED_SORT: "updated",
  CREATED_SORT: "created",
  UPDATED_DESC_SORT: "updated_desc",
  CREATED_DESC_SORT: "created_desc",
};

export type Category = {
  value: string;
  children?: Category[];
};

export type Sort =
  | typeof Sort.POPULAR_SORT
  | typeof Sort.PRICE_SORT
  | typeof Sort.UPDATED_SORT
  | typeof Sort.CREATED_SORT
  | typeof Sort.UPDATED_DESC_SORT
  | typeof Sort.CREATED_DESC_SORT;

export type Item = ItemProps & {
  id: string;
  title: string;
  values: ItemValues;
  stock?: Stock[];
};

export type Stock = {
  id: string;
  level: string;
};

export type ItemProps = {
  created?: number;
  lastUpdate?: number;
  advertisingText: string;
  buyable: boolean;
  buyableInStore: boolean;
  stockLevel?: string;
  badgeUrl: string;
  bp: string;
  img: string;
  presaleDate: string;
  releaseDate: string;
  restock: string;
  saleStatus: string;
  //tree: string[];
  url: string;
};

export type KeyFacet = {
  id: number;
  type: string;
  name: string;
  description: string;
  values: Record<string, number>;
};

export type NumberFacet = {
  id: number;
  type: string;
  name: string;
  description: string;
  min: number;
  max: number;
  count: number;
};

export type Facets = {
  fields: KeyFacet[];
  integerFields: NumberFacet[];
  numberFields: NumberFacet[];
};

export type SearchResult = {
  items: Item[];
  totalHits: number;
  //page: number;
  pageSize: number;
  facets?: Facets;
};

export type Query = {
  query?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
  stock?: string;
  string?: { id: number; value: string }[];
  number?: { id: number; min: number; max: number }[];
  integer?: { id: number; min: number; max: number }[];
};

export type Cart = {
  id: string;
  items: CartItem[];
  total_price: number;
};

export type CartItem = {
  id: number;
  sku: string;
  title: string;
  price: number;
  original_price?: number;
  image: string;
  qty: number;
};

export type Price =
  | {
      isDiscounted: false;
      current: number;
    }
  | {
      isDiscounted: true;
      current: number;
      original: number;
      discount: number;
    };
