import { X } from 'lucide-react'
import { useCancelPayment } from '../hooks/checkoutHooks'
import { Button } from './ui/button'

type CancelPaymentButtonProps = {
  paymentId: string
}

export const CancelPaymentButton = ({
  paymentId,
}: CancelPaymentButtonProps) => {
  const { trigger: cancelPayment, isMutating: isCancelling } =
    useCancelPayment()

  const handleCancelPayment = async () => {
    if (confirm('Are you sure you want to cancel this payment?')) {
      await cancelPayment(paymentId)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancelPayment}
        disabled={isCancelling}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <X className="size-4 mr-1" />
        {isCancelling ? 'Cancelling...' : 'Cancel Payment'}
      </Button>
    </div>
  )
}
