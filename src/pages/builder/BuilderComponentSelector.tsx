import { useLoaderData, useNavigate } from 'react-router-dom'
import { ComponentSelectorBox } from './BuilderStartPage'
import { Rule } from './builder-types'
import { useBuilderContext } from './useBuilderContext'

export const BuilderComponentSelector = () => {
  const component = useLoaderData() as Rule
  const push = useNavigate()
  const { selectedItems } = useBuilderContext()
  if (!component || component.type !== 'selection') {
    return <div>not correct!</div>
  }
  return (
    <div className="animate-fadeIn space-y-10 mx-auto max-w-6xl p-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center flex-wrap">
        {component.options
          .filter((d) => d.disabled == null || !d.disabled(selectedItems))
          .map((option, idx) => (
            <ComponentSelectorBox
              key={option.id}
              prefix={`builder.selector.${option.id}`}
              headerText="Choose"
              isRecommended={idx === 0}
              onClick={() => {
                push(`/builder/component/${option.id}?parentId=${component.id}`)
              }}
            />
          ))}
      </div>
    </div>
  )
}
