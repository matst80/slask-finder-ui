import { ItemWithComponentId, Rule } from "./builder-types";

export const wattIds = [35990, 32186];

export const GPU = 5;
export const CPU = 1;
export const MOTHERBOARD = 2;
export const RAM = 3;
export const PSU = 6;
export const CASE = 7;
export const STORAGE = 4;
export const COOLER = 8;
export const ADDONS = 100;
const AIR_COOLER = 81;
const LIQUID_COOLER = 82;

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

const asArray = (value: unknown) => {
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

export const componentRules: Rule[] = [
  {
    type: "component",
    title: "CPU",
    id: CPU,
    startingText:
      "Your selected CPU determines motherboard and ram speed, and power requirements of the PSU and your recommended CPU cooling options.",
    order: [CPU, MOTHERBOARD, RAM, STORAGE, GPU, CASE, PSU, COOLER],
    filtersToApply: [
      { id: 32103, to: MOTHERBOARD },
      // add chipset, when we get all chipsets!
      {
        id: 36307,
        to: LIQUID_COOLER,
        converter: (values) => {
          const tdp = values[35990];
          //console.log("should have cooler that handles", tdp);
          // return [];
          return [
            {
              id: 36307,
              value: { min: Number(tdp), max: 9999 },
            },
          ];
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
          const min = Number(value[35980]);
          if (isNaN(min)) return [];
          return [
            { id: 31191, value: { min: Number(value[35980]), max: 999999 } },
          ];
        },
      },
      {
        id: 32103,
        to: LIQUID_COOLER,
        converter: (values) => {
          if (!isKey(values[32103])) return [];
          return [{ id: 32077, value: values[32103] }];
        },
      },
      {
        id: 32103,
        to: AIR_COOLER,
        converter: (values) => {
          if (!isKey(values[32103])) return [];
          return [{ id: 32077, value: values[32103] }];
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
    validator: () => {
      //if (isNaN(Number(values[35980]))) return false;
      return true; //values[32103] != null;
    },
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 120,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: ["Processor (CPU)"],
        },
      ],
    },
  },
  {
    type: "component",
    title: "GPU",
    id: GPU,
    //nextComponentId: 6,
    startingText:
      "Your selected GPU determines the minimum power requirements of the PSU and the range of PC case sizes that will accommodate it.",
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
    filtersToApply: [
      {
        id: 30376,
        to: CASE,
        converter: (values) => {
          const gpuSize = Number(values[30376]);
          if (isNaN(gpuSize)) {
            return [];
          }

          return [
            {
              id: 32062,
              value: { min: Number(values[30376]) * 10, max: 99999 },
            },
          ];
        },
      },
    ],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 120,
      stock: [],
      string: [
        {
          id: 31158,
          value: ["Grafikkort"],
        },
      ],
    },
  },
  {
    type: "component",
    title: "Moderkort",
    id: MOTHERBOARD,
    validator: (values) => {
      return (
        values[32103] != null &&
        values[35921] != null &&
        values[30857] != null &&
        values[30857] != "X" &&
        values[35921] != "X"
      );
    },
    requires: [1],
    topFilters: [
      2, 36207, 30552, 30552, 30276, 32161, 32103, 33514, 33533, 33576, 36232,
      36211, 36213,
    ],
    //importantFacets: [32161, 30276, 30552, 36245, 36211, 30857, 31190],
    importantFacets: [32103, 30276, 31694],
    filtersToApply: [
      { id: 32103, to: CPU }, // cpu socket
      // add chipset, when we get all chipsets!
      { id: 35921, to: RAM }, // ram type
      { id: 30857, to: RAM }, // ram pins
      // maybe add max ram speed or in ui!
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
                values.push(`${i}.0`);
              }
              ret.push({ id: 36249, value: values });
              //ret.push({ id: /* to be added */, value: {min:0, max:Number(size)} });
            }
          } else {
            ret.push({ id: 36249, value: ["3.0"] });
          }
          return ret;
        },
      },
      {
        id: 32103,
        to: AIR_COOLER,
        converter: (values) => {
          if (typeof values[32103] != "string") return [];
          return [{ id: 32077, value: values[32103] }];
        },
      },
      {
        id: 32103,
        to: LIQUID_COOLER,
        converter: (values) => {
          if (typeof values[32103] != "string") return [];
          return [{ id: 32077, value: values[32103] }];
        },
      },
      {
        id: 30552,
        to: CASE,
        converter: (values) => {
          const formFactor = values[30552];
          const allowed = [];
          if (typeof formFactor === "string") {
            if (formFactor.includes("Mini") || formFactor.includes("mATX")) {
              allowed.push("Mini-ITX");
            } else {
              allowed.push("ATX");
              if (formFactor.includes("eATX")) {
                allowed.push("eATX");
              }
            }
            return [{ id: 32056, value: formFactor }];
          }
          return [];
        },
      },
      // number of ram slots / max ram per slot?
    ],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 120,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: ["Moderkort"],
        },
      ],
    },
  },
  {
    type: "component",
    title: "Chassi",
    startingText:
      "Your selected motherboard determines a number of compatibility factors, including maximum number of memory slots, total memory, M.2 storage slots, and case compatibility.",
    order: [CASE, GPU, CPU, MOTHERBOARD, RAM, STORAGE, PSU, COOLER],
    //nextComponentId: 6,
    topFilters: [
      2, 32062, 32056, 36284, 32056, 36284, 32061, 36287, 32183, 36294, 36280,
    ],
    //importantFacets: [36293, 32062, 36284, 32061, 36295, 36286, 36280],
    importantFacets: [36280, 32056, 32183],
    filtersToApply: [
      {
        id: 32062,
        to: GPU,
        converter: (values) => {
          const maxGpuSize = Number(values[32062]);
          if (isNaN(maxGpuSize)) {
            return [];
          }

          return [
            {
              id: 30376,
              value: { max: maxGpuSize / 10, min: 1 },
            },
          ];
        },
      },
      {
        id: 36284,
        to: PSU,
        converter: (values) => {
          if (!isKey(values[36284])) return [];
          return [{ id: 36252, value: values[36284] }];
        },
      },
      {
        id: 32061,
        to: AIR_COOLER,
        converter: (values) => {
          const cpuHeightInMM = Number(values[32061]);
          if (isNaN(cpuHeightInMM)) {
            console.log("Invalid cpu height", values[32061]);
            return [];
          }

          return [{ id: 30648, value: { min: 0, max: cpuHeightInMM / 10 } }];
        },
      },
      {
        id: 36294,
        to: LIQUID_COOLER,
        converter: (values) => {
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
          const formFactor = values[32056];
          const allowed = [];
          if (typeof formFactor === "string") {
            if (formFactor.includes("Mini") || formFactor.includes("mATX")) {
              allowed.push("Mini-ITX");
            } else {
              allowed.push("ATX");
              if (formFactor.includes("eATX")) {
                allowed.push("eATX");
              }
            }
            return [{ id: 30552, value: formFactor }];
          }
          return [];
        },
      },
    ],
    id: CASE,
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 120,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: ["Chassi"],
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
        title: "Vattenkylning",
        requires: [7, 1],
        id: LIQUID_COOLER,
        disabled: disabledIfCoolerIncluded,
        //ignoreIfComponentSelected: 9,
        topFilters: [32093, 32177, 36317, 32133, 34650, 36306],
        nextComponentId: 3,
        //importantFacets: [32093, 36310, 32097, 32177, 36311, 36306], //, 32077
        importantFacets: [36310, 36307, 32133],
        filter: {
          range: [],
          sort: "popular",
          page: 0,
          pageSize: 120,
          stock: [],
          string: [
            {
              id: 31158,
              value: ["Vattenkylning"],
            },
          ],
        },
        filtersToApply: [],
      },
      {
        type: "component",
        title: "CPU luftkylare",
        requires: [7, 1],
        id: AIR_COOLER,
        disabled: disabledIfCoolerIncluded,
        //ignoreIfComponentSelected: 8,
        topFilters: [32093, 32177],
        //importantFacets: [32093, 36310, 32097, 32177, 36311, 36306], //, 32077
        importantFacets: [36310, 36307, 32133],
        filter: {
          range: [],
          sort: "popular",
          page: 0,
          pageSize: 120,
          stock: [],
          string: [
            {
              id: 31158,
              value: ["CPU luftkylning"],
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
    requires: [2],
    topFilters: [36272, 36258, 36268, 36272, 36267, 36271],
    //importantFacets: [36268, 31191, 36271],
    importantFacets: [36267, 36268, 36271],
    validator: (values) => {
      return (
        values[35921] != null &&
        values[35921] != "X" &&
        values[30857] != null &&
        values[30857] != "X"
      );
    },
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 120,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: ["RAM minne"],
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
    //nextComponentId: 12,
    topFilters: [31508, 32120, 32194, 32195, 36274, 36279],
    //topFilters: [31508, 32194, 32195],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 120,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: ["Intern SSD"],
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
          if (!isKey(values[36252])) return [];
          return [{ id: 36284, value: values[36252] }];
        },
      },
    ],
    disabled: disabledIfPsuIncluded,
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 120,
      stock: [],
      string: [
        { id: 13, value: ["Nätaggregat (PSU)"] },
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
      ],
    },
  },
  {
    type: "group",
    title: "Tillbehör",
    id: ADDONS,
    components: [
      {
        type: "component",
        id: 10,
        title: "Skärm",
        filtersToApply: [],
        topFilters: [
          2, 32023, 30636, 31376, 30407, 33433, 32226, 31265, 30924, 30924,
        ],
        importantFacets: [32023, 30924, 32226, 31239, 30636, 30584],
        filter: {
          range: [],
          sort: "popular",
          page: 0,
          pageSize: 120,
          stock: [],
          string: [
            {
              id: 12,
              value: ["Datorskärm"],
            },
            { id: 31041, value: ["Ja"] },
          ],
        },
      },
      {
        type: "component",
        title: "Extra SSD Lagring",
        id: 11,
        topFilters: [31508, 32194, 32195],
        filter: {
          range: [],
          sort: "popular",
          page: 0,
          pageSize: 120,
          stock: [],
          string: [
            {
              id: 31158,
              value: ["Intern SSD"],
            },
            {
              id: 30714,
              value: ["SATA 3.0"],
            },
          ],
        },
        filtersToApply: [],
      },
      {
        type: "component",
        title: "Operativsystem",
        id: 12,
        topFilters: [],
        filtersToApply: [],
        filter: {
          range: [],
          sort: "popular",
          page: 0,
          pageSize: 120,
          stock: [],
          string: [
            {
              id: 31158,
              value: ["Operativsystem"],
            },
            {
              id: 11,
              value: ["Mjukvara"],
            },
          ],
        },
      },
      {
        type: "component",
        title: "Tangentbord",
        id: 13,
        filter: {
          range: [],
          sort: "popular",
          page: 0,
          pageSize: 120,
          stock: [],
          string: [
            {
              id: 31158,
              value: ["Tangentbord"],
            },
          ],
        },
        filtersToApply: [],
      },
      {
        type: "component",
        title: "Mus",
        id: 14,
        filter: {
          range: [],
          sort: "popular",
          page: 0,
          pageSize: 120,
          stock: [],
          string: [
            {
              id: 31158,
              value: ["Mus"],
            },
          ],
        },
        filtersToApply: [],
      },
    ],
  },
];
