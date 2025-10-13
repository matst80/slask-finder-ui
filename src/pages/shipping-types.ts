export type ShippingOption = {
  type: string
  defaultOption?: DeliveryOption
  additionalOptions: DeliveryOption[]
}

export interface DeliveryOption {
  bookingInstructions: BookingInstructions
  descriptiveTexts: DeliveryTexts
  deliveryTime: unknown
  sustainability: unknown
  location: DeliveryLocation
}
type DeliveryTexts = {
  checkout?: CheckoutTexts
}
export type CheckoutTexts = {
  title: string
  briefDescription: string
  fullDescription: string
  friendlyDeliveryInfo: string
}

export interface BookingInstructions {
  deliveryOptionId: string
  serviceCode: string
  additionalServiceCodes: string[]
}

export interface DeliveryLocation {
  name: string
  distanceFromRecipientAddress: number
  address: Address
  coordinate: Coordinate
  openingHours: OpeningHours
}

export interface Address {
  postCode: string
  city: string
  countryCode: string
  streetName: string
  streetNumber: string
}

export interface Coordinate {
  latitude: number
  longitude: number
}

export interface OpeningHours {
  regular: Regular
  deviations: unknown[]
}

export interface Regular {
  monday: Day
  tuesday: Day
  wednesday: Day
  thursday: Day
  friday: Day
  saturday: Day
  sunday: Day
}

export type Day =
  | {
      open: false
    }
  | {
      open: true
      timeRanges: TimeRange[]
    }

export interface TimeRange {
  from: string
  to: string
}
