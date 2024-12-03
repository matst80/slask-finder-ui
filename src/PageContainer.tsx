import React, { PropsWithChildren } from "react"
import { Navbar } from "./components/NavBar"

export const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
