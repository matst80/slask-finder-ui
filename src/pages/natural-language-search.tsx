import { useState } from 'react'
import { Item } from '../lib/types'
import { naturalSearch, submitDataSet } from '../lib/datalayer/api'
import { Input } from '../components/ui/input'
import { ImpressionProvider } from '../lib/hooks/ImpressionProvider'
import { ResultItemInner } from '../components/ResultItem'
import { Button } from '../components/ui/button'
import { cm } from '../utils'
import { Search } from 'lucide-react'
import { useNotifications } from '../components/ui-notifications/useNotifications'

const isComplete = (dataset: {
  positive?: string
  negative?: string
}): dataset is { positive: string; negative: string } => {
  return dataset.positive !== undefined && dataset.negative !== undefined
}

const getEmbeddingText = (item: Item) => {
  return `${item.title} ${item.bp} `
}

export const NaturalLanguageSearch = () => {
  const { showNotification } = useNotifications()
  const [term, setTerm] = useState<string>('')
  const [items, setItems] = useState<Item[]>([])
  const [dataset, setDataset] = useState<{
    positive?: string
    negative?: string
  }>({ positive: undefined, negative: undefined })

  const doSearch = async () => {
    naturalSearch(term)
      .then(setItems)
      .catch((error) => {
        console.error('Search error:', error)
      })
  }
  return (
    <div className="flex flex-col container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Embeddings training</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          doSearch()
          setDataset({ positive: undefined, negative: undefined })
        }}
        className="flex gap-2 sticky top-0 bg-white z-10 py-4 border-b border-gray-200"
      >
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Enter your search query"
          className="flex-1"
        />
        <Button type="submit" variant="outline" size="sm">
          <Search className="size-5" />
        </Button>
        <Button
          disabled={!isComplete(dataset)}
          onClick={() => {
            if (isComplete(dataset)) {
              submitDataSet({
                query: term,
                positive: dataset.positive,
                negative: dataset.negative,
              }).then((r) => {
                showNotification({
                  title: r.ok
                    ? 'Dataset submitted'
                    : 'Error submitting dataset',
                  message: `Positive: ${dataset.positive}, Negative: ${dataset.negative}`,
                  variant: r.ok ? 'success' : 'error',
                })
              })
              setDataset({ positive: undefined, negative: undefined })
            }
          }}
        >
          Add
        </Button>
      </form>
      <div className="mt-6">
        {items.length > 0 ? (
          <ImpressionProvider>
            <div
              id="results"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
            >
              {items?.map((item) => {
                const embeddingText = getEmbeddingText(item)
                return (
                  <span
                    key={item.id}
                    className="group bg-white md:shadow-xs hover:shadow-md transition-all hover:z-10 duration-300 animating-element relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-linear-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
                  >
                    <ResultItemInner key={item.id} {...item}>
                      <div className="button-group absolute bottom-10 right-2">
                        {Object.keys(dataset).map((key) => {
                          const isActive =
                            dataset[key as keyof typeof dataset] ===
                            embeddingText
                          return (
                            <button
                              key={key}
                              className={cm(
                                'text-lg font-bold',
                                isActive && 'active',
                              )}
                              onClick={() =>
                                setDataset((prev) => ({
                                  ...prev,
                                  [key]: isActive ? undefined : embeddingText!,
                                }))
                              }
                            >
                              {key === 'positive' ? '+' : '-'}
                            </button>
                          )
                        })}
                      </div>
                    </ResultItemInner>
                  </span>
                )
              })}
            </div>
            {/* {first && (
									<div className="-mx-4 md:-mx-0 mb-6">
										<Banner item={first} />
									</div>
								)}
								{last && (
									<div className="-mx-4 md:-mx-0 mt-6">
										<Banner item={last} />
									</div>
								)} */}
          </ImpressionProvider>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  )
}
