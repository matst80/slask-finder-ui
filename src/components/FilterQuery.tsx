import { Filter } from 'lucide-react'
import { useDeferredValue, useEffect, useState } from 'react'
import { useQuery } from '../lib/hooks/useQuery'
import { cm } from '../utils'

type Props = {
  show: boolean
}

export const FilterQuery = ({ show }: Props) => {
  const {
    query: { filter },
    setFilterTerm,
  } = useQuery()
  const [value, setValue] = useState<string>(filter ?? '')
  const toFind = useDeferredValue(value)
  useEffect(() => {
    setFilterTerm(toFind)
  }, [toFind, setFilterTerm])
  const doShow = show || !!filter?.length
  return (
    <div
      className={cm(
        'hidden md:block relative flex-1 mb-4 transition-all overflow-hidden',
        doShow ? 'h-11 opacity-100' : 'h-0 opacity-0',
      )}
    >
      <input
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-hidden"
        type="search"
        value={value}
        placeholder="Filter items..."
        onChange={(e) => setValue(e.target.value)}
      />
      <Filter
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />
    </div>
  )
}
