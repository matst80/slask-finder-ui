import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import {
  CustomDropdown,
  DropdownItem,
} from '../../components/ui/custom-dropdown'
import { Input } from '../../components/ui/input'
import { useFacetList } from '../../hooks/searchHooks'
import { getPopularityRules, setPopularityRules } from '../../lib/datalayer/api'
import {
  DiscountRule,
  MatchRule,
  NumberComparitor,
  NumberLimitRule,
  OutOfStockRule,
  PercentMultiplierRule,
  RatingRule,
  Rule,
  Rules,
  ruleTypes,
  ValueMatch,
} from '../../lib/types'

type EditorProps<T extends Rule> = T & {
  onChange: (data: T) => void
}

const itemProperties = [
  'Url',
  'Disclaimer',
  'ReleaseDate',
  'SaleStatus',
  'MarginPercent',
  'PresaleDate',
  'Restock',
  'AdvertisingText',
  'Img',
  'BadgeUrl',
  'EnergyRating',
  'BulletPoints',
  'LastUpdate',
  'Created',
  'Buyable',
  'Description',
  'BuyableInStore',
  'BoxSize',
  'CheapestBItem',
  'AItem',
  'ArticleType',
  'StockLevel',
  'Stock',
  'Id',
  'Sku',
  'Title',
]

const FieldSelector = ({
  onChange,
  value,
}: {
  onChange: (data: ValueMatch) => void
  value: ValueMatch
}) => {
  const { data } = useFacetList()
  const items = useMemo<DropdownItem<ValueMatch>[]>(() => {
    return [
      ...itemProperties.map((d) => ({
        key: d,
        type: 'Property',
        data: { source: 'property', property: d } satisfies ValueMatch,
        text: d,
      })),
      ...(data?.map((field) => ({
        key: String(field.id),
        type: 'Field',
        data: { source: 'fieldId', fieldId: field.id } satisfies ValueMatch,
        text: field.name,
      })) ?? []),
    ]
  }, [data])

  const [selectedValue, setSelectedValue] = useState<string | undefined>()

  useEffect(() => {
    const { source } = value
    setSelectedValue(
      source == 'fieldId' ? String(value.fieldId) : value.property,
    )
  }, [value])

  const selectedItem = useMemo(
    () => items.find((item) => item.key === selectedValue),
    [items, selectedValue],
  )

  const handleSelect = (item: (typeof items)[number]) => {
    setSelectedValue(item.key)
    onChange(item.data)
  }

  return (
    <div className="mb-4">
      <CustomDropdown
        items={items}
        selectedItem={selectedItem}
        onSelect={handleSelect}
        placeholder="Select a field or property"
        label="Source Field"
      />
    </div>
  )
}

const LabelFor = ({
  children,
  label,
}: PropsWithChildren<{ label: string }>) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div>{children}</div>
    </div>
  )
}

const InputWithLabel = ({
  label,
  ...inputProps
}: React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { label: string }) => {
  return (
    <LabelFor label={label}>
      <Input {...inputProps} />
    </LabelFor>
  )
}

const DiscountRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<DiscountRule>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Discount Based Rule
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Apply a multiplier to the discount percentage or a static value for sale
        items.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithLabel
          type="number"
          value={rule.multiplier || 0}
          onChange={(e) =>
            onChange({ ...rule, multiplier: Number(e.target.value) })
          }
          label="Discount Multiplier"
          placeholder="Multiplier value"
        />

        <InputWithLabel
          type="number"
          value={rule.valueIfMatch || 0}
          onChange={(e) =>
            onChange({ ...rule, valueIfMatch: Number(e.target.value) })
          }
          label="Static Value for Sale Items"
          placeholder="Value if matching"
        />
      </div>
    </div>
  )
}

const NumberLimitRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<NumberLimitRule>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Number Limit Rule
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Apply a value based on numeric field comparisons.
      </p>

      <FieldSelector
        value={rule}
        onChange={(data) => onChange({ ...rule, ...data })}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputWithLabel
          type="number"
          value={rule.multiplier || 0}
          onChange={(e) =>
            onChange({ ...rule, multiplier: Number(e.target.value) })
          }
          label="Multiplier"
          placeholder="Value multiplier"
        />

        <InputWithLabel
          type="number"
          value={rule.limit || 0}
          onChange={(e) => onChange({ ...rule, limit: Number(e.target.value) })}
          label="Limit"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comparator
          </label>
          <select
            value={rule.comparator || '>'}
            onChange={(e) =>
              onChange({
                ...rule,
                comparator: e.target.value as NumberComparitor,
              })
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-hidden focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value=">">Greater than (&gt;)</option>
            <option value="<">Less than (&lt;)</option>
            <option value=">=">Greater than or equal (&gt;=)</option>
            <option value="<=">Less than or equal (&lt;=)</option>
            <option value="==">Equal (==)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithLabel
          type="number"
          value={rule.value || 0}
          onChange={(e) => onChange({ ...rule, value: Number(e.target.value) })}
          label="Value if Matching"
        />

        <InputWithLabel
          type="number"
          value={rule.valueIfNotMatch || 0}
          onChange={(e) =>
            onChange({ ...rule, valueIfNotMatch: Number(e.target.value) })
          }
          label="Value if NOT Matching"
        />
      </div>
    </div>
  )
}

const PercentMultiplierRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<PercentMultiplierRule>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Percent Multiplier Rule
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Apply a multiplier to percentage values with optional min/max
        constraints.
      </p>

      <FieldSelector
        value={rule}
        onChange={(data) => onChange({ ...rule, ...data })}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputWithLabel
          type="number"
          value={rule.multiplier || 0}
          onChange={(e) =>
            onChange({ ...rule, multiplier: Number(e.target.value) })
          }
          label="Multiplier"
        />

        <InputWithLabel
          type="number"
          value={rule.min || 0}
          onChange={(e) => onChange({ ...rule, min: Number(e.target.value) })}
          label="Minimum Value"
        />

        <InputWithLabel
          type="number"
          value={rule.max || 0}
          onChange={(e) => onChange({ ...rule, max: Number(e.target.value) })}
          label="Maximum Value"
        />
      </div>
    </div>
  )
}

const MatchRuleEditor = ({ onChange, ...rule }: EditorProps<MatchRule>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Match Value Rule
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Apply a value if the selected field matches the specified value.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldSelector
          value={rule}
          onChange={(data) => onChange({ ...rule, ...data })}
        />

        <InputWithLabel
          type="text"
          value={String(rule.match || '')}
          onChange={(e) => onChange({ ...rule, match: e.target.value })}
          label="Match Value"
          placeholder="Value to match"
        />
      </div>

      <div className="flex items-center mt-4 bg-gray-50 p-3 rounded-md">
        <input
          id="invert"
          name="invert"
          type="checkbox"
          checked={rule.invert ?? false}
          onChange={(e) => onChange({ ...rule, invert: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-sm"
        />
        <label htmlFor="invert" className="ml-2 block text-sm text-gray-900">
          Invert match (apply value when NOT matching)
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <InputWithLabel
          type="number"
          value={rule.value || 0}
          onChange={(e) => onChange({ ...rule, value: Number(e.target.value) })}
          label="Value if Matching"
          placeholder="Value to apply when matching"
        />

        <InputWithLabel
          type="number"
          value={rule.valueIfNotMatch || 0}
          onChange={(e) =>
            onChange({ ...rule, valueIfNotMatch: Number(e.target.value) })
          }
          label="Value if NOT Matching"
          placeholder="Value to apply when not matching"
        />
      </div>
    </div>
  )
}

const OutOfStockRuleEditor = ({
  onChange,
  ...rule
}: EditorProps<OutOfStockRule>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Inventory Rule
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Adjust ranking based on product inventory status.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithLabel
          type="number"
          value={rule.noStoreMultiplier || 0}
          onChange={(e) =>
            onChange({ ...rule, noStoreMultiplier: Number(e.target.value) })
          }
          label="Stock Locations Multiplier"
          placeholder="Multiplier for stock locations"
        />

        <InputWithLabel
          type="number"
          value={rule.noStockValue || 0}
          onChange={(e) =>
            onChange({ ...rule, noStockValue: Number(e.target.value) })
          }
          label="Out of Stock Value"
          placeholder="Value for out of stock items"
        />
      </div>
    </div>
  )
}

const RatingRuleEditor = ({ onChange, ...rule }: EditorProps<RatingRule>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Rating Rule
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Adjust ranking based on product ratings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputWithLabel
          type="number"
          value={rule.multiplier || 0}
          onChange={(e) =>
            onChange({ ...rule, multiplier: Number(e.target.value) })
          }
          label="Rating Multiplier"
        />

        <InputWithLabel
          type="number"
          value={rule.subtractValue || 0}
          onChange={(e) =>
            onChange({ ...rule, subtractValue: Number(e.target.value) })
          }
          label="Subtract from Rating"
          placeholder="Value to subtract"
        />

        <InputWithLabel
          type="number"
          value={rule.valueIfNoMatch || 0}
          onChange={(e) =>
            onChange({ ...rule, valueIfNoMatch: Number(e.target.value) })
          }
          label="No Rating Value"
          placeholder="Value if no rating"
        />
      </div>
    </div>
  )
}

const RuleComponent = (props: EditorProps<Rule>) => {
  switch (props.$type) {
    case 'MatchRule':
      return <MatchRuleEditor {...(props as EditorProps<MatchRule>)} />
    case 'DiscountRule':
      return <DiscountRuleEditor {...(props as EditorProps<DiscountRule>)} />
    case 'OutOfStockRule':
      return (
        <OutOfStockRuleEditor {...(props as EditorProps<OutOfStockRule>)} />
      )
    case 'NumberLimitRule':
      return (
        <NumberLimitRuleEditor {...(props as EditorProps<NumberLimitRule>)} />
      )
    case 'PercentMultiplierRule':
      return (
        <PercentMultiplierRuleEditor
          {...(props as EditorProps<PercentMultiplierRule>)}
        />
      )
    case 'RatingRule':
      return <RatingRuleEditor {...(props as EditorProps<RatingRule>)} />
    default:
      return <div>Not implemented</div>
  }
}

const RuleEditor = (rule: Rule & { onChange: (data: Rule) => void }) => {
  return (
    <div className="border rounded-lg shadow-xs bg-white overflow-hidden">
      <div className="px-6 py-4">
        <RuleComponent {...rule} />
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Rule Type
          </label>
          <select
            value={rule.$type}
            onChange={(e) => rule.onChange({ $type: e.target.value } as Rule)}
            className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-hidden focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {ruleTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/Rule$/, '')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export const RuleBuilder = () => {
  const { data, isLoading, mutate } = useSWR('popularityRules', () =>
    getPopularityRules(),
  )
  const update = useSWRMutation(
    'popularityRules',
    (_, { arg }: { arg: Rules }) => setPopularityRules(arg),
  )

  const updateRule = (index: number) => (rule: Rule) => {
    const payload = data?.map((r, i) => (i === index ? rule : r)) ?? []
    //mutate(payload, { revalidate: false });
    update.trigger(payload, { revalidate: false })
  }

  const addNewRule = () => {
    const newRule: MatchRule = {
      $type: 'MatchRule',
      match: '',
      source: 'property',
      property: 'Title',
      value: 1,
      valueIfNotMatch: 0,
    }

    const newRules = [...(data || []), newRule]
    mutate(newRules, { revalidate: false })
    update.trigger(newRules)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Popularity Rules Builder
        </h1>
        <p className="mt-2 text-gray-600">
          Configure rules to determine item popularity and influence search
          result ranking.
        </p>
      </div>

      <div className="space-y-6">
        {data?.map((rule, index) => (
          <RuleEditor key={index} {...rule} onChange={updateRule(index)} />
        ))}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={addNewRule}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Rule
          </button>
        </div>
      </div>
    </div>
  )
}
