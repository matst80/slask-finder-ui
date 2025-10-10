export interface Order {
  order_id: string
  purchase_country: string
  purchase_currency: string
  locale: string
  status: string
  billing_address: BillingAddress
  shipping_address: ShippingAddress
  order_amount: number
  order_tax_amount: number
  order_lines: OrderLine[]
  customer: Customer
  merchant_urls: MerchantUrls
  merchant_reference1: string
  started_at: string
  completed_at: string
  last_modified_at: string
  options: Options
}

export interface BillingAddress {
  given_name: string
  family_name: string
  email: string
  street_address: string
  postal_code: string
  city: string
  phone: string
  country: string
}

export interface ShippingAddress {
  given_name: string
  family_name: string
  email: string
  street_address: string
  postal_code: string
  city: string
  phone: string
  country: string
}

export interface OrderLine {
  type: string
  reference: string
  name: string
  quantity: number
  quantity_unit: string
  unit_price: number
  tax_rate: number
  total_amount: number
  total_tax_amount: number
  image_url: string
}

export interface Customer {
  date_of_birth: string
  //  name: string; // Added name property
}

export interface MerchantUrls {
  terms: string
  checkout: string
  confirmation: string
  push: string
  validation: string
}

export interface Options {
  additional_checkbox: any
}
