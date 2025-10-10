import { cm } from '../utils'

const sizes = {
  sm: 'size-5',
  md: 'size-10',
  lg: 'size-20',
  xl: 'size-40',
}

const variants = {
  overlay: 'bg-gray-200/50 flex w-full h-full items-center justify-center',
  default: 'flex w-full h-full items-center justify-center',
}

export const Loader = ({
  size,
  variant = 'default',
  show = true,
}: {
  size: keyof typeof sizes
  variant?: keyof typeof variants
  show?: boolean
}) => {
  return (
    show && (
      <div className={cm(variant && variants[variant])}>
        <div
          className={cm(
            sizes[size],
            'border-4 border-gray-200 aspect-square border-t-blue-500 rounded-full animate-spin',
          )}
        />
      </div>
    )
  )
}
