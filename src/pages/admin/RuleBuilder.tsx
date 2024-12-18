import { useId, useState } from "react";
import { useFacetList } from "../../hooks/searchHooks";
import { Rule, ValueMatch, itemProperties, MatchRule, DiscountRule, ruleTypes, Rules } from "../../types"
import useSWR from "swr"
import { getPopularityRules } from "../../datalayer/api"



type EditorProps<T extends Rule> = T & {
  onChange: (data: T) => void;
};

type FieldSelectorProps = ValueMatch & {
  onChange: (data: ValueMatch) => void;
};

const popularityRules: Rules = [
  {
    source: "fieldId",
    fieldId: 9,
    match: "Elgiganten",
    value: 0,
    valueIfNotMatch: -12000,
    $type: "MatchRule",
  },
  {
    source: "fieldId",
    fieldId: 10,
    match: "Outlet",
    value: 0,
    valueIfNotMatch: -6000,
    $type: "MatchRule",
  },
  { multiplier: 30, valueIfMatch: 4500, $type: "DiscountRule" },
  {
    source: "property",
    property: "Buyable",
    match: true,
    value: 5000,
    valueIfNotMatch: -2000,
    $type: "MatchRule",
  },
  { noStoreMultiplier: 20, noStockValue: -6000, $type: "OutOfStockRule" },
  {
    source: "property",
    property: "BadgeUrl",
    match: "",
    invert: true,
    value: 0,
    valueIfNotMatch: 4500,
    $type: "MatchRule",
  },
  {
    source: "fieldId",
    fieldId: 4,
    limit: 99999900,
    comparator: "\u003e",
    value: -2500,
    valueIfNotMatch: 0,
    $type: "NumberLimitRule",
  },
  {
    source: "fieldId",
    fieldId: 4,
    limit: 10000,
    comparator: "\u003c",
    value: -800,
    valueIfNotMatch: 0,
    $type: "NumberLimitRule",
  },
  {
    source: "property",
    property: "MarginPercent",
    multiplier: 50,
    min: 0,
    max: 100,
    $type: "PercentMultiplierRule",
  },
  { multiplier: 0.06, subtractValue: -20, $type: "RatingRule" },
  {
    source: "property",
    property: "Created",
    hourMultiplier: -0.019,
    $type: "AgedRule",
  },
  {
    source: "property",
    property: "LastUpdate",
    hourMultiplier: -0.0002,
    $type: "AgedRule",
  },
];

const FieldSelector = ({ fieldId, property }: FieldSelectorProps) => {
  const [value, setValue] = useState(fieldId || property || "");
  const { data, isLoading } = useFacetList();
  const id = useId();

  return (
    <>
      <fieldset>
        <p>
          <label>Match</label>
          <input
            list={id}
            value={String(value)}
            onChange={(e) => setValue(e.target.value)}
          />
          <datalist id={id}>
            {itemProperties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
            {data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </datalist>
        </p>
        <p>
          <label>Field</label>
          <div>
            {fieldId !== undefined ? (
              <span>{data?.find((d) => d.id == fieldId)?.name}</span>
            ) : (
              <span>{property}</span>
            )}
          </div>
        </p>
      </fieldset>
    </>
  );
};

const MatchRuleEditor = ({ onChange, ...rule }: EditorProps<MatchRule>) => {
  return (
    <div>
      <h1>MatchRule</h1>
      <input type="text" defaultValue={String(rule.match)} />
      <input type="checkbox" defaultChecked={rule.invert ?? false} />
      <FieldSelector
        {...rule}
        onChange={(data) => onChange({ ...rule, ...data })}
      />
    </div>
  );
};

export const DiscountRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<DiscountRule>) => {
  return (
    <div>
      <h1>DiscountRule</h1>
      <pre>{JSON.stringify(rule, null, 2)}</pre>
    </div>
  );
};

const RuleComponent = (props: EditorProps<Rule>) => {
  switch (props.$type) {
    case "MatchRule":
      return <MatchRuleEditor {...props} />;
    default:
      return <div>Not implemented</div>;
  }
};

const RuleEditor = (rule: Rule & { onChange: (data: Rule) => void }) => {
  return (
    <div className="border p-4 rounded-md bg-white">
      <h1>{rule.$type}</h1>
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
        {data.map((rule, index) => (
          <RuleEditor key={index} {...rule} onChange={updateRule(index)} />
        ))}
      </div>
    </div>
  );
};
