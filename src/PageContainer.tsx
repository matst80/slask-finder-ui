import { PropsWithChildren } from 'react'
import { SidebarMenu } from './components/SidebarMenu'
import { MiniCart } from './components/MiniCart'
import { CompareOverlay } from './components/CompareOverlay'

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
