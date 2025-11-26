import { useReservations } from '../hooks/inventoryHooks'
import { useTranslations } from '../lib/hooks/useTranslations'

const FriendlyTime = ({ time }: { time: string }) => {
  const date = new Date(time)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) {
    return <>less than a minute</>
  }
  return <>{diffMinutes} minutes</>
}

export const ReservationSummary = ({
  sku,
  locationId,
  stock,
}: {
  sku: string
  locationId?: string
  stock?: number
}) => {
  const t = useTranslations()
  const { data, error, isLoading } = useReservations({ sku, locationId })
  if (error) {
    return (
      <span className="text-red-600">Failed to load reservation summary.</span>
    )
  }
  if (isLoading) {
    return <>{t('stock.nr', { stock })}...</>
  }
  if (data == null) {
    return <></>
  }
  if (data.remaining_items === 0 && data.earliest_release != null) {
    return (
      <>
        {t('stock.nr', { stock: 0 })}{' '}
        <span className="text-gray-600 text-xs">
          retry in <FriendlyTime time={data.earliest_release} />
        </span>
      </>
    )
  }
  return <>{t('stock.nr', { stock: data.remaining_items })}</>
}
