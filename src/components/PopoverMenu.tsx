import { PropsWithChildren, ReactNode, useId, useRef, useEffect } from 'react'

export const PopoverMenu = ({
  popover,
  className,
  children,
}: PropsWithChildren<{ popover: ReactNode; className?: string }>) => {
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (buttonRef.current) {
      const button = buttonRef.current

      const popover = document.getElementById(id)

      const onEnter = () => {
        const pos = button.getBoundingClientRect()
        if (popover == null) {
          return
        }

        Object.assign(popover!.style, {
          position: 'absolute',

          top: `${pos.bottom + window.scrollY}px`,
          left: `${pos.left + window.scrollX}px`,
        })
      }

      button.addEventListener('mousemove', onEnter)
      return () => {
        button.removeEventListener('mousemove', onEnter)
      }
    }
  }, [buttonRef])
  return (
    <>
      <button ref={buttonRef} popoverTarget={id}>
        {children}
      </button>
      <div id={id} role="tooltip" popover="" className={className}>
        {popover}
      </div>
    </>
  )
}
