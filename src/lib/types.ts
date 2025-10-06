export type BaseEcomEvent = {
  item_id: string | number;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  index: number;
  price?: number;
  quantity?: number;
};

export type Suggestion = {
  match: string;
  prefix: string;
  other: string[];
  hits: number;
};

export type ItemValues = {
  [key: string]: string | string[] | number | undefined;
  "2": string;
  "3"?: string;
  "4": number;
  "5"?: number;
  "8"?: number;
  "9"?: string;
  "10"?: string;
  "11"?: string;
  "12"?: string;
  "13"?: string;
  "14"?: string;
  "20"?: string;
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
  id: number;
  title: string;
  values: ItemValues;
  stock?: Stock;
};

export const ValueMap = {
  StockLevel: 3,
  Price: 4,
  OrgPrice: 5,
  Rating: 6,
  NumberOfRatings: 7,
  SoldBy: 9,
  ProductType: 31158,
  Model: 30879,
  Category1: 10,
  Category2: 11,
  Category3: 12,
  Category4: 13,
  Grade: 20,
} as const;

export type ItemProperties = ItemValues;

export type UpdatedItem = ItemProps & {
  id: number;
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
  sku: string;
  title: string;
  values: ItemProperties;
  stock?: Stock;
};

export type Stock = Record<string, string>;

export type ItemProps = {
  sku: string;
  created?: number;
  lastUpdate?: number;
  advertisingText: string;
  buyable: boolean;
  disclaimer?: string;
  buyableInStore: boolean;
  description?: string;
  //stockLevel?: string;
  badgeUrl: string;
  bp: string;
  mp?: number;
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

export type PageResult = {
  totalHits: number;
  page: number;
  start: number;
  pageSize: number;
  end: number;
  sort?: string;
};

export type ItemResult = Item[];

export const isNumberValue = (value: unknown): value is NumberValue => {
  if (typeof value === "object" && value != null) {
    return typeof (value as NumberValue).min === "number";
  }
  return false;
};
export type KeyValue = string | string[];

export type NumberValue = { min: number; max: number };

export type NumberField = { id: number } & NumberValue;

export type KeyField = { id: number; exclude?: boolean; value: string[] };

export type RelationMatch = {
  facetId: number;
  exclude?: boolean;
  value?: number | string | string[];
};

export type RelationGroup = {
  key: string;
  groupId: number;
  name: string;
  include_ids: number[];
  exclude_ids: number[];
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
  filter?: string;
  page?: number;
  sort?: string;
  pageSize?: number;
};

export type ResultTransformer<Input, Output> = (input: Input) => Output;

export type FacetQuery = FilteringQuery;

export type CartDelivery = {
  id: string;
  provider: string;
  items: number[];
  price: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  deliveries: CartDelivery[];
  processing: boolean;
  paymentInProgress: boolean;
  orderReference?: string;
  paymentStatus?: string;
  totalPrice: number;
  totalTax: number;
  totalDiscount: number;
};

export type HistoryQuery = ItemsQuery & { key: string };

export type CartItem = {
  id: number;
  itemId: string; // maybe
  image: string;
  name: string;
  outlet?: string;
  sellerId?: string;
  sellerName?: string;
  brand?: string;
  category?: string;
  category2?: string;
  category3?: string;
  category4?: string;
  category5?: string;
  orgPrice: number;
  price: number;
  qty: number;
  sku: string;
  stock: number;
  tax: number;
  type: string;
};

export type ItemPrice =
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
  isKey?: boolean;
  internal?: boolean;
  groupId?: number;
};

export type Funnel = {
  name: string;
  steps: Record<string, FunnelStep>;
};

export type FunnelStep = {
  name: string;
  events: FunnelEvent[];
  filter: FunnelFilter[];
};

export type FunnelFilter = {
  name: string;
  event_type: string;
  match_data: string;
  matcher: string;
};

export type FunnelEvent = {
  session_id: string;
  ts: number;
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
  id: string;
  ts: number;
  last_update: number;
};

export type TrackedEvent =
  | CartEvent
  | ImpressionEvent
  | SearchEvent
  | ClickEvent
  | CheckoutEvent
  | ActionEvent
  | SuggestionEvent;

export type ActionEvent = BaseEvent & {
  event: 6;
  item?: ItemEvent;
  action: string;
  reason: string;
};

export type CartEvent = BaseEvent &
  ItemEvent & {
    event: 3 | 4 | 11 | 15;
    type?: string;
    quantity: number;
  };

export type CheckoutEvent = BaseEvent & {
  event: 14;
  items: ItemEvent[];
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
  items: ItemEvent[];
};

export type ItemEvent = {
  id: number;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  index: number;
  price?: number;
};

export type ClickEvent = BaseEvent &
  ItemEvent & {
    event: 2;
  };

export type SessionData = BaseEvent & {
  user_agent?: string;
  ip?: string;
  language?: string;
  variations?: Record<string, unknown>;
  groups?: Record<string, number>;
  events?: TrackedEvent[];
};

export type SessionListData = BaseEvent & {
  user_agent?: string;
  ip?: string;
  language?: string;
  events_count?: number;
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

export type NumberComparitor = ">" | "<" | "<=";

export type NumberLimitRule = ValueMatch & {
  multiplier?: number;
  limit?: number;
  comparator?: NumberComparitor;
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
  record: ContentRecord,
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

export type FacetGroup = {
  id: number;
  name: string;
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

export type SuggestionEvent = BaseEvent & {
  event: 7;
  value: string;
  results: number;
  suggestions: number;
};

export interface BaseTranslationType {
  [key: string]: string | BaseTranslationType;
}

export type PathInto<T extends BaseTranslationType> = keyof {
  [K in keyof T as T[K] extends string
    ? K
    : T[K] extends BaseTranslationType
      ? `${K & string}.${PathInto<T[K]> & string}`
      : never]: string;
};
export type StockData = {
  stock?: Stock;
  stockLevel?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
};

export type UserUpdateRequest = {
  name?: string;
  email?: string;
  displayName?: string;
  isAdmin?: boolean;
};

export const CollectAtStorePickupType = {
  CollectAtStore: "CollectAtStore",
  Ship2Store: "Ship2Store",
  InStoreOnly: "InStoreOnly",
} as const;
export type CollectAtStorePickupType = ValueOf<typeof CollectAtStorePickupType>;

export type MapAddress = {
  street?: string;
  nr?: string;
  zip?: string;
  city?: string;
  location: GeoLocation;
};

export type MapLocation = {
  id: string;
  displayName: string;
  address: MapAddress;
  url?: string;
  distance?: number;
  isHighlighted?: boolean;
};

export interface Store extends MapLocation {
  openHours: OpenHours;
  shipToStore: boolean;
  collectAtStore: CollectAtStore | null;
  onlineId: string;
  shipFromStore?: ShipFromStore | null;
  attributeSections?: Record<string, StoreAttribute[]>;
}

export interface CollectAtStore {
  prePaid: boolean;
  leadTime: number;
}

export type TimeTuple = [number, number, number];

export interface Other {
  closed: boolean;
  date: TimeTuple;
  time?: [TimeTuple, TimeTuple];
  text?: string;
}

export interface ShipFromStore {
  post: boolean;
  home: boolean;
  leadTime: number;
}

export interface StoreAttribute {
  id: string;
  title: string;
  // categoryId: string;
  // categoryTitle: string;
  notes: string;
  notesEnabled: boolean;
  icon: string;
}

export interface OpenHours {
  days: Array<[TimeTuple, TimeTuple] | null>;
  other: Other[];
}
