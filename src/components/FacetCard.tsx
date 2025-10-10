import React, { useState } from 'react'
import { useKeyFacetValuePopularity } from '../hooks/popularityHooks'

interface FacetCardProps {
  facet: {
    id: number
    name: string
    count: number
  }
}

export const FacetCard: React.FC<FacetCardProps> = ({ facet }) => {
  const [open, setOpen] = useState(false)
  const { data } = useKeyFacetValuePopularity(open ? facet.id : undefined)
  return (
    <div className="bg-white rounded-lg shadow-xs p-4 hover:shadow-md transition-shadow duration-200">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center w-full justify-between text-left"
      >
        <h2 className="text-lg font-semibold text-gray-700 line-clamp-1 overflow-ellipsis flex-1">
          {facet.name}
        </h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {facet.count.toFixed(2)}
        </span>
      </button>
      {open && (
        <div>
          {data?.map((item) => (
            <div
              key={item.value}
              className="flex items-center justify-between mt-2"
            >
              <span className="text-gray-600">{item.value}</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                {item.score.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
