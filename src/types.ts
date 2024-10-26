import { Impression } from "./datalayer/beacons";

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

export type ItemProperties = ItemValues;

export type UpdatedItem = ItemProps & {
  id: string;
  title: string;
  values: ItemProperties;
  stock?: Stock[];
};

export type FieldValue<T> = {
  id: number;
  value: T;
};

export type ItemDetail = ItemProps & {
  id: number;
  title: string;
  values: ItemProperties;
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
  categoryLevel?: number;
};

export type KeyResult = {
  values: Record<string, number>;
};

export type NumberResult = {
  min: number;
  max: number;
  count: number;
};

export type NumberFacet = BaseFacet & {
  result: NumberResult;
};

export type KeyFacet = BaseFacet & {
  result: KeyResult;
};

export type Facet = NumberFacet | KeyFacet;

export const isKeyResult = (
  result: KeyResult | NumberResult,
): result is KeyResult =>
  result != null && (result as KeyResult).values != null;

export const isNumberResult = (
  result: KeyResult | NumberResult,
): result is NumberResult =>
  result != null && (result as NumberResult).max != null;

export const isNumberFacet = (facet: Facet): facet is NumberFacet => {
  return isNumberResult(facet.result);
};

export const isKeyFacet = (facet: Facet): facet is KeyFacet => {
  return isKeyResult(facet.result);
};

export type Facets = Facet[];

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
  fieldType: string;
  name: string;
  prio?: number;
  sort?: number;
  linkedId?: number;
  count: number;
  description?: string;
};

export type Promotion = {
  id: number;
  name: string;
  description: string;
  max_amount?: number;
  articles: PromotionArticle[];
};

export type PromotionArticle = {
  sku: string;
  actions: PromotionAction[];
};

export type PromotionAction = {
  type: string;
  value: number;
  market?: string;
};

export type BaseEvent = {
  session_id: string;
  ts: number;
};

export type TrackedEvent =
  | CartEvent
  | ImpressionEvent
  | SearchEvent
  | ClickEvent
  | ActionEvent;

export type ActionEvent = BaseEvent & {
  event: 6;
  action: string;
  reason: string;
};

export type CartEvent = BaseEvent & {
  event: 3 | 4;
  item: number;
  quantity: number;
};

export type SearchEvent = BaseEvent & {
  event: 1;
  query: string;
  string: KeyField[];
  number: NumberField[];
  integer: NumberField[];
};

export type ImpressionEvent = BaseEvent & {
  event: 5;
  items: Impression[];
};

export type ClickEvent = BaseEvent & {
  event: 2;
  item: number;
  position: number;
};

export type SessionData = BaseEvent & {
  user_agent?: string;
  ip?: string;
  language?: string;
  events: TrackedEvent[];
};

export type MetricsData = [Date, number];

export type Series = {
  label: string;
  data: MetricsData[];
};

export type MetricWithValues<TMetric = Record<string, string>> = {
  metric: TMetric;
  data: MetricsData[];
};

export type PrometheusEntry = {
  metric: Record<string, string>;
  values: [number, string][];
};

export type PrometheusResponse = {
  status: string;
  data: {
    result: PrometheusEntry[];
  };
};
