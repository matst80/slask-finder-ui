import { useKeyboardAdminToggle } from '@matst80/slask-finder-sdk'
import { Outlet } from 'react-router-dom'

export const Admin = () => {
  useKeyboardAdminToggle()
  return (
    <>
      {/* <AdminNavBar /> */}
      <div className="p-2 md:p-10 min-h-screen">
        <Outlet />
        {/* <SaveButton /> */}
      </div>
    </>
  )
}
