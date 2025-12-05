import { Check } from 'lucide-react'
import { CheckoutPayment } from '../lib/datalayer/checkout-api'
import { PriceValue } from './Price'
import '@adyen/adyen-web/styles/adyen.css'
import { AdyenPaymentUI } from './AdyenPaymentUI'
import { KlarnaPaymentUI } from './KlarnaPaymentUi'

type PaymentProviderUIProps = {
  payment: CheckoutPayment
}

export const PaymentProviderUI = ({ payment }: PaymentProviderUIProps) => {
  if (!payment.provider) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-600">Unknown payment provider</p>
      </div>
    )
  }

  switch (payment.provider.toLowerCase()) {
    case 'klarna':
      return <KlarnaPaymentUI payment={payment} />
    case 'adyen':
      return <AdyenPaymentUI payment={payment} />
    default:
      if (payment.status === 'success' && payment.completedAt) {
        return (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{payment.provider} Payment</h3>
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                {payment.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={24} />
              <span>
                Paid <PriceValue value={payment.amount} /> {payment.currency}
              </span>
            </div>
          </div>
        )
      }
      return (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{payment.provider} Payment</h3>
            <span
              className={`text-xs px-2 py-1 rounded ${
                payment.status === 'success'
                  ? 'bg-green-100 text-green-800'
                  : payment.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {payment.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Payment ID: {payment.paymentId}
          </p>
        </div>
      )
  }
}
