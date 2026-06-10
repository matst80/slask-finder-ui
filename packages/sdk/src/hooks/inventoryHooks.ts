import useSWR from 'swr'
import { getReservationSummary } from '../lib/datalayer/api'

export const useReservations = (payload: {
  sku: string
  locationId?: string
}) => {
  return useSWR(
    `reservations-${payload.sku}-${payload.locationId ?? 'se'}`,
    () => getReservationSummary(payload),
    {
      keepPreviousData: true,
      revalidateOnFocus: true,
      errorRetryInterval: 5000,
    },
  )
}
