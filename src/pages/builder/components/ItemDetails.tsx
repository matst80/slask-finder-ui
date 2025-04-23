import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { useFacetMap } from "../../../hooks/searchHooks";
import { Item, ItemValues } from "../../../lib/types";
import { cm } from "../../../utils";

const groups = {
  "Water cooling specifications": [34650, 32177, 36312, 36308],
  "Capacity, consumption & power supply": [
    31986, 36247, 36248, 36249, 36256, 36255,
  ],
  Certifications: [32072, 36250, 36251],
  "Model description": [
    31158, 30879, 32152, 31586, 30353, 36201, 32103, 36202, 31158, 31157, 30552,
    36258, 36305, 36253, 32091, 36266, 30290, 31508, 31553, 31416, 33706, 30877,
    30805, 33986, 31158, 36280, 36281, 30811, 32061, 32062, 36282, 31158, 36252,
    35938, 36317, 36306,
  ],
  Processor: [32103, 36207, 30276, 36208],
  "Measurements & weight": [30648, 31692, 30376, 31681, 36263, 36313, 31682],
  "Sales package information": [
    30688, 32132, 36206, 31335, 30202, 36268, 36269, 31041, 31106, 36259,
  ],
  "Environmental parameters": [34819],
  "Expansion slots": [
    36224, 36225, 36226, 36227, 36228, 36229, 36230, 36231, 36232, 36233, 36234,
    36235, 36236, 36237, 36238, 36239, 32181, 32182, 32064,
  ],
  "Power supply": [36284, 36285, 32183, 31986],
  "Internal I/O & Connectors": [
    35918, 36264, 36240, 36241, 32159, 32160, 33506, 36334,
  ],
  Motherboard: [32056, 32057, 36283],
  Graphics: [32198, 32153, 35977, 36260, 36261, 35994, 36303],
  "Memory specifications": [
    35922, 35979, 35978, 35980, 35981, 31190, 35921, 30857, 32138, 31187, 36209,
    32172, 36267, 32171, 32088, 31620,
  ],
  "Memory performance": [36270, 36271, 32114, 36272, 31191],
  Storage: [
    36245, 36210, 36211, 36212, 36213, 36214, 36215, 36216, 36217, 36218, 36219,
    36220, 36221, 32148, 31420,
  ],
  Network: [31694, 33514, 30156, 30157, 35967, 32161, 32109, 32144],
  Audio: [31947, 34705],
  "PCIe specifications": [35914, 34657, 34658],
  Connections: [
    32124, 30634, 32121, 31991, 32086, 36254, 32147, 34713, 32148, 32149, 36257,
    34710, 34711, 34712,
  ],
  "Functions & features": [30831, 30402, 35993, 36262],
  Cooling: [
    33985, 32133, 32184, 36286, 36287, 36288, 36289, 36290, 36291, 36292, 36293,
    32060, 32093, 32093, 32176, 36309, 32095, 32096, 32097, 36310, 32101,
  ],
  "CPU specifications": [32077, 36307, 36314, 36315, 36316],
  "Power connectors": [36242, 36243],
  "Back panel ports": [
    33533, 33576, 33577, 34582, 34583, 33531, 33574, 33575, 35919, 36244, 32162,
    35930, 32163,
  ],
  "Operating system & system requirements": [31048],
  "Storage specifications": [
    36279, 31396, 30714, 30552, 36338, 36249, 36273, 36274, 32120, 36275, 36276,
    36277, 32195, 32194, 36278, 31248, 31556, 31273,
  ],

  "Front port connectors": [
    33531, 33574, 33575, 33533, 33576, 33577, 34582, 34583, 36301, 30007, 36302,
  ],
  "Internal connections": [30315, 36318],
  Performance: [
    31463, 30276, 31834, 36203, 36333, 32073, 31009, 35984, 35983, 36204, 36205,
    32075, 32076, 30203, 35989, 35990,
  ],
  "Water cooling": [36294, 36295, 36296, 36297, 36298, 36299, 36300],
  Power: [32186, 32098, 32099, 36311, 32134],
};

const uselessIds = [
  31158, 11, 9, 10, 12, 13, 14, 15, 31158, 1, 2, 3, 4, 5, 6, 7, 30, 31, 32, 33,
  21, 24, 35, 23, 36, 32188, 30879,
];

const ItemDetailsContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
} | null>(null);

const useItemDetails = () => {
  const context = useContext(ItemDetailsContext);
  if (!context) {
    throw new Error("useItemDetails must be used within a ItemDetailsProvider");
  }
  return context;
};

export const GroupRenderer = ({ values }: { values: ItemValues }) => {
  const { data } = useFacetMap();

  const grouped = useMemo(
    () =>
      Object.entries(values).reduce((acc, [id, value]) => {
        const group = Object.entries(groups).find(([, ids]) =>
          ids.includes(Number(id))
        );
        const facet = data?.[Number(id)];
        if (
          value != null &&
          facet != null &&
          !uselessIds.includes(Number(id))
        ) {
          const [groupName] = group ?? ["Other"];
          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push({
            name: facet.name,
            id,
            value: String(value),
          });
        }
        return acc;
      }, {} as Record<string, { name: string; value: string; id: string }[]>),
    [data, values]
  );
  return (
    <div className="md:columns-2">
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, values]) => {
          return (
            <div key={key} className="mb-3 last:mb-0">
              <h3 className="font-body text-xl text-left">{key}</h3>
              <div className="mt-4">
                {values
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map(({ name, value, id }) => {
                    //console.log({ id, name, value });
                    return (
                      <div key={name} className="break-inside-avoid-column">
                        <dl className="grid grid-cols-2 py-1 gap-4">
                          <dt>
                            <span className="font-body text-sm lg:text-base break-words hyphens-auto align-top text-pretty">
                              {name}{" "}
                              <span className="text-xs text-gray-600">
                                ({id})
                              </span>
                            </span>
                          </dt>
                          <dd className="font-body font-bold text-sm pl-4 lg:text-base break-words align-top text-pretty">
                            {Array.isArray(value) ? value.join(", ") : value}
                          </dd>
                        </dl>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export const ItemDetails = ({
  onClick,
  children,
  item,
  className,
}: PropsWithChildren<{
  item: Item;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
}>) => {
  const [open, setOpen] = useState(false);
  return (
    <ItemDetailsContext.Provider value={{ open, setOpen }}>
      <div onClick={onClick} className={cm(className, "relative")}>
        {children}

        {open && <GroupRenderer values={item.values} />}
        {/* <div className="bg-white border-t border-gray-100 p-6">
            <ul className="md:columns-2">
              {Object.entries(item.values)
                .filter(([key]) => !uselessIds.includes(Number(key)))
                .map(([key, value], i) => (
                  <li key={`prp-${i}`}>
                    {data?.find((f) => f.id === Number(key))?.name}:{" "}
                    <b className="font-bold" title={key}>
                      {value}
                    </b>{" "}
                  </li>
                ))}
            </ul>
          </div>)} */}
      </div>
    </ItemDetailsContext.Provider>
  );
};

export const ItemDetailsToggleButton = () => {
  const { setOpen } = useItemDetails();
  return (
    <button
      className="font-bold mt-4 inverted-link"
      onClick={() => setOpen((o) => !o)}
    >
      Visa mer detaljer
    </button>
  );
};
