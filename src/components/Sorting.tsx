import { ArrowUpDown } from 'lucide-react'

import { Sort } from '../lib/types'
import { useQuery } from '../lib/hooks/useQuery'

export const Sorting = () => {
  const {
    query: { sort },
    setSort,
  } = useQuery()
  return (
    <div className="relative">
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as Sort)}
        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="popular">Popularitet</option>
        <option value="price">Pris</option>
        <option value="price_desc">Pris fallande</option>
        <option value="updated">Senast uppdaterat</option>
        {/* <option value="updated_desc">Senast uppdaterat (fallande)</option> */}
        <option value="created">Nyheter</option>
        {/* <option value="created_desc">Älsta</option> */}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </div>
  )
}
