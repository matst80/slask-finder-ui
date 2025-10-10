import * as React from 'react'

interface RadioGroupContextValue {
  value: string
  name: string
  onValueChange: (value: string) => void
}

const RadioGroupContext = React.createContext<
  RadioGroupContextValue | undefined
>(undefined)

const useRadioGroup = () => {
  const context = React.useContext(RadioGroupContext)
  if (!context) {
    throw new Error(
      'RadioGroup components must be used within a RadioGroup provider',
    )
  }
  return context
}

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, onValueChange, className, children, ...props }, ref) => {
    const name = React.useId()
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
        <div
          ref={ref}
          className={`space-y-1.5 ${className}`}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  },
)
RadioGroup.displayName = 'RadioGroup'

interface RadioGroupItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  id?: string
}

const RadioGroupItem = React.forwardRef<HTMLDivElement, RadioGroupItemProps>(
  ({ className, id, value, ...props }, ref) => {
    const { value: groupValue, onValueChange, name } = useRadioGroup()
    const checked = value === groupValue

    return (
      <>
        <input
          id={id}
          type="radio"
          defaultChecked={checked}
          value={value}
          name={name}
          className="hidden"
          onChange={(e) => {
            if (e.target.checked) onValueChange(value)
          }}
        />
        <div
          ref={ref}
          className={`aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? 'bg-primary' : 'bg-background'
          } ${className}`}
          onClick={() => onValueChange(value)}
          aria-checked={checked}
          role="radio"
          tabIndex={0}
          {...props}
        >
          {checked && (
            <div className="flex h-full items-center justify-center relative">
              <div className="h-2 w-2 rounded-full bg-blue-600" />
            </div>
          )}
        </div>
      </>
    )
  },
)
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
