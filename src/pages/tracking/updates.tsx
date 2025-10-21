import useSWR from 'swr'
import { ResultItem } from '../../components/ResultItem'
import { getTrackingUpdates } from '../../lib/datalayer/api'

export const UpdatedItems = () => {
  const { data } = useSWR('/api/updated-items', getTrackingUpdates)

  return (
    <div>
      <h1 className="font-bold text-xl">Updated Items</h1>
      <div className="grid grid-cols-5 gap-5">
        {data?.map((item, i) => {
          return <ResultItem key={`update-${i}`} item={item} position={i} />
        })}
      </div>
    </div>
  )
}
