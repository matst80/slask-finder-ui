import { MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { useQuery } from '../lib/hooks/useQuery'
import { useStores } from '../lib/datalayer/stores'

export const SelectedStore = () => {
  const {
    query: { stock },
  } = useQuery()
  const { data: stores } = useStores()
  const locationId = stock?.[0]

  const selectedStore = useMemo(() => {
    return locationId != null
      ? stores?.find((store) => store.id === locationId)
      : null
  }, [locationId, stores])

  return (
    <>
      {selectedStore != null && (
        <div className="hidden md:flex items-center text-sm text-gray-600">
          <MapPin size={16} className="mr-1" />
          {selectedStore.displayName}
        </div>
      )}
    </>
  )
}
