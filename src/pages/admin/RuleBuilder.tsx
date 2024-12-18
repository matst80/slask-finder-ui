import { PropsWithChildren, useEffect, useId, useMemo, useState } from "react";
import { useFacetList } from "../../hooks/searchHooks";
import Downshift from "downshift";
import { getPopularityRules } from "../../datalayer/api";
import useSWR from "swr";
import {
  Rule,
  MatchRule,
  DiscountRule,
  ruleTypes,
  ValueMatch,
  OutOfStockRule,
  NumberLimitRule,
  PercentMultiplierRule,
  RatingRule,
} from "../../types";
import { cm } from "../../utils";

type EditorProps<T extends Rule> = T & {
  onChange: (data: T) => void;
};

// type FieldSelectorProps = ValueMatch & {
//   onChange: (data: ValueMatch) => void;
// };

const itemProperties = [
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

const FieldSelector = ({
  onChange,
  ...selection
}: ValueMatch & { onChange: (data: ValueMatch) => void }) => {
  const { data } = useFacetList();
  const items = useMemo(() => {
    return [
      ...itemProperties.map((d) => ({
        key: d,
        source: "property",
        property: d,
        text: d,
      })),
      ...(data?.map((field) => ({
        key: String(field.id),
        source: "fieldId",
        fieldId: field.id,
        text: field.name,
      })) ?? []),
    ];
  }, [data]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  useEffect(() => {
    const { source } = selection;
    setSelectedValue(
      source == "fieldId" ? String(selection.fieldId) : selection.property
    );
  }, [selection]);
  const selectedItem = useMemo(
    () => items.find((item) => item.key === selectedValue),
    [items, selectedValue]
  );
  return (
    <Downshift
      onChange={(selection) => console.log("onChange", selection)}
      selectedItem={selectedItem}
      itemToString={(item) => (item ? item.text : "")}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
      }) => (
        <div>
          <label {...getLabelProps()}>Source</label>
          <div
            style={{ display: "inline-block" }}
            {...getRootProps({}, { suppressRefError: true })}
          >
            <input {...getInputProps()} className="border p-2 rounded-md" />
          </div>
          <ul {...getMenuProps()}>
            {isOpen
              ? items
                  .filter(
                    (item) =>
                      !inputValue ||
                      item.text
                        .toLocaleLowerCase()
                        .includes(inputValue.toLocaleLowerCase())
                  )
                  .map((item, index) => (
                    <li
                      {...getItemProps({
                        key: item.key,
                        index,
                        item,
                        style: {
                          backgroundColor:
                            highlightedIndex === index ? "lightgray" : "white",
                          fontWeight: selectedItem === item ? "bold" : "normal",
                        },
                      })}
                    >
                      {item.source === "property"
                        ? "Property:"
                        : "Facet value:"}{" "}
                      {item.text}
                    </li>
                  ))
              : null}
          </ul>
        </div>
      )}
    </Downshift>
  );
};

const LabelFor = ({
  children,
  label,
}: PropsWithChildren<{ label: string }>) => {
  return (
    <div>
      <label className="flex gap-4 items-center">
        <span>{label}</span>
        {children}
      </label>
    </div>
  );
};

const InputWithLabel = ({
  label,
  className,
  ...inputProps
}: React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { label: string }) => {
  return (
    <LabelFor label={label}>
      <input
        className={cm("border p-2 rounded-md", className)}
        {...inputProps}
      />
    </LabelFor>
  );
};

const DiscountRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<DiscountRule>) => {
  return (
    <div>
      <h1>Discount based rule</h1>
      <InputWithLabel
        type="number"
        defaultValue={rule.multiplier}
        label="Multiplier for discount percentage"
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.valueIfMatch}
        label="Static value if product is on sale"
      />
    </div>
  );
};

const NumberLimitRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<NumberLimitRule>) => {
  return (
    <div>
      <h1>Number limit rule</h1>
      <FieldSelector
        {...rule}
        onChange={(data) => onChange({ ...rule, ...data })}
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.multiplier}
        label="Multiplier for value"
      />
      <InputWithLabel type="number" defaultValue={rule.limit} label="Limit" />
      <InputWithLabel
        type="text"
        defaultValue={rule.comparator}
        label="Comparator"
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.value}
        label="Value if matching"
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.valueIfNotMatch}
        label="Value if NOT matching"
      />
    </div>
  );
};

const PercentMultiplierRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<PercentMultiplierRule>) => {
  return (
    <div>
      <h1>Percent multiplier rule</h1>
      <FieldSelector
        {...rule}
        onChange={(data) => onChange({ ...rule, ...data })}
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.multiplier}
        label="Multiplier for value"
      />
      <InputWithLabel type="number" defaultValue={rule.min} label="Min value" />
      <InputWithLabel type="number" defaultValue={rule.max} label="Max value" />
    </div>
  );
};

const MatchRuleEditor = ({ onChange, ...rule }: EditorProps<MatchRule>) => {
  return (
    <div>
      <h1>Match value rule</h1>
      <InputWithLabel
        type="text"
        defaultValue={String(rule.match)}
        label="Match"
      />
      <InputWithLabel
        type="checkbox"
        defaultChecked={rule.invert ?? false}
        label="Invert"
      />
      <FieldSelector
        {...rule}
        onChange={(data) => onChange({ ...rule, ...data })}
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.value}
        label="Value if matching"
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.valueIfNotMatch}
        label="Value if NOT matching"
      />
    </div>
  );
};

const OutOfStockRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<OutOfStockRule>) => {
  return (
    <div>
      <h1>Inventory rule</h1>
      <InputWithLabel
        type="number"
        defaultValue={rule.noStoreMultiplier}
        label="Multiplier for number of stock locations"
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.noStockValue}
        label="Static value if product out of stock"
      />
    </div>
  );
};

const RatingRuleEditor = ({ onChange, ...rule }: EditorProps<RatingRule>) => {
  return (
    <div>
      <h1>Rating rule</h1>
      <InputWithLabel
        type="number"
        defaultValue={rule.multiplier}
        label="Multiplier"
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.subtractValue}
        label="Value to subtract from rating before multiplying"
      />
      <InputWithLabel
        type="number"
        defaultValue={rule.valueIfNoMatch}
        label="Value if no match"
      />
    </div>
  );
};

const RuleComponent = (props: EditorProps<Rule>) => {
  switch (props.$type) {
    case "MatchRule":
      return <MatchRuleEditor {...props} />;
    case "DiscountRule":
      return <DiscountRuleEditor {...props} />;
    case "OutOfStockRule":
      return <OutOfStockRuleEditor {...props} />;
    case "NumberLimitRule":
      return <NumberLimitRuleEditor {...props} />;
    case "PercentMultiplierRule":
      return <PercentMultiplierRuleEditor {...props} />;
    case "RatingRule":
      return <RatingRuleEditor {...props} />;
    default:
      return <div>Not implemented</div>;
  }
};

const RuleEditor = (rule: Rule & { onChange: (data: Rule) => void }) => {
  return (
    <div className="border p-4 rounded-md bg-white">
      <RuleComponent {...rule} />
      <select
        value={rule.$type}
        onChange={(e) => rule.onChange({ $type: e.target.value } as Rule)}
      >
        {ruleTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
};

export const RuleBuilder = () => {
  const { data, isLoading } = useSWR("popularityRules", () =>
    getPopularityRules()
  );
  const updateRule = (index: number) => (rule: Rule) => {
    // setRules((prev) => {
    //   const updated = [...prev];
    //   updated[index] = rule;
    //   return updated;
    // });
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>RuleBuilder</h1>
      <div className="flex flex-col gap-8">
        {data?.map((rule, index) => (
          <RuleEditor key={index} {...rule} onChange={updateRule(index)} />
        ))}
      </div>
    </div>
  );
};
