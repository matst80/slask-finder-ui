import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useCart } from "../hooks/cartHooks";
import { toJson } from "../lib/datalayer/api";
import { Label } from "../components/ui/label";
import { useTranslations } from "../lib/hooks/useTranslations";
import { TranslationKey } from "../translations/translations";
import { isDefined } from "../utils";

type ShippingOption = {
  type: string;
  defaultOption?: DeliveryOption;
  additionalOptions: DeliveryOption[];
};

export interface DeliveryOption {
  bookingInstructions: BookingInstructions;
  descriptiveTexts: DeliveryTexts;
  deliveryTime: unknown;
  sustainability: unknown;
  location: DeliveryLocation;
}

type DeliveryTexts = {
  checkout?: CheckoutTexts;
};

type CheckoutTexts = {
  title: string;
  briefDescription: string;
  fullDescription: string;
  friendlyDeliveryInfo: string;
};

export interface BookingInstructions {
  deliveryOptionId: string;
  serviceCode: string;
  additionalServiceCodes: string[];
}

export interface DeliveryLocation {
  name: string;
  distanceFromRecipientAddress: number;
  address: Address;
  coordinate: Coordinate;
  openingHours: OpeningHours;
}

export interface Address {
  postCode: string;
  city: string;
  countryCode: string;
  streetName: string;
  streetNumber: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface OpeningHours {
  regular: Regular;
  deviations: unknown[];
}

export interface Regular {
  monday: Day;
  tuesday: Day;
  wednesday: Day;
  thursday: Day;
  friday: Day;
  saturday: Day;
  sunday: Day;
}

export type Day =
  | {
      open: false;
    }
  | {
      open: true;
      timeRanges: TimeRange[];
    };

export interface TimeRange {
  from: string;
  to: string;
}

const useShippingOptions = () => {
  const { data, isLoading } = useCart();
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const { id } = data ?? {};
  useEffect(() => {
    if (id && !options.length) {
      fetch(`/api/shipping-options/${id}`)
        .then((response) => toJson<ShippingOption[]>(response))
        .then((opts) => {
          console.log("Shipping options fetched:", opts);
          if (opts) {
            setOptions(opts);
          }
          setOptions(opts || []);
        });
    }
  }, [id]);
  const checkOptions = useCallback(
    (zip: string) => {
      if (id && zip) {
        fetch(`/api/shipping-options/${id}/${zip}`)
          .then((response) =>
            toJson<{ deliveryOptions: ShippingOption[] }>(response)
          )
          .then((opts) => {
            if (opts.deliveryOptions) {
              setOptions(opts.deliveryOptions);
            }
            setOptions(opts.deliveryOptions || []);
          });
      }
    },
    [id]
  );
  return {
    cart: data,
    options,
    isLoading,
    checkOptions,
  };
};

export const Shipping = () => {
  const [zip, setZip] = useState<string>("79147");
  const { isLoading, options, checkOptions, cart } = useShippingOptions();
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(
    null
  );
  const [selectedLocationIdx, setSelectedLocationIdx] = useState<number | null>(
    null
  );

  const handleOptionSelect = (idx: number) => {
    setSelectedOptionIdx(idx);
    setSelectedLocationIdx(null);
  };

  const handleLocationSelect = (idx: number, optionId: string) => {
    if (cart?.id != null) {
      fetch(`/api/shipping-options/${cart?.id}/${optionId}`, {
        method: "PUT",
      });
    }
    setSelectedLocationIdx(idx);
  };

  const selectedOption =
    selectedOptionIdx !== null ? options?.[selectedOptionIdx] : null;
  const allLocations = selectedOption
    ? [
        selectedOption.defaultOption,
        ...selectedOption.additionalOptions,
      ].filter(isDefined)
    : [];

  const t = useTranslations();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-2">Shipping Information</h1>
      <p className="mb-6 text-gray-700">
        Here you can find information about shipping options and policies.
      </p>
      <h2 className="text-xl font-semibold mb-4">Shipping Options</h2>
      <div className="mb-6 flex items-end gap-4">
        <div>
          <Label htmlFor="zip-input">Enter your ZIP code:</Label>
          <Input
            id="zip-input"
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="Enter ZIP code"
            className="w-40 mt-1"
          />
        </div>
        <Button
          onClick={() => checkOptions(zip)}
          disabled={zip.length < 5}
          className="h-10 mt-6"
        >
          Check Shipping Options
        </Button>
      </div>
      {options?.length > 0 ? (
        <div className="flex flex-col gap-6">
          {options?.map((opt, idx) => {
            const selected = selectedOptionIdx === idx;

            const texts: CheckoutTexts | undefined =
              opt.defaultOption?.descriptiveTexts?.checkout ||
              opt.additionalOptions?.[0].descriptiveTexts?.checkout;
            return (
              <div
                key={idx}
                role={selected ? "none" : "button"}
                aria-selected={selected}
                onClick={() => {
                  if (!selected) {
                    handleOptionSelect(idx);
                  }
                }}
                className={
                  `rounded-lg p-4 transition-shadow ` +
                  (selectedOptionIdx === idx
                    ? "border-2 border-blue-600 bg-blue-50 shadow-lg"
                    : "border border-gray-200 bg-white shadow-sm")
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">
                      {texts?.title ?? t(opt.type as TranslationKey)}
                    </div>
                    <div className="text-gray-600 text-sm mb-2">
                      {Object.values(texts || {}).join(" ")}
                    </div>
                  </div>
                </div>
                {selected && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Available Locations:</div>
                    <div className="flex flex-wrap gap-4">
                      {allLocations
                        .filter(
                          (locOpt): locOpt is DeliveryOption =>
                            !!locOpt &&
                            !!locOpt.location &&
                            !!locOpt.location.name
                        )
                        .map((locOpt, locIdx) => (
                          <button
                            key={locIdx}
                            className={
                              `text-left rounded-md p-3 min-w-[260px] cursor-pointer transition-all ` +
                              (selectedLocationIdx === locIdx
                                ? "border-2 border-green-500 bg-green-50"
                                : "border border-gray-300 bg-gray-50 hover:border-green-400")
                            }
                            onClick={() =>
                              handleLocationSelect(
                                locIdx,
                                locOpt.bookingInstructions.deliveryOptionId
                              )
                            }
                          >
                            <div className="font-semibold">
                              {locOpt.location.name}
                            </div>
                            <div className="text-gray-700 text-sm">
                              {locOpt.location.address.streetName}{" "}
                              {locOpt.location.address.streetNumber},{" "}
                              {locOpt.location.address.postCode}{" "}
                              {locOpt.location.address.city}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Distance:{" "}
                              {locOpt.location.distanceFromRecipientAddress} m
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">
                                Opening hours:
                              </span>
                              <ul className="ml-2 mt-1">
                                {Object.entries(
                                  locOpt.location.openingHours.regular ?? {}
                                ).map(([day, val]: [string, Day]) => (
                                  <li key={day}>
                                    <span className="capitalize">{day}</span>:{" "}
                                    {val.open && val.timeRanges != null
                                      ? val.timeRanges
                                          .map(
                                            (tr: TimeRange) =>
                                              `${tr.from}-${tr.to}`
                                          )
                                          .join(", ")
                                      : "Closed"}
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
            );
          })}
        </div>
      ) : (
        <div className="text-gray-400 mt-6">
          No shipping options found for this ZIP code.
        </div>
      )}
      {selectedOption &&
        selectedLocationIdx !== null &&
        allLocations[selectedLocationIdx] && (
          <div className="mt-8 border-2 border-blue-600 p-6 rounded-xl bg-blue-50">
            <h3 className="font-bold text-lg mb-2">
              Selected Location Details
            </h3>
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {allLocations[selectedLocationIdx].location.name}
            </div>
            <div>
              <span className="font-semibold">Address:</span>{" "}
              {allLocations[selectedLocationIdx].location.address.streetName}{" "}
              {allLocations[selectedLocationIdx].location.address.streetNumber},{" "}
              {allLocations[selectedLocationIdx].location.address.postCode}{" "}
              {allLocations[selectedLocationIdx].location.address.city}
            </div>
            <div>
              <span className="font-semibold">Distance:</span>{" "}
              {
                allLocations[selectedLocationIdx].location
                  .distanceFromRecipientAddress
              }{" "}
              m
            </div>
          </div>
        )}
    </div>
  );
};
