import { useStores } from '../lib/datalayer/stores'
import { Item } from '../lib/types'

export const StoreList = ({ stock }: { stock: Item['stock'] }) => {
  const { data: stores } = useStores()
  return (
    <div className="absolute bg-white p-4">
      {Object.entries(stock ?? {})?.map(([id, level]) => {
        const storeName = stores?.find((d) => d.id === id)?.displayName ?? id
        return (
          <div>
            {storeName}: {level}
          </div>
        )
      })}
    </div>
  )
}
