import useSWR from 'swr'
import { getCurrentDataSet } from '../../lib/datalayer/api'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '../../components/ui/table'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useState, useMemo } from 'react'
import fuzzysort from 'fuzzysort'
import { SearchIcon } from 'lucide-react'

const useDataset = () =>
  useSWR('/admin/dataset', getCurrentDataSet, {
    revalidateOnFocus: true,
    refreshInterval: 10000,
    keepPreviousData: true,
  })

export const DatasetViewer = () => {
  const { data, isLoading, error, mutate } = useDataset()
  const [selectedTriplet, setSelectedTriplet] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('')

  // Filtered data using fuzzysort
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []

    if (!filter.trim()) return data

    // Create a list of keys to search in
    const keys = ['query', 'positive', 'negative']

    // Prepare data for fuzzysort
    const result = fuzzysort.go(filter, data, {
      keys,
      threshold: -10000, // Adjust the threshold as needed
      limit: 100, // Maximum number of results
    })

    return result.map((item) => item.obj)
  }, [data, filter])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 w-full max-w-4xl bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8 gap-4">
        <p className="text-red-500">Error loading triplets data</p>
        <Button onClick={() => mutate()}>Retry</Button>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg shadow-sm">
        <p className="text-gray-500">No triplets data available.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Triplets Dataset</h2>
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {filteredData.length} of {data.length} triplets
          </div>
        </div>

        {/* Search filter */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Filter triplets by query, positive or negative..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full shadow-sm"
          />
          {filter && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={() => setFilter('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Clear search</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <Table>
            <TableCaption className="text-gray-500 text-sm italic">
              Dataset triplets for training language models
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-1/3 font-semibold">Query</TableHead>
                <TableHead className="w-1/3 font-semibold">Positive</TableHead>
                <TableHead className="w-1/3 font-semibold">Negative</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((triplet, index) => (
                  <TableRow
                    key={index}
                    className={`
                      transition-colors border-t border-gray-200
                      ${
                        selectedTriplet === index
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }
                    `}
                    onClick={() =>
                      setSelectedTriplet(
                        index === selectedTriplet ? null : index,
                      )
                    }
                  >
                    <TableCell className="align-top">{triplet.query}</TableCell>
                    <TableCell className="align-top">
                      <div className="text-green-600">{triplet.positive}</div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="text-red-600">{triplet.negative}</div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-gray-500"
                  >
                    No matching triplets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
