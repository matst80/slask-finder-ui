import { BotMessageSquare } from 'lucide-react'
import { PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { useFacetMap } from '../hooks/searchHooks'
import { useQuery } from '../lib/hooks/useQuery'
import { useTranslations } from '../lib/hooks/useTranslations'
import { AiShoppingProvider, MessageList, QueryInput } from '../pages/AiShopper'
import { convertItemSimple } from '../pages/tools'
import { FilterQuery } from './FilterQuery'
import { Sorting } from './Sorting'
import { Button } from './ui/button'
import { Sidebar } from './ui/sidebar'

export const TotalResultText = ({
  className = 'md:text-2xl font-bold',
}: {
  className?: string
}) => {
  const t = useTranslations()
  const { totalHits } = useQuery()
  return (
    <h1 className={className}>
      {t('result.header', { hits: totalHits ?? '~' })}
    </h1>
  )
}

const AiChatForResults = () => {
  const { hits } = useQuery()
  const { data: facets } = useFacetMap()
  const convertItem = useCallback(convertItemSimple(facets ?? {}), [])
  const contextItems = useMemo(() => {
    return hits.map(convertItem).slice(0, 10)
  }, [hits, convertItem])
  if (contextItems.length === 0) {
    return null
  }
  return (
    <AiShoppingProvider
      messages={[
        {
          role: 'system',
          content:
            'The user needs some help, use items listed here dont search for new ones!\n```json\n' +
            JSON.stringify(contextItems) +
            '\n```',
        },
      ]}
    >
      <div className="flex flex-col gap-6 flex-1">
        <div className="flex-1 overflow-auto">
          <MessageList />
        </div>

        <QueryInput />
      </div>
    </AiShoppingProvider>
  )
}

export const ResultHeader = ({ children }: PropsWithChildren) => {
  const { totalHits, query } = useQuery()
  const [open, setOpen] = useState(false)
  if (totalHits === 0 && !query.filter) {
    return null
  }

  return (
    <>
      <header className="flex justify-end pt-4 md:pt-0 md:justify-between gap-2 items-center mb-2">
        <div className="hidden md:flex justify-between gap-2">
          <TotalResultText />
          <Button
            variant="outline"
            size="sm"
            className="shrink-1"
            title="Ask AI for help"
            onClick={() => setOpen((p) => !p)}
          >
            <BotMessageSquare className="size-5" />
          </Button>
        </div>
        {children}
        <Sidebar side="right" open={open} setOpen={setOpen}>
          <div className="bg-white flex flex-col overflow-y-auto py-6 px-4 h-full w-full max-w-full md:max-w-lg">
            {open && <AiChatForResults />}
          </div>
        </Sidebar>
        <Sorting />
      </header>
      <FilterQuery show={!!query.filter || (totalHits ?? 0) > 40} />
    </>
  )
}
