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

export type Sort = "popular" | "price" | "price_desc";

export type Item = ItemProps & {
  id: string;
  title: string;
  values: ItemValues;
};

export type ItemProps = {
  advertisingText: string;
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
  name: string;
  description: string;
  values: Record<string, number>;
};

export type NumberFacet = {
  id: number;
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
  page: number;
  pageSize: number;
  facets?: Facets;
};

export type Query = {
  query?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
  string?: { id: number; value: string }[];
  number?: { id: number; min: number; max: number }[];
  integer?: { id: number; min: number; max: number }[];
};
