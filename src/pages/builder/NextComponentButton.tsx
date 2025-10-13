import { useMemo } from 'react'
import { ButtonLink } from '../../components/ui/button'
import { useBuilderContext } from './useBuilderContext'
import { useBuilderStep } from './useBuilderStep'
import { Link } from 'react-router-dom'
import { StepForward } from 'lucide-react'
import { useTranslations } from '../../lib/hooks/useTranslations'
import { RuleId } from './builder-types'

export const NextComponentButton = ({
  componentId,
}: {
  componentId: RuleId
}) => {
  const { selectedItems } = useBuilderContext()
  const t = useTranslations()
  const hasSelection = useMemo(
    () =>
      selectedItems.length > 0 &&
      componentId != null &&
      selectedItems.some((d) => d.componentId === componentId),
    [selectedItems, componentId],
  )
  const [unselectedComponents, nextComponent] = useBuilderStep(componentId)

  return (
    <div className="group flex relative">
      {unselectedComponents.length > 1 && (
        <div className="absolute -bottom-0 mb-11 bg-white p-4 rounded-lg shadow-xl flex flex-col gap-2 opacity-0 group-hover:animate-pop-fast group-hover:opacity-100 transition-all duration-200 w-72 z-10 border border-gray-100">
          <div className="text-sm font-medium text-gray-500 border-b pb-2 mb-1">
            {t('builder.next.other')}
          </div>
          <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1.5">
            {unselectedComponents
              .filter((d) => d.id !== componentId)
              .map((d) => (
                <Link
                  to={`/builder/${d.type}/${d.id}`}
                  className="px-3 py-2 rounded-md bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors duration-200 flex items-center"
                  key={d.id}
                >
                  <span>{d.title}</span>
                </Link>
              ))}
          </div>
        </div>
      )}
      <ButtonLink
        to={
          nextComponent
            ? `/builder/${nextComponent.type}/${nextComponent.id}`
            : '/builder/overview'
        }
        variant={hasSelection ? 'default' : 'outline'}
      >
        <StepForward className="size-5 md:hidden" />
        <span className="hidden md:inline-flex">
          {nextComponent == null
            ? t('builder.overview')
            : t('builder.next.next', nextComponent)}
        </span>
      </ButtonLink>
    </div>
  )
}
