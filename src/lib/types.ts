import { Impression } from "./datalayer/beacons";

export type Suggestion = {
  match: string;
  prefix: string;
  other: string[];
  hits: number;
};

export type ItemValues = {
  [key: string]: string | string[] | number | undefined;
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
  stock?: Stock;
};

export type ItemProperties = ItemValues;

export type UpdatedItem = ItemProps & {
  id: string;
  title: string;
  values: ItemProperties;
  stock?: Stock;
};

export type FieldValue<T> = {
  id: number;
  value: T;
};

export type ItemDetail = ItemProps & {
  id: number;
  title: string;
  values: ItemProperties;
  stock?: Stock;
};

export type Stock = Record<string, string>;

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
  valueType: string;
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
  buckets?: number[];
};

export type NumberFacet = BaseFacet & {
  selected: { min: number; max: number } | undefined;
  result: NumberResult;
};

export type KeyFacet = BaseFacet & {
  selected: string[] | string | undefined;
  result: KeyResult;
};

export type Facet = NumberFacet | KeyFacet;

export const isKeyResult = (
  result: KeyResult | NumberResult
): result is KeyResult =>
  result != null && (result as KeyResult).values != null;

export const isNumberResult = (
  result: KeyResult | NumberResult
): result is NumberResult =>
  result != null && (result as NumberResult).max != null;

export const isNumberFacet = (facet: Facet): facet is NumberFacet => {
  return isNumberResult(facet.result);
};

export const isKeyFacet = (facet: Facet): facet is KeyFacet => {
  return isKeyResult(facet.result);
};

export type Facets = Facet[];

export type PageResult = {
  totalHits: number;
  page: number;
  start: number;
  pageSize: number;
  end: number;
  sort?: string;
};

export type ItemResult = Item[];

export type NumberValue = { min: number; max: number };

export const isNumberValue = (value: unknown): value is NumberValue => {
  if (typeof value === "object" && value != null) {
    return typeof (value as NumberValue).min === "number";
  }
  return false;
};

export type NumberField = { id: number } & NumberValue;

export type KeyField = { id: number; value: string[] };

export type RelationMatch = {
  facetId: number;
  value?: number | string | string[];
};

export type RelationGroup = {
  key: string;
  groupId: number;
  name: string;
  requiredForItem: RelationMatch[];
  additionalQueries?: RelationMatch[];
  relations: Relation[];
};

type FacetValue = string | string[] | number;

const toNumber = (input: string | number): number | null => {
  if (typeof input === "number") {
    return input;
  }
  const nr = parseInt(input, 10);
  if (isNaN(nr)) {
    return null;
  }
  return nr;
};

export const relationValueConverters: Record<
  RelationConverter,
  (input: FacetValue) => NumberValue | { value: string[] } | undefined
> = {
  none: (v: FacetValue) => ({
    value: Array.isArray(v) ? v : [String(v)],
  }),
  valueToMax: (v: FacetValue) => {
    if (Array.isArray(v)) {
      return undefined;
    }
    const max = toNumber(v);
    if (max == null) {
      return undefined;
    }
    return { min: 0, max };
  },
  valueToMin: (v: FacetValue) => {
    if (Array.isArray(v)) {
      return undefined;
    }
    const min = toNumber(v);
    if (min == null) {
      return undefined;
    }
    return { min, max: 999999999 };
  },
};

export type RelationConverter = "none" | "valueToMin" | "valueToMax";

export type Relation = {
  fromId: number;
  toId: number;
  converter: RelationConverter;
};

export type Field = NumberField | KeyField;

export type FilteringQuery = {
  query?: string;
  stock?: string[];
  string?: KeyField[];
  range?: NumberField[];
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
  valueType?: string;
  fieldType?: string;
  name: string;
  prio?: number;
  categoryLevel?: number;
  sort?: number;
  linkedId?: number;
  count: number;
  description?: string;
  searchable?: boolean;
  hide?: boolean;
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

export type ValueMatch = FieldMatch | PropertyMatch;

export type FieldMatch = {
  source: "fieldId";
  fieldId: number;
};

export type PropertyMatch = {
  source: "property";
  property: string;
};

export type MatchRule = ValueMatch & {
  match: string | boolean | number;
  value?: number;
  invert?: boolean;
  valueIfNotMatch?: number;
  $type: "MatchRule";
};

export type NumberLimitRule = ValueMatch & {
  multiplier?: number;
  limit?: number;
  comparator?: ">" | "<" | "<=";
  value?: number;
  valueIfNotMatch?: number;
  $type: "NumberLimitRule";
};

export type DiscountRule = {
  multiplier?: number;
  valueIfMatch?: number;
  $type: "DiscountRule";
};
export type OutOfStockRule = {
  noStoreMultiplier?: number;
  noStockValue?: number;
  $type: "OutOfStockRule";
};
export type PercentMultiplierRule = ValueMatch & {
  multiplier?: number;
  min?: number;
  max?: number;
  $type: "PercentMultiplierRule";
};
export type RatingRule = {
  multiplier?: number;
  subtractValue?: number;
  valueIfNoMatch?: number;
  $type: "RatingRule";
};
export type AgedRule = ValueMatch & {
  hourMultiplier?: number;
  $type: "AgedRule";
};
export type Rule =
  | MatchRule
  | DiscountRule
  | OutOfStockRule
  | NumberLimitRule
  | PercentMultiplierRule
  | AgedRule
  | RatingRule;
export type Rules = Rule[];

export const ruleTypes = [
  "MatchRule",
  "DiscountRule",
  "OutOfStockRule",
  "NumberLimitRule",
  "PercentMultiplierRule",
  "RatingRule",
  "AgedRule",
] satisfies RuleType[];

export type RuleType = Rule["$type"];

export const itemProperties = [
  "Url",
  "Disclaimer",
  "ReleaseDate",
  "SaleStatus",
  "MarginPercent",
  "PresaleDate",
  "Restock",
  "AdvertisingText",
  "Img",
  "BadgeUrl",
  "EnergyRating",
  "BulletPoints",
  "LastUpdate",
  "Created",
  "Buyable",
  "Description",
  "BuyableInStore",
  "BoxSize",
  "CheapestBItem",
  "AItem",
  "ArticleType",
  "StockLevel",
  "Stock",
  "Id",
  "Sku",
  "Title",
];

export type FieldListItem = {
  id: number;
  name: string;
  itemCount?: number;
  lastSeen?: number;
  created?: number;
  type?: number;
  description: string;
  purpose?: string[];
};

type BaseContentRecord = {
  id: string;
  name: string;
  description: string;
  url?: string;
  image?: string;
  picture?: CmsPicture;
};

export type CmsPicture = {
  alt: string;
  id: string;
  isExternalPicture: boolean;
  name: string;
  responsiveViewType: string;
  uris: CmsUri[];
};

export interface CmsUri {
  breakpoint: string;
  images: CmsImage[];
  sizes: string;
}

export interface CmsImage {
  height: number;
  imageURL: string;
  width: number;
}

type StoreContentRecord = BaseContentRecord & {
  lat?: string;
  lng?: string;
};

export const isStoreContentRecord = (
  record: ContentRecord
): record is StoreContentRecord => {
  return (
    (record as StoreContentRecord).lat != null ||
    (record as StoreContentRecord).lng != null
  );
};

type CmsContentRecord = BaseContentRecord;

type SellerContentRecord = BaseContentRecord;

export type ContentRecord =
  | StoreContentRecord
  | CmsContentRecord
  | SellerContentRecord;

export type Popularity = {
  value: number;
};

export type PopularQuery = {
  query: string;
  score: number;
  facets: PopularFacet[];
};

export type PopularFacet = {
  id: number;
  score: number;
  values: { score: number; value: string }[];
};
