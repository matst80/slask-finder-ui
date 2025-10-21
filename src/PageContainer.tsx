import { PropsWithChildren } from 'react'
import { CompareOverlay } from './components/CompareOverlay'
import { MiniCart } from './components/MiniCart'
import { SidebarMenu } from './components/SidebarMenu'

export const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <SidebarMenu />
      <MiniCart />
      {children}
      <CompareOverlay />
    </div>
  )
}
