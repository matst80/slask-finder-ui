export type Suggestion = {
  match: string;
  hits: number;
};

export type Item = {
  id: string;
  title: string;
  props: ItemProps;
  values: Record<string, string | number>;
};

export type ItemProps = {
  advertisingText: string;
  badgeUrl: string;
  bp: string[];
  img: string;
  presaleDate: string;
  releaseDate: string;
  restock: string;
  saleStatus: string;
  tree: string[];
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
};

export type SearchResult = {
  items: Item[];
  totalHits: number;
  page: number;
  pageSize: number;
  facets?: Facets;
};
