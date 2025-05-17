import { useState, useTransition } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useCart } from "../hooks/cartHooks";
import { toJson } from "../lib/datalayer/api";
import { JsonView } from "./tracking/JsonView";
import { Label } from "../components/ui/label";
import { useTranslations } from "../lib/hooks/useTranslations";
import { TranslationKey } from "../translations/translations";

type ShippingOption = {
  type: string;
  defaultOption?: DeliveryOption;
  additionalOptions: DeliveryOption[];
};

export interface DeliveryOption {
  bookingInstructions: BookingInstructions;
  descriptiveTexts: Record<string, string>;
  deliveryTime: unknown;
  sustainability: unknown;
  location: Location2;
}

export interface BookingInstructions {
  deliveryOptionId: string;
  serviceCode: string;
  additionalServiceCodes: string[];
}

export interface Location2 {
  name: string;
  distanceFromRecipientAddress: number;
  address: Address2;
  coordinate: Coordinate;
  openingHours: OpeningHours;
}

export interface Address2 {
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

export interface Day {
  open: boolean;
  timeRanges: TimeRange[];
}

export interface TimeRange {
  from: string;
  to: string;
}

export const Shipping = () => {
  const [zip, setZip] = useState<string>("79147");
  const { data, isLoading } = useCart();
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(
    null
  );
  const [selectedLocationIdx, setSelectedLocationIdx] = useState<number | null>(
    null
  );

  const checkOptions = () => {
    fetch(`/api/shipping-options/${data?.id}/${zip}`)
      .then((response) =>
        toJson<{ deliveryOptions: ShippingOption[] }>(response)
      )
      .then((opts) => {
        setOptions(opts.deliveryOptions || []);
        setSelectedOptionIdx(null);
        setSelectedLocationIdx(null);
      });
  };

  const handleOptionSelect = (idx: number) => {
    setSelectedOptionIdx(idx);
    setSelectedLocationIdx(null);
  };

  const handleLocationSelect = (idx: number) => {
    setSelectedLocationIdx(idx);
  };

  const selectedOption =
    selectedOptionIdx !== null ? options[selectedOptionIdx] : null;
  const allLocations = selectedOption
    ? [
        selectedOption.defaultOption,
        ...selectedOption.additionalOptions,
      ].filter(Boolean)
    : [];
  // const selectedLocation =
  //   selectedLocationIdx !== null ? allLocations[selectedLocationIdx] : null;

  const t = useTranslations();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Shipping Information</h1>
      <p>Here you can find information about shipping options and policies.</p>
      <h2>Shipping Options</h2>
      <div style={{ marginBottom: 24 }}>
        <Label htmlFor="zip-input">Enter your ZIP code:</Label>
        <Input
          id="zip-input"
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Enter ZIP code"
          style={{ marginRight: 8, width: 160 }}
        />
        <Button onClick={checkOptions}>Check Shipping Options</Button>
      </div>
      {options.length > 0 ? (
        <div
          className="shipping-options-list"
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {options.map((opt, idx) => (
            <div
              key={idx}
              style={{
                border:
                  selectedOptionIdx === idx
                    ? "2px solid #2563eb"
                    : "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                background: selectedOptionIdx === idx ? "#f0f6ff" : "#fff",
                boxShadow:
                  selectedOptionIdx === idx
                    ? "0 2px 8px #2563eb22"
                    : "0 1px 4px #0001",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    {t(opt.type as TranslationKey)}
                  </div>
                  <div style={{ color: "#555", fontSize: 14, marginBottom: 8 }}>
                    {Object.values(
                      opt.defaultOption?.descriptiveTexts || {}
                    ).join(" ")}
                  </div>
                </div>
                <Button
                  variant={selectedOptionIdx === idx ? "default" : "outline"}
                  onClick={() => handleOptionSelect(idx)}
                  style={{ minWidth: 120 }}
                >
                  {selectedOptionIdx === idx ? "Selected" : "Select"}
                </Button>
              </div>
              {selectedOptionIdx === idx && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>
                    Available Locations:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                    {[opt.defaultOption, ...opt.additionalOptions]
                      .filter(
                        (locOpt): locOpt is DeliveryOption =>
                          !!locOpt && !!locOpt.location
                      )
                      .map((locOpt, locIdx) => (
                        <div
                          key={locIdx}
                          style={{
                            border:
                              selectedLocationIdx === locIdx
                                ? "2px solid #22c55e"
                                : "1px solid #ccc",
                            borderRadius: 6,
                            padding: 12,
                            minWidth: 260,
                            background:
                              selectedLocationIdx === locIdx
                                ? "#f0fff4"
                                : "#fafafa",
                            cursor: "pointer",
                          }}
                          onClick={() => handleLocationSelect(locIdx)}
                        >
                          <div style={{ fontWeight: 600 }}>
                            {locOpt.location.name}
                          </div>
                          <div style={{ fontSize: 13, color: "#555" }}>
                            {locOpt.location.address.streetName}{" "}
                            {locOpt.location.address.streetNumber},{" "}
                            {locOpt.location.address.postCode}{" "}
                            {locOpt.location.address.city}
                          </div>
                          <div style={{ fontSize: 13, color: "#888" }}>
                            Distance:{" "}
                            {locOpt.location.distanceFromRecipientAddress} m
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#888",
                              marginTop: 4,
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>
                              Opening hours:
                            </span>
                            <ul
                              style={{
                                margin: 0,
                                padding: 0,
                                listStyle: "none",
                              }}
                            >
                              {Object.entries(
                                locOpt.location.openingHours.regular
                              ).map(([day, val]) => (
                                <li key={day}>
                                  {day.charAt(0).toUpperCase() + day.slice(1)}:{" "}
                                  {val.open
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
                          {selectedLocationIdx === locIdx && (
                            <div
                              style={{
                                marginTop: 8,
                                color: "#16a34a",
                                fontWeight: 500,
                              }}
                            >
                              Selected
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "#888", marginTop: 24 }}>
          No shipping options found for this ZIP code.
        </div>
      )}
      {selectedOption &&
        selectedLocationIdx !== null &&
        allLocations[selectedLocationIdx] && (
          <div
            style={{
              marginTop: 32,
              border: "2px solid #2563eb",
              padding: 20,
              borderRadius: 10,
              background: "#f0f6ff",
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
              Selected Location Details
            </h3>
            <div>
              <strong>Name:</strong>{" "}
              {allLocations[selectedLocationIdx].location.name}
            </div>
            <div>
              <strong>Address:</strong>{" "}
              {allLocations[selectedLocationIdx].location.address.streetName}{" "}
              {allLocations[selectedLocationIdx].location.address.streetNumber},{" "}
              {allLocations[selectedLocationIdx].location.address.postCode}{" "}
              {allLocations[selectedLocationIdx].location.address.city}
            </div>
            <div>
              <strong>Distance:</strong>{" "}
              {
                allLocations[selectedLocationIdx].location
                  .distanceFromRecipientAddress
              }{" "}
              m
            </div>
            {/* <div style={{ marginTop: 8 }}>
              <strong>Opening hours:</strong>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {Object.entries(
                  allLocations[selectedLocationIdx].location.openingHours
                    .regular
                ).map(([day, val]) => (
                  <li key={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}:{" "}
                    {val.open
                      ? val.timeRanges
                          .map((tr) => `${tr.from}-${tr.to}`)
                          .join(", ")
                      : "Closed"}
                  </li>
                ))}
              </ul> 
            </div>*/}
          </div>
        )}
    </div>
  );
};
