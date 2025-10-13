import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Input } from '../components/ui/input'
import { useCart } from '../hooks/cartHooks'
import { toJson } from '../lib/datalayer/api'
import { Label } from '../components/ui/label'
import { isDefined } from '../utils'
import { ShippingOption, CheckoutTexts, Day, TimeRange } from './shipping-types'

type ShippingContextProps = {
  options: ShippingOption[]
  isLoading: boolean
  setDeliveryOption: (optionId: string) => void
  checkOptions: (zip: string) => void
}

const ShippingContext = createContext<ShippingContextProps | null>(null)

export const ShippingProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { data, isLoading, mutate } = useCart()

  const [options, setOptions] = useState<
    (ShippingOption & { selected?: boolean })[]
  >([])
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const { id, deliveries } = data ?? {}
  useEffect(() => {
    if (deliveries) {
      const optionTypes = new Set(deliveries.map((d) => d.provider))
      if (options) {
        setOptions(
          options.map((option) => ({
            ...option,
            selected: optionTypes.has(option.type),
          })),
        )
      }
    }
  }, [deliveries])
  useEffect(() => {
    if (id && !options.length) {
      setLoadingOptions(true)
      fetch(`/api/shipping-options/${id}`)
        .then((response) => toJson<ShippingOption[]>(response))
        .then((opts) => {
          const optionTypes = new Set(deliveries?.map((d) => d.provider))
          setOptions(
            opts.map((d) => ({
              ...d,
              selected: optionTypes.has(d.type),
            })) || [],
          )
        })
        .finally(() => {
          setLoadingOptions(false)
        })
    }
  }, [id])
  const checkOptions = useCallback(
    (zip: string) => {
      if (id && zip) {
        fetch(`/api/shipping-options/${id}/${zip}`)
          .then((response) =>
            toJson<{ deliveryOptions: ShippingOption[] }>(response),
          )
          .then((opts) => {
            const optionTypes = new Set(deliveries?.map((d) => d.provider))
            setOptions(
              opts.deliveryOptions.map((d) => ({
                ...d,
                selected: optionTypes.has(d.type),
              })) || [],
            )
          })
      }
    },
    [id],
  )
  const setDeliveryOption = useCallback(
    (optionId: string) => {
      if (id && optionId) {
        fetch(`/api/shipping-options/${id}/${optionId}`, {
          method: 'PUT',
        }).then((response) => {
          response.ok && mutate()
        })
      }
    },
    [id],
  )
  const value = useMemo(
    () => ({
      cart: data,
      options,
      isLoading: isLoading || loadingOptions,
      setDeliveryOption,
      checkOptions,
    }),
    [data, options, isLoading, loadingOptions, setDeliveryOption, checkOptions],
  )
  return (
    <ShippingContext.Provider value={value}>
      {children}
    </ShippingContext.Provider>
  )
}

const useShippingOptions = () => {
  const ctx = useContext(ShippingContext)
  if (!ctx) {
    throw new Error('useShippingOptions must be used within a ShippingProvider')
  }
  return ctx
}

export const ShippingInputs = () => {
  const [zip, setZip] = useState<string>('')
  const { isLoading, checkOptions } = useShippingOptions()
  return (
    <div className="mb-6 flex items-end gap-4">
      <div>
        <Label htmlFor="zip-input">Enter your ZIP code:</Label>
        <Input
          id="zip-input"
          type="text"
          value={zip}
          disabled={isLoading}
          maxLength={5}
          autoComplete="postal-code"
          onChange={(e) => {
            setZip(e.target.value)
            if (e.target.value.length == 5) {
              checkOptions(e.target.value)
            }
          }}
          placeholder="Postnummer"
          className="w-40 mt-1"
        />
      </div>
      {/* <Button
        onClick={() => checkOptions(zip)}
        disabled={zip.length < 5 || isLoading}
        className="h-10 mt-6"
      >
        Check Shipping Options
      </Button> */}
    </div>
  )
}

const ShippingGroup = ({
  defaultOption,
  additionalOptions,
  selected,
  onSelect,
  type,
}: ShippingOption & {
  selected: boolean
  onSelect: () => void
}) => {
  const { setDeliveryOption } = useShippingOptions()
  const [selectedLocationIdx, setSelectedLocationIdx] = useState<number | null>(
    null,
  )
  const texts: CheckoutTexts | undefined =
    defaultOption?.descriptiveTexts?.checkout ||
    additionalOptions?.[0].descriptiveTexts?.checkout
  const allLocations = useMemo(
    () =>
      [defaultOption, ...additionalOptions]
        .filter(
          (d) =>
            d != null &&
            d.location?.name != null &&
            d.location.name.trim() !== '',
        )
        .filter(isDefined),
    [defaultOption, additionalOptions],
  )

  const handleLocationSelect = (idx: number, optionId: string) => {
    setSelectedLocationIdx(idx)
    onSelect()
    setDeliveryOption(optionId)
  }
  return (
    <div
      role={selected ? 'none' : 'button'}
      aria-selected={selected}
      onClick={() => {
        if (!selected) {
          onSelect()
          if (
            allLocations.length == 0 &&
            defaultOption?.bookingInstructions.deliveryOptionId != null
          ) {
            setDeliveryOption(
              defaultOption.bookingInstructions.deliveryOptionId,
            )
          }
        }
      }}
      className={
        `rounded-lg p-4 transition-shadow ` +
        (selected
          ? 'border-2 border-blue-600 bg-blue-50 shadow-lg'
          : 'border border-gray-200 bg-white shadow-sm')
      }
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-lg">{texts?.title ?? type}</div>
          <div className="text-gray-600 text-sm mb-2">
            {Object.values(texts || {}).join(' ')}
          </div>
        </div>
      </div>
      {selected && allLocations.length > 0 && (
        <div className="mt-4">
          <div className="font-medium mb-2">Available Locations:</div>
          <div className="flex flex-wrap gap-4">
            {allLocations.map((locOpt, locIdx) => (
              <button
                key={locIdx}
                className={
                  `text-left rounded-md p-3 min-w-[260px] cursor-pointer transition-all ` +
                  (selectedLocationIdx === locIdx
                    ? 'border-2 border-green-500 bg-green-50'
                    : 'border border-gray-300 bg-gray-50 hover:border-green-400')
                }
                onClick={() =>
                  handleLocationSelect(
                    locIdx,
                    locOpt.bookingInstructions.deliveryOptionId,
                  )
                }
              >
                <div className="font-semibold">{locOpt.location.name}</div>
                <div className="text-gray-700 text-sm">
                  {locOpt.location.address.streetName}{' '}
                  {locOpt.location.address.streetNumber},{' '}
                  {locOpt.location.address.postCode}{' '}
                  {locOpt.location.address.city}
                </div>
                <div className="text-gray-500 text-xs">
                  Distance: {locOpt.location.distanceFromRecipientAddress} m
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Opening hours:</span>
                  <ul className="ml-2 mt-1">
                    {Object.entries(
                      locOpt.location.openingHours.regular ?? {},
                    ).map(([day, val]: [string, Day]) => (
                      <li key={day}>
                        <span className="capitalize">{day}</span>:{' '}
                        {val.open && val.timeRanges != null
                          ? val.timeRanges
                              .map((tr: TimeRange) => `${tr.from}-${tr.to}`)
                              .join(', ')
                          : 'Closed'}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const ShippingOptionList = () => {
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(
    null,
  )
  const { options, isLoading } = useShippingOptions()

  if (isLoading) {
    return <div>Loading shipping options...</div>
  }

  if (!options || options.length === 0) {
    return <div>No shipping options available.</div>
  }

  return (
    <div className="space-y-4">
      {options.map((option, idx) => (
        <ShippingGroup
          key={idx}
          {...option}
          selected={selectedOptionIdx === idx}
          onSelect={() => setSelectedOptionIdx(idx)}
        />
      ))}
    </div>
  )
}

export const Shipping = () => {
  return (
    <div className="container p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-2">Shipping Information</h1>
      <p className="mb-6 text-gray-700">
        Here you can find information about shipping options and policies.
      </p>
      <h2 className="text-xl font-semibold mb-4">Shipping Options</h2>
      <ShippingProvider>
        <ShippingInputs />
        <ShippingOptionList />
      </ShippingProvider>
      {/* {selectedLocation && (
        <div className="mt-8 border-2 border-blue-600 p-6 rounded-xl bg-blue-50">
          <h3 className="font-bold text-lg mb-2">Selected Location Details</h3>
          <div>
            <span className="font-semibold">Name:</span>{" "}
            {selectedLocation.location.name}
          </div>
          <div>
            <span className="font-semibold">Address:</span>{" "}
            {selectedLocation.location.address.streetName}{" "}
            {selectedLocation.location.address.streetNumber},{" "}
            {selectedLocation.location.address.postCode}{" "}
            {selectedLocation.location.address.city}
          </div>
          <div>
            <span className="font-semibold">Distance:</span>{" "}
            {selectedLocation.location.distanceFromRecipientAddress} m
          </div>
        </div>
      )} */}
    </div>
  )
}
