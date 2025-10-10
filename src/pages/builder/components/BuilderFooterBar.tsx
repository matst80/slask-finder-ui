import { PropsWithChildren } from 'react'
import { useBuilderContext } from '../useBuilderContext'
import { ButtonLink } from '../../../components/ui/button'
import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { useBuilderSum } from '../useBuilderSum'
import { useRecommendedWatt } from '../useRecommendedWatt'
import { useTranslations } from '../../../lib/hooks/useTranslations'

export const BuilderFooterBar = ({ children }: PropsWithChildren) => {
  const { setSelectedItems, selectedItems } = useBuilderContext()
  const neededPsuWatt = useRecommendedWatt()
  const sum = useBuilderSum()
  const t = useTranslations()

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 md:py-4">
        <div className="flex md:justify-between gap-4 items-center">
          {/* Price information */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex-col hidden sm:flex">
              <h2 className="text-gray-700 font-medium">
                {t('builder.footer.sum')}
              </h2>
              <span className="text-xs text-gray-500">
                {t('builder.footer.psu', { watt: neededPsuWatt })}
              </span>
            </div>
            <span className="text-xl md:text-3xl font-bold md:ml-auto sm:ml-0">
              {sum}.-
            </span>
          </div>

          {/* Build progress indicator */}
          <Link
            to="/builder/overview"
            className="hidden lg:block text-lg font-bold tracking-tight"
          >
            {t('builder.footer.progress', {
              count: selectedItems.length,
            })}
          </Link>

          {/* Action buttons */}
          <div className="flex gap-3 w-full justify-end sm:w-auto">
            {children}
            <ButtonLink
              variant="danger"
              to={'/builder'}
              className="line-clamp-1 text-ellipsis flex items-center justify-center"
              onClick={() => setSelectedItems([])}
            >
              <RotateCcw className="size-5 md:hidden" />
              <span className="hidden md:inline-flex">
                {t('builder.footer.clear')}
              </span>
            </ButtonLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
