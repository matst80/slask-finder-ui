export type Suggestion = {
  match: string;
  other: string[];
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

export type FieldValue<T> = {
  id: number;
  value: T;
};

export type ItemDetail = ItemProps & {
  id: number;
  title: string;
  values: FieldValue<string>[];
  numberValues: FieldValue<number>[];
  integerValues: FieldValue<number>[];
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
  disclaimer?: string;
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

export type BaseFacet = {
  id: number;
  type: string;
  name: string;
  prio?: number;
  description: string;
};

export type KeyFacet = BaseFacet & {
  categoryLevel?: number;
  values: Record<string, number>;
};

export type NumberFacet = BaseFacet & {
  min: number;
  max: number;
  count: number;
};

export type Facets = {
  fields: KeyFacet[];
  integerFields: NumberFacet[];
  numberFields: NumberFacet[];
};

export type FacetResult = {
  totalHits: number;
  facets?: Facets;
};

export type ItemResult = Item[];

export type NumberField = { id: number; min: number; max: number };

export type KeyField = { id: number; value: string };

export type Field = NumberField | KeyField;

export type FilteringQuery = {
  query?: string;
  stock: string[];
  string?: KeyField[];
  number?: NumberField[];
  integer?: NumberField[];
};

export type ItemsQuery = FilteringQuery & {
  page?: number;
  sort?: string;
  pageSize?: number;
};

export type FacetQuery = FilteringQuery;

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
export type FacetListItem = {
  id: number;
  type?: string;
  name: string;
  prio?: number;
  linkedId?: number;
  count: number;
  description?: string;
};
