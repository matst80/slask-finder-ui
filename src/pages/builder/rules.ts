import { ItemValues } from "../../lib/types";
import { isDefined } from "../../utils";
import {
  ComponentId,
  ConverterResult,
  Issue,
  ItemWithComponentId,
  OptionsId,
  Rule,
  RuleId,
  SelectionId,
} from "./builder-types";
import { asNumber } from "./builder-utils";

export const GPU: ComponentId = "gpu";
export const CPU: ComponentId = "cpu";
export const MOTHERBOARD: ComponentId = "motherboard";
export const RAM: ComponentId = "ram";
export const PSU: ComponentId = "psu";
export const CASE: ComponentId = "case";
export const STORAGE: ComponentId = "storage";
export const COOLER: SelectionId = "cooler";
export const ADDONS: OptionsId = "addons";
const AIR_COOLER: ComponentId = "air_cooler";
const LIQUID_COOLER: ComponentId = "liquid_cooler";

const isKey = (value: unknown): value is string | string[] => {
  return (
    typeof value === "string" ||
    (Array.isArray(value) && typeof value[0] === "string")
  );
};

const disabledIfCoolerIncluded = (selectedItems: ItemWithComponentId[]) => {
  return selectedItems.some((d) => d.values[36206] === "Ja");
};

const disabledIfPsuIncluded = (selectedItems: ItemWithComponentId[]) => {
  return selectedItems.some((d) => d.values[32183] === "Ja");
};

const asArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
};

const fixPrefix = (prefix: string) => (value: string) => {
  if (value.startsWith(prefix)) {
    return value;
  }
  return prefix + value;
};

const numberMatch = (
  values: ItemValues,
  id: number,
  { min, max }: { min: number; max: number },
  type: "error" | "warning" = "error"
): Issue | undefined => {
  const value = values?.[id];
  if (value == null) return { type, message: "Missing value", facetId: id };
  if (isNaN(Number(value)))
    return { type, message: `(${value}) is not a number`, facetId: id };
  if (Number(value) < min)
    return { type, message: `${value} too low`, facetId: id };
  if (Number(value) > max)
    return { type, message: `${value} too high`, facetId: id };
  return undefined;
};

const stringMatch = (
  values: ItemValues,
  id: number,
  type: "error" | "warning",
  incorrectValue?: string
): Issue | undefined => {
  const value = values?.[id];
  if (value == null) return { type, message: "Missing value", facetId: id };

  if (!(typeof value === "string" || Array.isArray(value)))
    return { type, message: "Not a string", facetId: id };

  if (incorrectValue && value === incorrectValue)
    return {
      type,
      message: "Incorrect: " + incorrectValue,
      facetId: id,
    };
  return undefined;
};

const stringContain = (
  values: ItemValues,
  id: number,
  type: "error" | "warning",
  mustHave: string
) => {
  const value = values?.[id];
  if (value == null) return { type, message: "Missing value", facetId: id };
  if (typeof value !== "string" && !Array.isArray(value))
    return { type, message: "Not a string", facetId: id };
  if (typeof value === "string" && !value.includes(mustHave))
    return {
      type,
      message: "Missing value: " + mustHave,
      facetId: id,
    };
};

const handleMotherBoardFormFactor = (formFactor: string | string[]) => {
  const allowed = [];

  if (formFactor.includes("Mini") || formFactor.includes("mATX")) {
    allowed.push("Mini-ITX");
  } else {
    allowed.push("ATX");
    if (formFactor.includes("eATX")) {
      allowed.push("eATX");
    }
  }
  return [{ id: 30552, value: allowed }];
};

const arrayMatch = (
  values: ItemValues,
  id: number,
  type: "error" | "warning"
): Issue | undefined => {
  const value = values?.[id];
  if (value == null) return { type, message: "Missing value", facetId: id };
  if (!Array.isArray(value))
    return { type, message: "Not an array", facetId: id };
  if (value.length < 1) return { type, message: "Empty array", facetId: id };
  return undefined;
};

const toMinFilter = (
  value: string | number | string[] | undefined,
  {
    id,
    max = 99999,
    multiplier = 1,
  }: { id: number; max?: number; multiplier?: number }
): ConverterResult[] => {
  if (value == null) return [];
  const number = asNumber(value);
  if (isNaN(number)) return [];
  return [{ id, value: { min: number * multiplier, max } }];
};

const toMaxFilter = (
  value: string | number | string[] | undefined,
  {
    id,
    min = 0,
    multiplier = 1,
  }: { id: number; min?: number; multiplier?: number }
): ConverterResult[] => {
  if (value == null) return [];
  const number = asNumber(value);
  if (isNaN(number)) return [];
  return [{ id, value: { min, max: number * multiplier } }];
};

const toStringFilter = (
  value: number | string | string[] | undefined,
  { id }: { id: number }
) => {
  if (value == null) return [];
  if (typeof value === "string") {
    return [{ id, value: [value] }];
  }
  if (Array.isArray(value)) {
    return [{ id, value }];
  }
  if (typeof value === "number") {
    console.warn("converting number to string", { value, id });
    return [{ id, value: [String(value)] }];
  }
  return [];
};

export const defaultComponentOrder: RuleId[] = [
  CPU,
  MOTHERBOARD,
  RAM,
  STORAGE,
  GPU,
  CASE,
  PSU,
  COOLER,
];

export const componentRules: Rule[] = [
  {
    type: "component",
    title: "CPU",
    id: CPU,
    // startingText:
    //   "Your selected CPU determines motherboard and ram speed, and power requirements of the PSU and your recommended CPU cooling options.",
    order: defaultComponentOrder,

    filtersToApply: [
      { id: 32103, to: MOTHERBOARD },
      // add chipset, when we get all chipsets!
      {
        id: 36307,
        to: LIQUID_COOLER,
        converter: (values) => {
          return toMinFilter(values[35990], { id: 36307 });
        },
      },
      {
        id: 36202,
        to: MOTHERBOARD,
        converter: (values) => {
          const socket = asArray(values[32103]);
          const isAmd = socket.some(
            (s) => s.includes("AM5") || s.includes("AM4")
          );

          const chipsetValue = values[36202];

          if (typeof chipsetValue === "string" && chipsetValue.includes(";"))
            return [
              {
                id: 30276,
                value: chipsetValue
                  .split(";")
                  .map((v) => v.trim())
                  .map(fixPrefix(isAmd ? "AMD " : "")),
              },
            ];
          if (Array.isArray(chipsetValue)) {
            return [
              {
                id: 30276,
                value: chipsetValue?.map(fixPrefix(isAmd ? "AMD " : "")),
              },
            ];
          }
          return [];
        },
      },
      {
        // min memory speed
        id: 35980,
        to: RAM,
        converter: (value) => {
          return toMinFilter(value[35980], { id: 31191, max: 999999 });
          // const min = Number(value[35980]);
          // if (isNaN(min)) return [];
          // return [
          //   { id: 31191, value: { min: Number(value[35980]), max: 999999 } },
          // ];
        },
      },
      {
        id: 32103,
        to: LIQUID_COOLER,
        converter: (values) => {
          return toStringFilter(values[32103], { id: 32077 });
          // if (!isKey(values[32103])) return [];
          // return [{ id: 32077, value: values[32103] }];
        },
      },
      {
        id: 32103,
        to: AIR_COOLER,
        converter: (values) => {
          return toStringFilter(values[32103], { id: 32077 });
          // if (!isKey(values[32103])) return [];
          // return [{ id: 32077, value: values[32103] }];
        },
      },
    ],
    quickFilters: [
      {
        name: "System",
        options: [
          { title: "AMD", filters: [{ id: 32152, value: "AMD" }] },
          { title: "Intel", filters: [{ id: 32152, value: "Intel" }] },
        ],
      },
      {
        // gpu gen 33706
        name: "Tier",
        options: [
          {
            title: "Basic",
            filters: [
              {
                id: 31586,
                value: ["AMD Ryzen 3", "AMD Ryzen 5", "Intel Core i3"],
              },
            ],
          },
          {
            title: "Mid",
            filters: [
              {
                id: 31586,
                value: ["AMD Ryzen 5", "Intel Core i5"],
              },
            ],
          },
          {
            title: "Pro",
            filters: [
              {
                id: 31586,
                value: ["AMD Ryzen 7", "Intel Core i7"],
              },
            ],
          },
          {
            title: "Extreme",
            filters: [
              {
                id: 31586,
                value: ["AMD Ryzen 9", "Intel Core i9"],
              },
            ],
          },
        ],
      },
    ],
    topFilters: [32152, 36201, 31586, 35990, 36203, 36206],
    importantFacets: [32103, 32198, 36206],
    validator: (values: ItemValues) => {
      return [
        stringMatch(values, 32103, "error"),
        numberMatch(values, 35980, { min: 500, max: 29999 }, "warning"),
        numberMatch(values, 35990, { min: 5, max: 500 }, "warning"),
      ].filter(isDefined);
    },
    filter: {
      range: [],
      string: [
        {
          id: 35,
          value: ["59030"],
        },
      ],
    },
  },
  {
    type: "component",
    title: "GPU",
    id: GPU,
    // startingText:
    //   "Your selected GPU determines the minimum power requirements of the PSU and the range of PC case sizes that will accommodate it.",
    order: [GPU, CPU, MOTHERBOARD, RAM, STORAGE, CASE, PSU, COOLER],
    quickFilters: [
      {
        // gpu gen 33706
        name: "Generation",
        options: [
          {
            title: "GeForce RTX 40 Series",
            filters: [
              {
                id: 33706,
                value: "GeForce RTX 40 Series",
              },
            ],
          },
          {
            title: "GeForce RTX 50 Series",
            filters: [
              {
                id: 33706,
                value: "GeForce RTX 50 Series",
              },
            ],
          },
          {
            title: "Radeon RX 6000 Series",
            filters: [
              {
                id: 33706,
                value: "Radeon RX 6000 Series",
              },
            ],
          },
          {
            title: "Radeon RX 7000 Series",
            filters: [
              {
                id: 33706,
                value: "Radeon RX 7000 Series",
              },
            ],
          },
          {
            title: "Radeon RX 9000 Series",
            filters: [
              {
                id: 33706,
                value: "Radeon RX 9000 Series",
              },
            ],
          },
        ],
      },
    ],
    topFilters: [
      33706, 31620, 36261, 32186, 33986, 30857, 33985, 36313, 36261, 32098,
    ],
    //importantFacets: [33986, 36303, 35994, 30634, 31620, 30857, 32186],
    importantFacets: [30877, 31620, 36260],
    validator: (values) => {
      return [
        numberMatch(values, 30376, { min: 5, max: 49 }),
        numberMatch(values, 32186, { min: 0, max: 1050 }, "warning"),
      ].filter(isDefined);
    },
    filtersToApply: [
      {
        id: 30376,
        to: CASE,
        converter: (values) => {
          return toMinFilter(values[30376], {
            id: 32062,
            max: 99999,
            multiplier: 10,
          });
          // const gpuSize = Number(values[30376]);
          // if (isNaN(gpuSize)) {
          //   return [];
          // }

          // return [
          //   {
          //     id: 32062,
          //     value: { min: Number(values[30376]) * 10, max: 99999 },
          //   },
          // ];
        },
      },
    ],
    filter: {
      range: [],
      string: [
        {
          id: 35,
          value: ["59036"],
        },
      ],
    },
  },
  {
    type: "component",
    title: "Moderkort",
    id: MOTHERBOARD,
    validator: (values) => {
      return [
        numberMatch(values, 31190, { min: 2, max: 16 }, "warning"),
        stringMatch(values, 32103, "error"),
        stringMatch(values, 35921, "error", "X"),
        stringMatch(values, 30857, "error", "X"),
      ].filter(isDefined);
    },
    requires: [CPU],
    topFilters: [
      2, 36207, 30552, 30552, 30276, 32161, 32103, 33514, 33533, 33576, 36232,
      36211, 36213,
    ],
    //importantFacets: [32161, 30276, 30552, 36245, 36211, 30857, 31190],
    importantFacets: [32103, 30276, 31694],
    filtersToApply: [
      { id: 32103, to: CPU }, // cpu socket
      { id: 35921, to: RAM }, // ram type
      { id: 30857, to: RAM }, // ram pins
      {
        id: 36249,
        to: STORAGE,
        converter: (values) => {
          // m2 slots and gen
          const m2Slots = Number(values[36245]);
          const ret = [];
          if (m2Slots > 0) {
            // const size = values[36210]; // max size
            const gen = values[36211];
            if (gen != null && typeof gen === "string") {
              const genNr = Number(gen.split(".")[0]);
              // add max size!!!!
              const values = [];
              for (let i = 2; i <= genNr; i++) {
                values.push(`${i}.0`, `${i}`);
              }
              ret.push({ id: 36249, value: values });
              //ret.push({ id: /* to be added */, value: {min:0, max:Number(size)} });
            }
          } else {
            ret.push({ id: 36249, value: ["3", "3.0", "4", "4.0"] });
          }
          return ret;
        },
      },
      {
        id: 32103,
        to: AIR_COOLER,
        converter: (values) => {
          return toStringFilter(values[32103], { id: 32077 });
          // if (typeof values[32103] != "string") return [];
          // return [{ id: 32077, value: values[32103] }];
        },
      },
      {
        id: 32103,
        to: LIQUID_COOLER,
        converter: (values) => {
          return toStringFilter(values[32103], { id: 32077 });
          // if (typeof values[32103] != "string") return [];
          // return [{ id: 32077, value: values[32103] }];
        },
      },
      {
        id: 30552,
        to: CASE,
        converter: (values) => {
          return toStringFilter(values[30552], { id: 32057 });
        },
      },
    ],
    filter: {
      range: [],
      string: [
        {
          id: 35,
          value: ["59010"],
        },
      ],
    },
  },
  {
    type: "component",
    title: "Chassi",
    // startingText:
    //   "Your selected motherboard determines a number of compatibility factors, including maximum number of memory slots, total memory, M.2 storage slots, and case compatibility.",
    order: [CASE, GPU, CPU, MOTHERBOARD, RAM, STORAGE, PSU, COOLER],

    topFilters: [
      2, 32062, 32056, 36284, 32056, 36284, 32061, 36287, 32183, 36294, 36280,
    ],
    //importantFacets: [36293, 32062, 36284, 32061, 36295, 36286, 36280],
    validator: (values) => {
      return [
        arrayMatch(values, 32057, "warning"),
        numberMatch(values, 32062, { min: 100, max: 500 }, "warning"),
        stringMatch(values, 36284, "error"),
        numberMatch(values, 32061, { min: 1, max: 500 }, "warning"),
      ].filter(isDefined);
    },
    importantFacets: [36280, 32056, 32183],
    filtersToApply: [
      {
        id: 32062,
        to: GPU,
        converter: (values) => {
          return toMaxFilter(values[32062], {
            id: 30376,
            min: 1,
            multiplier: 0.1,
          });
        },
      },
      {
        id: 36284,
        to: PSU,
        converter: (values) => {
          return toStringFilter(values[36284], { id: 36252 });
        },
      },
      {
        id: 32061,
        to: AIR_COOLER,
        converter: (values) => {
          return toMaxFilter(values[32061], {
            id: 30648,
            min: 0,
            multiplier: 0.1,
          });
        },
      },
      {
        id: 36294,
        to: LIQUID_COOLER,
        converter: (values) => {
          // todo fix this, or check values!!!!
          const ret = [];
          const maxSize = Math.max(
            ...[values[36296], values[36298], values[36299], values[36300]]
              .map((v) => {
                const [, size] = String(v).match(/.+ (\d+)mm/) ?? [];
                return Number(size);
              })
              .filter((v) => !isNaN(v))
          );
          //console.log("MAX RADIATOR SIZE", maxSize);
          const radiatorSizes = [120, 240, 280, 360];

          ret.push({
            id: 32177,
            value: radiatorSizes
              .filter((size) => size <= maxSize)
              .map((size) => `${size}mm`),
          });
          return ret;
        },
      },
      {
        id: 32056,
        to: MOTHERBOARD,
        converter: (values) => {
          const supportedFormFactors = values[32057];

          if (isKey(supportedFormFactors)) {
            if (Array.isArray(supportedFormFactors)) {
              return [{ id: 30552, value: supportedFormFactors }];
            }
            return handleMotherBoardFormFactor(supportedFormFactors);
          }

          const maxFormFactor = values[32056]; // Max form factor

          if (isKey(maxFormFactor)) {
            return handleMotherBoardFormFactor(maxFormFactor);
          }
          return [];
        },
      },
    ],
    id: CASE,
    filter: {
      range: [],
      string: [
        {
          id: 35,
          value: ["59020"],
        },
      ],
    },
  },
  {
    type: "selection",
    title: "Kylning",
    id: COOLER,
    disabled: disabledIfCoolerIncluded,
    options: [
      {
        type: "component",
        title: "Luftkylare",
        requires: [CASE, CPU],
        id: AIR_COOLER,
        disabled: disabledIfCoolerIncluded,
        //ignoreIfComponentSelected: 8,
        //startingText: "Luftkylning är tryggt sätt att kyla din cpu.",
        topFilters: [32093, 32177],
        //importantFacets: [32093, 36310, 32097, 32177, 36311, 36306], //, 32077
        importantFacets: [36310, 36307, 32133],
        validator: (values) => {
          return [
            arrayMatch(values, 32077, "error"),
            numberMatch(values, 36307, { min: 10, max: 9999 }, "warning"),
          ].filter(isDefined);
        },
        filter: {
          range: [],
          string: [
            {
              id: 33,
              value: ["PT1303"],
            },
          ],
        },
        filtersToApply: [],
      },
      {
        type: "component",
        title: "Vattenkylning",
        requires: [CASE, CPU],
        id: LIQUID_COOLER,
        disabled: disabledIfCoolerIncluded,
        //ignoreIfComponentSelected: 9,
        topFilters: [32093, 32177, 36317, 32133, 34650, 36306],
        validator: (values) => {
          return [
            arrayMatch(values, 32077, "error"),
            numberMatch(values, 36307, { min: 10, max: 9999 }, "warning"),
          ].filter(isDefined);
        },
        // startingText:
        //   "Vattenkylning är ett bra val för att kyla din CPU. kan vara mer effektivt än luftkylning.",
        //importantFacets: [32093, 36310, 32097, 32177, 36311, 36306], //, 32077
        importantFacets: [36310, 36307, 32133],
        filter: {
          range: [],
          string: [
            {
              id: 33,
              value: ["PT1302"],
            },
          ],
        },
        filtersToApply: [],
      },
    ],
  },

  {
    type: "component",
    title: "Minne",
    id: RAM,
    filtersToApply: [
      { id: 30857, to: MOTHERBOARD },
      { id: 35921, to: MOTHERBOARD },
    ],
    maxQuantity: (selectedItems) => {
      const motherboard = selectedItems.find(
        (d) => d.componentId === MOTHERBOARD
      );
      const ram = selectedItems.find((d) => d.componentId === RAM);
      if (motherboard == null || ram == null) return 1;
      const maxSlots = motherboard?.values[31190];
      const modules = ram?.values[36268];
      if (maxSlots == null || modules == null) return 1;
      if (isNaN(Number(maxSlots)) || isNaN(Number(modules))) return 1;
      const maxSlotsNum = Number(maxSlots);
      const modulesNum = Number(modules);
      if (maxSlotsNum < 1 || modulesNum < 1) return 1;
      if (maxSlotsNum > modulesNum) return Math.floor(maxSlotsNum / modulesNum);
      return 1;
    },
    requires: [MOTHERBOARD],
    topFilters: [36272, 36258, 36268, 36272, 36267, 36271],
    //importantFacets: [36268, 31191, 36271],
    importantFacets: [36267, 36268, 36271],
    validator: (values) => {
      return [
        stringMatch(values, 30857, "error", "X"),
        stringMatch(values, 35921, "error", "X"),
        numberMatch(values, 36268, { min: 1, max: 16 }, "warning"),
      ].filter(isDefined);
    },
    filter: {
      range: [],
      string: [
        {
          id: 35,
          value: ["59032"],
        },
      ],
    },
  },
  {
    type: "component",
    title: "Hårddisk",
    id: STORAGE,
    requires: [MOTHERBOARD],
    filtersToApply: [],
    // importantFacets: [
    //   30714, 31508, 32194, 32195, 32120, 36274, 31396, 36273, 36275, 32091,
    // ],
    importantFacets: [36279, 36338, 36274],
    validator: (values) => {
      const iface = String(values[30714]);
      if (iface.includes("PCIe")) {
        return [
          //stringMatch(values, 36274, "error"),
          numberMatch(values, 36338, { min: 200, max: 4000 }, "warning"),
          numberMatch(values, 36249, { min: 1, max: 10 }, "warning"),
        ].filter(isDefined);
      } else {
        return [
          stringMatch(values, 30714, "error"),
          stringContain(values, 30714, "error", "SATA"),
        ].filter(isDefined);
      }
    },
    maxQuantity: (selectedItems) => {
      const motherboardSlots = selectedItems.find(
        (d) => d.componentId === MOTHERBOARD
      )?.values[36245];
      if (motherboardSlots == null) return 0;
      const m2Slots = asNumber(motherboardSlots);
      if (isNaN(m2Slots)) return 0;
      return m2Slots;
    },
    //nextComponentId: 12,
    topFilters: [31508, 32120, 32194, 32195, 36274, 36279],
    //topFilters: [31508, 32194, 32195],
    filter: {
      range: [],
      string: [
        {
          id: 35,
          value: ["59060"],
        },
      ],
    },
  },
  {
    type: "component",
    title: "Nätaggregat",
    requires: [CASE],
    id: PSU,
    topFilters: [2, 31986, 36250, 36252, 36247, 36249, 36248, 32093],
    //importantFacets: [36252, 36284, 31986, 36250, 36251, 36247, 32093],
    importantFacets: [31986, 36252, 36254],
    filtersToApply: [
      {
        id: 36252,
        to: CASE,
        converter: (values) => {
          return toStringFilter(values[36252], { id: 36284 });
        },
      },
    ],
    validator: (values) => {
      return [stringMatch(values, 36252, "error")].filter(isDefined);
    },
    disabled: disabledIfPsuIncluded,
    filter: {
      range: [],
      string: [{ id: 35, value: ["59050"] }],
    },
  },
  {
    type: "group",
    title: "Tillbehör",
    id: "addons",
    components: [
      {
        type: "component",
        id: "screen",
        title: "Skärm",
        filtersToApply: [],
        topFilters: [
          2, 32023, 30636, 31376, 30407, 33433, 32226, 31265, 30924, 30924,
        ],
        importantFacets: [36341, 32023, 30924, 32226, 31239, 30636, 30584],
        filter: {
          range: [],
          string: [
            {
              id: 35,
              value: ["52307"],
            },
          ],
        },
      },
      {
        type: "component",
        title: "Extra SSD Lagring",
        id: "extra_storage",
        topFilters: [31508, 32194, 32195],
        filter: {
          range: [],

          string: [
            {
              id: 35,
              value: ["59060"],
            },
            // {
            //   id: 30714,
            //   value: ["SATA 3.0"],
            // },
          ],
        },
        filtersToApply: [],
      },
      {
        type: "component",
        title: "Operativsystem",
        id: "os",
        topFilters: [],
        filtersToApply: [],
        filter: {
          range: [],
          string: [
            {
              id: 32,
              value: ["PT307"],
            },
          ],
        },
      },
      {
        type: "component",
        title: "Tangentbord",
        id: "keyboard",
        filter: {
          range: [],
          string: [
            {
              id: 35,
              value: ["55540"],
            },
          ],
        },
        filtersToApply: [],
      },
      {
        type: "component",
        title: "Mus",
        id: "mouse",
        filter: {
          range: [],
          string: [
            {
              id: 35,
              value: ["55520"],
            },
          ],
        },
        filtersToApply: [],
      },
    ],
  },
];
