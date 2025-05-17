import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useCart } from "../hooks/cartHooks";
import { toJson } from "../lib/datalayer/api";
import { JsonView } from "./tracking/JsonView";

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
  location: Location;
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
  deviations: any[];
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
  const checkOptions = () => {
    fetch(`/api/shipping-options/${data?.id}/${zip}`)
      .then((response) => {
        return toJson<ShippingOption[]>(response);
      })
      .then(setOptions);
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Shipping Information</h1>
      <p>Here you can find information about shipping options and policies.</p>
      {/* Additional content related to shipping can be added here */}
      <JsonView data={options} />
      <div>
        <label>
          Enter your ZIP code:
          <Input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="Enter ZIP code"
          />
        </label>
        <Button onClick={checkOptions}>Check Shipping Options</Button>
      </div>
    </div>
  );
};
